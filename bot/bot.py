#!/usr/bin/env python3
"""
run.py — Decibel Bot
====================
Điền .env rồi chạy: python run.py

Lần đầu: tự động tạo sub-account + approve builder fee + deposit USDC
Lần sau:  đọc SUBACCOUNT_ADDR từ .env và chạy bot luôn

.env cần có:
    PRIVATE_KEY       = 0x...        # export từ Petra
    BUILDER_ADDRESS   = 0x...        # địa chỉ ví của mày để nhận fee
    DECIBEL_API_KEY   = aptoslabs_.. # từ geomi.dev
    DEPOSIT_USDC      = 8            # số USDC deposit lần đầu (0 = bỏ qua)
    NETWORK           = mainnet
    MARKET            = APT-USD
    SUBACCOUNT_ADDR   =              # để trống — tự điền sau setup lần đầu
"""

import asyncio
import argparse
import json
import os
import sys
import time
import uuid
import signal
import datetime
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# ─────────────────────────────────────────────────────────────
# LOAD .env
# ─────────────────────────────────────────────────────────────
load_dotenv(override=True)

# ─────────────────────────────────────────────────────────────
# BCS TRANSACTION HELPER
# dùng cho cả setup và bot — thay thế submit_transaction cũ
# ─────────────────────────────────────────────────────────────
async def _submit_entry(client, account, function: str, ty_args: list, args: list) -> Optional[str]:
    """
    Submit EntryFunction transaction dùng JSON payload.
    Aptos node tự handle type conversion — tránh BCS Object/Address mismatch.
    """
    import aiohttp
    net = NETWORKS[NETWORK]

    # Serialize args thành JSON-compatible values
    def _json_arg(a):
        if isinstance(a, tuple):
            val, typ = a
            if typ == "u8":
                return int(val)
            if typ == "u64":
                return str(int(val))
            if typ == "bool":
                return bool(val)
            if typ == "option_str":
                return {"vec": [str(val)]} if val is not None else {"vec": []}
            if typ == "option_u64":
                return {"vec": [str(int(val))]} if val is not None else {"vec": []}
            if typ == "option_addr":
                return {"vec": [str(val)]} if val is not None else {"vec": []}
            if typ in ("address", "str"):
                return str(val)
            return val
        if a is None:
            return {"vec": []}   # Option::None
        if isinstance(a, bool):
            return a
        if isinstance(a, int):
            return str(a)        # u64 → string
        if isinstance(a, str):
            return a
        return str(a)

    json_args = [_json_arg(a) for a in args]

    # Lấy sequence number
    hdrs = {"Accept-Encoding": "identity", "Content-Type": "application/json"}
    if DECIBEL_API_KEY:
        hdrs["Authorization"] = f"Bearer {DECIBEL_API_KEY}"

    async with aiohttp.ClientSession() as s:
        # Get account info for sequence number
        async with s.get(
            f"{net['rest']}/accounts/{account.address()}",
            headers=hdrs
        ) as r:
            acc_data = await r.json(content_type=None)
            seq = int(acc_data.get("sequence_number", 0))

        # Get gas price
        async with s.get(
            f"{net['rest']}/estimate_gas_price",
            headers=hdrs
        ) as r:
            gas_data = await r.json(content_type=None)
            gas_price = int(gas_data.get("gas_estimate", 100))

        # Build payload
        expiry = int(time.time()) + 600
        payload = {
            "sender": str(account.address()),
            "sequence_number": str(seq),
            "max_gas_amount": "100000",
            "gas_unit_price": str(gas_price),
            "expiration_timestamp_secs": str(expiry),
            "payload": {
                "type": "entry_function_payload",
                "function": function,
                "type_arguments": ty_args,
                "arguments": json_args,
            },
        }

        # Sign
        async with s.post(
            f"{net['rest']}/transactions/encode_submission",
            json=payload, headers=hdrs
        ) as r:
            signing_msg = await r.json(content_type=None)
            if isinstance(signing_msg, dict) and "message" in signing_msg:
                raise Exception(f"encode_submission error: {signing_msg}")
            msg_bytes = bytes.fromhex(signing_msg.lstrip("0x") if isinstance(signing_msg, str) else signing_msg[2:])

        sig = account.sign(msg_bytes)
        payload["signature"] = {
            "type": "ed25519_signature",
            "public_key": str(account.public_key()),
            "signature": str(sig),
        }

        # Submit
        async with s.post(
            f"{net['rest']}/transactions",
            json=payload, headers=hdrs
        ) as r:
            result = await r.json(content_type=None)
            if isinstance(result, dict) and result.get("error_code"):
                raise Exception(f"Submit error: {result}")
            tx_hash = result.get("hash", "")

        # Wait
        for _ in range(30):
            await asyncio.sleep(1)
            async with s.get(
                f"{net['rest']}/transactions/by_hash/{tx_hash}",
                headers=hdrs
            ) as r:
                tx = await r.json(content_type=None)
                if tx.get("type") == "user_transaction":
                    if not tx.get("success", True):
                        raise Exception(f"{tx.get('vm_status')} - {tx_hash}")
                    return tx_hash

        return tx_hash

def _update_env(key: str, value: str):
    """Ghi/cập nhật một key trong .env không có dấu nháy."""
    env_file = Path(".env")
    lines = env_file.read_text(encoding="utf-8").splitlines() if env_file.exists() else []
    updated = False
    for i, line in enumerate(lines):
        if line.strip().startswith(f"{key}="):
            lines[i] = f"{key}={value}"
            updated = True
            break
    if not updated:
        lines.append(f"{key}={value}")
    env_file.write_text("\n".join(lines) + "\n", encoding="utf-8")
    os.environ[key] = value

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────
PRIVATE_KEY      = os.getenv("PRIVATE_KEY", "")
SUBACCOUNT_ADDR  = os.getenv("SUBACCOUNT_ADDR", "")
NETWORK          = os.getenv("NETWORK", "mainnet")
MARKET           = os.getenv("MARKET", "APT-USD")
BUILDER_ADDRESS  = os.getenv("BUILDER_ADDRESS", "")
BUILDER_FEE_BPS  = int(os.getenv("BUILDER_FEE_BPS", "2"))
DECIBEL_API_KEY  = os.getenv("DECIBEL_API_KEY", "")
DEPOSIT_USDC     = float(os.getenv("DEPOSIT_USDC", "0"))

NETWORKS = {
    "mainnet": {
        "rest":      "https://api.mainnet.aptoslabs.com/v1",
        "ws":        "wss://api.mainnet.aptoslabs.com/decibel/ws",
        "api":       "https://api.mainnet.aptoslabs.com/decibel",
        "package":   "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06",
        "usdc_meta": "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
        "usdc_dec":  6,
    },
    "testnet": {
        "rest":      "https://api.testnet.aptoslabs.com/v1",
        "ws":        "wss://api.testnet.aptoslabs.com/decibel/ws",
        "api":       "https://api.testnet.aptoslabs.com/decibel",
        "package":   "0x952535c3049e52f195f26798c2f1340d7dd5100edbe0f464e520a974d16fbe9f",
        "usdc_meta": "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832",
        "usdc_dec":  6,
    },
}

# Trading params — override qua .env hoặc bot_config.json nếu có
QUOTE_SIZE           = float(os.getenv("QUOTE_SIZE", "0.5"))
SPREAD_OFFSET_TICKS  = int(os.getenv("SPREAD_OFFSET_TICKS", "1"))
MAX_POSITION         = float(os.getenv("MAX_POSITION", "1.0"))
INVENTORY_HOLD_MS    = int(os.getenv("INVENTORY_HOLD_MS", "1500"))
MAX_INVENTORY_AGE_MS = int(os.getenv("MAX_INVENTORY_AGE_MS", "5000"))
PARTIAL_FLATTEN      = float(os.getenv("PARTIAL_FLATTEN_RATIO", "0.7"))
MAX_ORDER_AGE_MS     = int(os.getenv("MAX_ORDER_AGE_MS", "800"))
COOLDOWN_MS          = int(os.getenv("COOLDOWN_MS", "500"))
LOG_INTERVAL_S       = int(os.getenv("LOG_INTERVAL_S", "60"))

# ─────────────────────────────────────────────────────────────
# VALIDATE
# ─────────────────────────────────────────────────────────────
def validate():
    errors = []
    if not PRIVATE_KEY or PRIVATE_KEY == "0x":
        errors.append("PRIVATE_KEY chưa điền")
    if not BUILDER_ADDRESS:
        errors.append("BUILDER_ADDRESS chưa điền")
    elif not _valid_addr(BUILDER_ADDRESS):
        errors.append(f"BUILDER_ADDRESS sai format: {BUILDER_ADDRESS}")
    if NETWORK not in NETWORKS:
        errors.append(f"NETWORK phải là: {', '.join(NETWORKS.keys())}")
    if not DECIBEL_API_KEY or DECIBEL_API_KEY == "aptoslabs_":
        print("WARN: DECIBEL_API_KEY chưa điền — WS sẽ không authenticate")
    if errors:
        for e in errors:
            print(f"ERROR: {e}")
        sys.exit(1)

def _valid_addr(addr: str) -> bool:
    clean = addr.lower().lstrip("0x")
    return len(clean) == 64 and all(c in "0123456789abcdef" for c in clean)

def _norm_addr(addr: str) -> str:
    clean = addr.lower()
    if clean.startswith("0x"):
        clean = clean[2:]
    return "0x" + clean.zfill(64)

# ─────────────────────────────────────────────────────────────
# SETUP — tạo sub-account + approve fee + deposit
# ─────────────────────────────────────────────────────────────
async def run_setup():
    try:
        import aiohttp
        from aptos_sdk.account import Account
        from aptos_sdk.async_client import RestClient
    except ImportError as e:
        print(f"ERROR: Thiếu package — {e}")
        print("Chạy: pip install aptos-sdk aiohttp loguru websockets python-dotenv")
        sys.exit(1)

    net = NETWORKS[NETWORK]
    client = RestClient(net["rest"])
    master = Account.load_key(PRIVATE_KEY)
    addr   = str(master.address())

    print(f"\n{'─'*52}")
    print(f"  Wallet  : {addr}")
    print(f"  Network : {NETWORK}  |  Market: {MARKET}")
    print(f"{'─'*52}")

    # Check APT gas
    # Dùng aptos_sdk client trực tiếp — tránh Brotli encoding issue của aiohttp
    apt = 0.0
    try:
        import aiohttp as _ah
        _hdrs = {
            "Accept-Encoding": "identity",  # tắt Brotli/gzip compression
            "Content-Type": "application/json",
        }
        async with _ah.ClientSession(headers=_hdrs) as _s:
            async with _s.get(
                f"{net['rest']}/accounts/{addr}/resources",
                timeout=_ah.ClientTimeout(total=10)
            ) as _r:
                if _r.status == 200:
                    for res in await _r.json(content_type=None):
                        rtype = res.get("type", "")
                        data  = res.get("data", {})
                        if "CoinStore<0x1::aptos_coin::AptosCoin>" in rtype:
                            apt = int(data.get("coin", {}).get("value", 0)) / 1e8
                            break
                        if "0x1::fungible_asset::FungibleStore" in rtype:
                            meta = data.get("metadata", {}).get("inner", "")
                            if "0xa" == meta.lower() or "aptos_coin" in meta.lower():
                                apt = int(data.get("balance", 0)) / 1e8
                                break
    except Exception as e:
        print(f"WARN: Không đọc được APT balance ({e})")

    if apt > 0:
        print(f"  APT gas : {apt:.4f}")
        if apt < 0.005:
            print("ERROR: APT quá thấp. Cần ít nhất 0.005 APT.")
            sys.exit(1)
    else:
        # Không đọc được balance nhưng account tồn tại → tiếp tục
        # (Aptos FA standard có thể lưu balance ở chỗ khác)
        print(f"  APT gas : (không đọc được — giả sử có đủ, tiếp tục)")
        print(f"  Nếu TX thất bại vì thiếu gas, hãy thêm APT vào ví.")

    async def tx(function, args=None):
        try:
            h = await _submit_entry(client, master, function, [], args or [])
            return h
        except Exception as e:
            print(f"  TX failed: {e}")
            return None

    # Step 1 — tạo sub-account
    print("\nStep 1/3 — Tạo sub-account...")
    h = await tx(f"{net['package']}::dex_accounts_entry::create_new_subaccount")
    if not h:
        sys.exit(1)

    # Parse sub-account address từ tx events / changes
    subaccount = None
    try:
        info = await client.transaction_by_hash(h)
        master_low = addr.lower()
        for event in info.get("events", []):
            if "subaccount" in event.get("type", "").lower():
                for key in ("subaccount", "subaccount_addr", "account", "address"):
                    a = event.get("data", {}).get(key, "")
                    if a and a.lower() != master_low and _valid_addr(a):
                        subaccount = _norm_addr(a)
                        break
            if subaccount:
                break
        if not subaccount:
            for ch in info.get("changes", []):
                if ch.get("type") != "write_resource":
                    continue
                rtype = ch.get("data", {}).get("type", "").lower()
                a = ch.get("address", "").lower()
                if "subaccount" in rtype and a != master_low and _valid_addr(a):
                    subaccount = _norm_addr(a)
                    break
    except Exception as e:
        print(f"  WARN: parse subaccount address failed — {e}")

    if not subaccount:
        print("ERROR: Không parse được subaccount address từ tx.")
        sys.exit(1)

    print(f"  ✓ Sub-account : {subaccount}")
    _update_env("SUBACCOUNT_ADDR", subaccount)
    print(f"  ✓ Đã lưu vào .env")

    # Step 2 — approve builder fee
    builder = _norm_addr(BUILDER_ADDRESS)
    max_bps = BUILDER_FEE_BPS + 5
    print(f"\nStep 2/3 — Approve builder fee ({max_bps} bps)...")
    h2 = await tx(
        f"{net['package']}::dex_accounts_entry::approve_max_builder_fee_for_subaccount",
        [subaccount, builder, (max_bps, "u64")]
    )
    if h2:
        print(f"  ✓ Builder fee approved")
    else:
        print("  WARN: Approve thất bại — bot sẽ chạy không có builder code")

    # Step 3 — deposit USDC
    if DEPOSIT_USDC > 0:
        print(f"\nStep 3/3 — Deposit {DEPOSIT_USDC} USDC...")
        amount = int(DEPOSIT_USDC * 10 ** net["usdc_dec"])
        h3 = await tx(
            f"{net['package']}::dex_accounts_entry::deposit_to_subaccount_at",
            [subaccount, net["usdc_meta"], amount]
        )
        if h3:
            print(f"  ✓ Đã deposit {DEPOSIT_USDC} USDC")
        else:
            print("  FAILED: Deposit thất bại. Kiểm tra USDC balance trong ví.")
    else:
        print("\nStep 3/3 — Bỏ qua (DEPOSIT_USDC=0)")

    print(f"\n{'─'*52}")
    print("Setup xong. Khởi động bot...\n")
    return subaccount

# ─────────────────────────────────────────────────────────────
# BOT
# ─────────────────────────────────────────────────────────────
class State(Enum):
    INIT             = "INIT"
    FLAT_QUOTING     = "FLAT_QUOTING"
    RISK_REDUCTION   = "RISK_REDUCTION"
    HOLDING_INVENTORY = "HOLDING_INVENTORY"
    FINAL_FLATTEN    = "FINAL_FLATTEN"
    RECOVERY         = "RECOVERY"

@dataclass
class OB:
    bids: list = field(default_factory=list)
    asks: list = field(default_factory=list)
    mid: float = 0.0
    mark: float = 0.0
    updated: float = 0.0

@dataclass
class Pos:
    size: float = 0.0
    entry: float = 0.0
    upnl: float = 0.0

@dataclass
class Order:
    cid: str; oid: str; buy: bool; price: float; size: float; placed: float

class Stats:
    def __init__(self):
        self.start = time.time()
        self.session_vol = 0.0
        self.fills = 0
        self.errors = 0
        self.reconnects = 0
        self._date = ""
        self._dvol = 0.0

    def fill(self, vol):
        self.session_vol += vol
        self.fills += 1
        today = datetime.datetime.utcnow().strftime("%Y-%m-%d")
        if today != self._date:
            self._date = today
            self._dvol = 0.0
        self._dvol += vol

    @property
    def daily_vol(self):
        return self._dvol if datetime.datetime.utcnow().strftime("%Y-%m-%d") == self._date else 0.0

    def tph(self):
        return self.fills / max((time.time() - self.start) / 3600, 0.001)

def _p2c(price, dec): return int(price * 10**dec)
def _s2c(size, dec):  return int(size  * 10**dec)

def _round_price(p, mkt):
    if p <= 0: return 0.0
    d = p * 10**mkt["px_dec"]
    return round(round(d / mkt["tick"]) * mkt["tick"]) / 10**mkt["px_dec"]

def _round_size(s, mkt):
    if s <= 0: return 0.0
    mn = mkt["min_sz"] / 10**mkt["sz_dec"]
    if s < mn: return mn
    d = s * 10**mkt["sz_dec"]
    return round(round(d / mkt["lot"]) * mkt["lot"]) / 10**mkt["sz_dec"]

def _api_headers():
    """Headers bắt buộc cho Decibel REST API."""
    h = {
        "Origin":          "https://app.decibel.trade/trade",
        "Accept":          "application/json",
        "Accept-Encoding": "identity",
    }
    if DECIBEL_API_KEY:
        h["Authorization"] = f"Bearer {DECIBEL_API_KEY}"
    return h

async def _get_market(session, subaccount):
    net = NETWORKS[NETWORK]
    async with session.get(
        f"{net['api']}/api/v1/markets",
        headers=_api_headers()
    ) as r:
        data = await r.json(content_type=None)
        # Debug — xem response thực tế
        if not isinstance(data, list) and "markets" not in data:
            print(f"[DEBUG] /markets response keys: {list(data.keys()) if isinstance(data, dict) else type(data)}")
            print(f"[DEBUG] raw: {str(data)[:300]}")
        # API trả về list trực tiếp hoặc dict với key "markets"
        markets = data if isinstance(data, list) else data.get("markets", [])
        for m in markets:
            if m.get("market_name") == MARKET:
                return {
                    "addr":   m["market_addr"],
                    "name":   m["market_name"],
                    "px_dec": m.get("px_decimals", 9),
                    "sz_dec": m.get("sz_decimals", 9),
                    "tick":   m.get("tick_size", 1),
                    "lot":    m.get("lot_size", 1),
                    "min_sz": m.get("min_size", 1),
                }
    raise RuntimeError(f"Market {MARKET} không tìm thấy")

async def _get_positions(session, subaccount):
    net = NETWORKS[NETWORK]
    async with session.get(
        f"{net['api']}/api/v1/account_positions",
        params={"account": subaccount},
        headers=_api_headers()
    ) as r:
        data = await r.json(content_type=None)
        # API có thể trả về list trực tiếp hoặc {"positions": [...]}
        if isinstance(data, list):
            return data
        return data.get("positions", [])

async def _get_orders(session, subaccount):
    net = NETWORKS[NETWORK]
    async with session.get(
        f"{net['api']}/api/v1/open_orders",
        params={"account": subaccount},
        headers=_api_headers()
    ) as r:
        data = await r.json(content_type=None)
        # API có thể trả về list trực tiếp hoặc {"orders": [...]}
        if isinstance(data, list):
            return data
        return data.get("orders", [])

class Bot:
    def __init__(self, subaccount):
        from aptos_sdk.account import Account
        from aptos_sdk.async_client import RestClient
        self.net     = NETWORKS[NETWORK]
        self.pkg     = self.net["package"]
        self.account = Account.load_key(PRIVATE_KEY)
        self.client  = RestClient(self.net["rest"])
        self.subaccount = subaccount
        self.builder    = _norm_addr(BUILDER_ADDRESS)
        self.approved_max_bps = BUILDER_FEE_BPS + 5

        self.state   = State.INIT
        self.mkt     = None
        self.ob      = OB()
        self.pos     = Pos()
        self.orders: dict[str, Order] = {}
        self.stats   = Stats()
        self.inv_since: Optional[float] = None
        self._running = False

    # ── TX ────────────────────────────────────────────────────
    async def _tx(self, function: str, args: list = None) -> Optional[str]:
        try:
            return await _submit_entry(self.client, self.account, function, [], args or [])
        except Exception as e:
            print(f"[{MARKET}] TX error: {e}")
            self.stats.errors += 1
            return None

    async def _place(self, price, size, buy, tif=0, reduce=False, cid=None):
        cid = cid or uuid.uuid4().hex[:20]
        cp = _p2c(_round_price(price, self.mkt), self.mkt["px_dec"])
        cs = _s2c(_round_size(size,  self.mkt), self.mkt["sz_dec"])
        if cp == 0 or cs == 0:
            return None, None

        if BUILDER_FEE_BPS > self.approved_max_bps:
            print(f"[{MARKET}] ERROR: builder_fee {BUILDER_FEE_BPS} > approved {self.approved_max_bps}")
            return None, None

        # Builder code — chỉ attach nếu BUILDER_FEE_BPS > 0
        builder_addr_arg = (self.builder, "option_addr") if BUILDER_FEE_BPS > 0 else (None, "option_addr")
        builder_fee_arg  = (BUILDER_FEE_BPS, "option_u64") if BUILDER_FEE_BPS > 0 else (None, "option_u64")

        h = await self._tx(
            f"{self.pkg}::dex_accounts_entry::place_order_to_subaccount",
            [
                self.subaccount,                   # Object<Subaccount>
                self.mkt["addr"],                  # Object<PerpMarket>
                cp,                                # u64 price
                cs,                                # u64 size
                buy,                               # bool is_buy
                (tif, "u8"),                       # u8 time_in_force
                reduce,                            # bool is_reduce_only
                (cid, "option_str"),               # Option<String> client_order_id
                (None, "option_u64"),              # Option<u64> stop_price
                (None, "option_u64"),              # Option<u64> tp_trigger_price
                (None, "option_u64"),              # Option<u64> tp_limit_price
                (None, "option_u64"),              # Option<u64> sl_trigger_price
                (None, "option_u64"),              # Option<u64> sl_limit_price
                builder_addr_arg,                  # Option<address> builder_address
                builder_fee_arg,                   # Option<u64> builder_fees
            ]
        )
        if not h:
            print(f"[{MARKET}] DEBUG subaccount={self.subaccount}")
            print(f"[{MARKET}] DEBUG signer={self.account.address()}")
        if h:
            print(f"[{MARKET}] {'BUY' if buy else 'SELL'} {size:.4f} @ {price:.4f} "
                  f"tif={tif} cid={cid} fee={BUILDER_FEE_BPS}bps")
        return h, cid

    async def _cancel(self, cid):
        await self._tx(
            f"{self.pkg}::dex_accounts_entry::cancel_client_order_to_subaccount",
            [self.subaccount, cid, self.mkt["addr"]]
        )
        self.orders.pop(cid, None)

    async def _cancel_all(self):
        for cid in list(self.orders):
            await self._cancel(cid)
        self.orders.clear()

    # ── RECOVERY ─────────────────────────────────────────────
    async def _recovery(self):
        print(f"[{MARKET}] RECOVERY...")
        self.stats.reconnects += 1
        await self._cancel_all()
        import aiohttp
        try:
            async with aiohttp.ClientSession() as s:
                positions = await _get_positions(s, self.subaccount)
                for p in positions:
                    if p.get("market_name") == MARKET:
                        sz   = float(p.get("size", 0))
                        side = p.get("side", "long").lower()
                        self.pos.size  = sz if side == "long" else -sz
                        self.pos.entry = float(p.get("entry_price", 0))
                        break
                orders = await _get_orders(s, self.subaccount)
                self.orders.clear()
                for o in orders:
                    if o.get("market_name") == MARKET:
                        cid = o.get("client_order_id", "")
                        if cid:
                            self.orders[cid] = Order(
                                cid=cid, oid=o.get("order_id",""),
                                buy=o.get("is_buy", True),
                                price=float(o.get("price",0)),
                                size=float(o.get("size",0)),
                                placed=time.time()
                            )
        except Exception as e:
            print(f"[{MARKET}] REST sync error: {e}")

        if abs(self.pos.size) > 1e-9:
            await self._cancel_all()
            await self._final_flatten()

        self.state = State.FLAT_QUOTING
        print(f"[{MARKET}] Recovery done → FLAT_QUOTING")

    # ── FLATTEN ───────────────────────────────────────────────
    async def _partial_flatten(self):
        pos = self.pos.size
        if abs(pos) < 1e-9:
            self.state = State.FLAT_QUOTING
            self.inv_since = None
            return
        size = _round_size(abs(pos) * PARTIAL_FLATTEN, self.mkt)
        buy  = pos < 0
        if self.ob.mid <= 0: return
        await self._place(self.ob.mid, size, buy, tif=2, reduce=True)

    async def _final_flatten(self):
        pos = self.pos.size
        if abs(pos) < 1e-9:
            self.inv_since = None
            return
        if self.ob.mid <= 0:
            print(f"[{MARKET}] No mid price for flatten")
            return
        size = _round_size(abs(pos), self.mkt)
        await self._place(self.ob.mid, size, pos < 0, tif=2, reduce=True)
        self.inv_since = None

    # ── QUOTE ─────────────────────────────────────────────────
    async def _quote(self):
        mid = self.ob.mid
        if mid <= 0 or (time.time() - self.ob.updated) > 5:
            return
        tick   = self.mkt["tick"] / 10**self.mkt["px_dec"]
        bid    = _round_price(mid - SPREAD_OFFSET_TICKS * tick, self.mkt)
        ask    = _round_price(mid + SPREAD_OFFSET_TICKS * tick, self.mkt)
        size   = _round_size(QUOTE_SIZE, self.mkt)
        now    = time.time()

        # Cancel stale
        for cid, o in list(self.orders.items()):
            if (now - o.placed) * 1000 > MAX_ORDER_AGE_MS:
                await self._cancel(cid)

        has_bid = any(o.buy for o in self.orders.values())
        has_ask = any(not o.buy for o in self.orders.values())

        if not has_bid:
            _, cid = await self._place(bid, size, True, tif=0)
            if cid:
                self.orders[cid] = Order(cid=cid, oid="", buy=True,
                                         price=bid, size=size, placed=time.time())

        if not has_ask:
            _, cid = await self._place(ask, size, False, tif=0)
            if cid:
                self.orders[cid] = Order(cid=cid, oid="", buy=False,
                                         price=ask, size=size, placed=time.time())

    # ── FILL HANDLER ──────────────────────────────────────────
    async def _on_fill(self, cid, oid, buy, price, size):
        side = "BUY" if buy else "SELL"
        if buy:  self.pos.size += size
        else:    self.pos.size -= size
        self.stats.fill(size * price)
        print(f"[{MARKET}] FILL {side} {size:.6f} @ {price:.4f} | pos={self.pos.size:+.6f}")
        self.orders.pop(cid, None)
        if self.inv_since is None and abs(self.pos.size) > 1e-9:
            self.inv_since = time.time()
        if self.state == State.FLAT_QUOTING:
            for c, o in list(self.orders.items()):
                if o.buy != buy:
                    await self._cancel(c)
            self.state = State.RISK_REDUCTION

    # ── WEBSOCKET ─────────────────────────────────────────────
    async def _ws_loop(self):
        import websockets
        sub  = self.subaccount
        mkt  = self.mkt["addr"]
        url  = self.net["ws"]

        extra_headers = {"Origin": "https://app.decibel.trade"}

        ws_kwargs = {
            "additional_headers": extra_headers,
            "subprotocols": ["decibel", DECIBEL_API_KEY] if DECIBEL_API_KEY else ["decibel"],
            "ping_interval": 25,
            "ping_timeout": 60,
            "close_timeout": 5,
        }

        topics = [
            f"depth:{mkt}",
            f"market_price:{mkt}",
            f"order_updates:{sub}",
            f"account_open_orders:{sub}",
            f"account_positions:{sub}",
            f"user_trades:{sub}",
        ]
        backoff = 1
        while self._running:
            try:
                async with websockets.connect(url, **ws_kwargs) as ws:
                    backoff = 1
                    print(f"[{MARKET}] WS connected")
                    for t in topics:
                        await ws.send(json.dumps({"method": "subscribe", "topic": t}))
                    async for raw in ws:
                        if not self._running: break
                        await self._handle_ws(raw)
            except Exception as e:
                print(f"[{MARKET}] WS error: {e}. Retry in {backoff}s")
                self.stats.reconnects += 1
                self.state = State.RECOVERY
            if self._running:
                await asyncio.sleep(backoff)
                backoff = min(backoff * 2, 30)

    async def _handle_ws(self, raw):
        try: msg = json.loads(raw)
        except: return

        # Bỏ qua subscribe ACK
        if msg.get("method") == "subscribe":
            return

        topic = msg.get("topic", "")
        mkt   = self.mkt["addr"]

        # depth:<market>:<seq> — bids/asks ở root level, dạng [{"price":..., "size":...}]
        if topic.startswith(f"depth:{mkt}"):
            bids = msg.get("bids") or []
            asks = msg.get("asks") or []
            if bids:
                self.ob.bids = [(float(b["price"]), float(b["size"])) for b in bids]
            if asks:
                self.ob.asks = [(float(a["price"]), float(a["size"])) for a in asks]
            if self.ob.bids and self.ob.asks:
                self.ob.mid = (self.ob.bids[0][0] + self.ob.asks[0][0]) / 2
            self.ob.updated = time.time()

        # market_price — data nằm trong key "price"
        elif topic.startswith(f"market_price:{mkt}"):
            price_data = msg.get("price", {})
            mp = price_data.get("mark_px") or price_data.get("oracle_px")
            if mp:
                self.ob.mark = float(mp)

        # order_updates — update order status
        elif topic.startswith("order_updates:"):
            data = msg.get("order", msg)
            cid  = data.get("client_order_id", "")
            oid  = data.get("order_id", "")
            if cid in self.orders and oid:
                self.orders[cid].oid = oid
            status = data.get("status", "").lower()
            if status in ("cancelled", "expired", "rejected", "filled"):
                self.orders.pop(cid, None)

        # account_open_orders — list orders
        elif topic.startswith("account_open_orders:"):
            orders = msg.get("orders", [])
            self.orders.clear()
            for o in orders:
                cid = o.get("client_order_id", "")
                if cid:
                    self.orders[cid] = Order(
                        cid=cid, oid=o.get("order_id", ""),
                        buy=o.get("is_buy", True),
                        price=float(o.get("price", 0)),
                        size=float(o.get("size", 0)),
                        placed=time.time()
                    )

        # user_trades — fill handler
        elif topic.startswith("user_trades:"):
            trade = msg.get("trade", msg)
            size  = float(trade.get("size", 0))
            price = float(trade.get("price", 0))
            if size > 0 and price > 0:
                await self._on_fill(
                    trade.get("client_order_id", ""),
                    trade.get("order_id", ""),
                    trade.get("is_buy", True),
                    price, size,
                )

        # account_positions — list positions
        elif topic.startswith("account_positions:"):
            positions = msg.get("positions", [])
            # Reset nếu không có position
            if not positions:
                self.pos.size  = 0.0
                self.pos.entry = 0.0
                self.pos.upnl  = 0.0
                return
            for p in positions:
                sz = float(p.get("size", 0))
                sd = p.get("side", "long").lower()
                self.pos.size  = sz if sd == "long" else -sz
                self.pos.entry = float(p.get("entry_price", 0))
                self.pos.upnl  = float(p.get("unrealized_pnl", 0))

    # ── MAIN LOOP ─────────────────────────────────────────────
    async def _loop(self):
        last_log = 0.0
        while self._running:
            try:
                now = time.time()
                if now - last_log >= LOG_INTERVAL_S:
                    bids = sum(1 for o in self.orders.values() if o.buy)
                    asks = sum(1 for o in self.orders.values() if not o.buy)
                    print(
                        f"\n{'─'*52}\n"
                        f"[{MARKET}] {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
                        f"  State        : {self.state.value}\n"
                        f"  Position     : {self.pos.size:+.6f} (entry={self.pos.entry:.4f} upnl={self.pos.upnl:+.4f})\n"
                        f"  Mid / Mark   : {self.ob.mid:.4f} / {self.ob.mark:.4f}\n"
                        f"  Open orders  : {len(self.orders)} (bid={bids} ask={asks})\n"
                        f"  Daily volume : {self.stats.daily_vol:.4f}\n"
                        f"  Session vol  : {self.stats.session_vol:.4f} ({self.stats.fills} fills)\n"
                        f"  t/hr         : {self.stats.tph():.1f}\n"
                        f"  Errors       : {self.stats.errors}\n"
                        f"  Reconnects   : {self.stats.reconnects}\n"
                        f"{'─'*52}"
                    )
                    last_log = now

                # Risk breach
                if abs(self.pos.size) > MAX_POSITION:
                    print(f"[{MARKET}] RISK BREACH pos={self.pos.size:+.6f}")
                    self.stats.errors += 1
                    await self._cancel_all()
                    await self._final_flatten()
                    self.state = State.FLAT_QUOTING
                    await asyncio.sleep(COOLDOWN_MS / 1000)
                    continue

                # Inventory age
                if self.inv_since and (time.time() - self.inv_since) * 1000 > MAX_INVENTORY_AGE_MS:
                    print(f"[{MARKET}] Inventory age exceeded → FINAL_FLATTEN")
                    self.state = State.FINAL_FLATTEN

                # State machine
                if self.state == State.INIT:
                    await self._recovery()
                elif self.state == State.FLAT_QUOTING:
                    await self._quote()
                    await asyncio.sleep(COOLDOWN_MS / 1000)
                elif self.state == State.RISK_REDUCTION:
                    await self._partial_flatten()
                    await asyncio.sleep(INVENTORY_HOLD_MS / 1000)
                    self.state = State.HOLDING_INVENTORY
                elif self.state == State.HOLDING_INVENTORY:
                    if self.inv_since and (time.time() - self.inv_since) * 1000 >= INVENTORY_HOLD_MS:
                        self.state = State.FINAL_FLATTEN
                    else:
                        await asyncio.sleep(0.1)
                elif self.state == State.FINAL_FLATTEN:
                    await self._cancel_all()
                    await self._final_flatten()
                    await asyncio.sleep(COOLDOWN_MS / 1000)
                    self.state = State.FLAT_QUOTING
                elif self.state == State.RECOVERY:
                    await self._recovery()

            except asyncio.CancelledError:
                break
            except Exception as e:
                self.stats.errors += 1
                print(f"[{MARKET}] Loop error: {e}")
                self.state = State.RECOVERY
                await asyncio.sleep(2)

    async def _shutdown(self):
        print(f"\n[{MARKET}] SHUTDOWN — cancelling all orders...")
        self._running = False
        await self._cancel_all()
        if abs(self.pos.size) > 1e-9:
            print(f"[{MARKET}] Flattening position {self.pos.size:+.6f}...")
            await self._final_flatten()
            await asyncio.sleep(3)
        print(f"[{MARKET}] Clean shutdown done.")

    async def run(self):
        import aiohttp
        print(f"[{MARKET}] Starting bot | subaccount={self.subaccount[:16]}...")

        async with aiohttp.ClientSession() as s:
            self.mkt = await _get_market(s, self.subaccount)
        print(f"[{MARKET}] Market: {self.mkt['name']} @ {self.mkt['addr'][:16]}...")
        print(f"[{MARKET}] Builder: {self.builder[:18]}... fee={BUILDER_FEE_BPS}bps")

        self._running = True
        self.state    = State.INIT

        # Signal handler cho Unix/Linux
        loop = asyncio.get_event_loop()
        def _sig():
            asyncio.create_task(self._shutdown())
        for sig in (signal.SIGINT, signal.SIGTERM):
            try: loop.add_signal_handler(sig, _sig)
            except Exception:
                pass  # Windows không support add_signal_handler

        try:
            await asyncio.gather(
                self._ws_loop(),
                self._loop(),
                return_exceptions=True,
            )
        except (KeyboardInterrupt, asyncio.CancelledError):
            # Windows Ctrl+C đến đây
            await self._shutdown()

# ─────────────────────────────────────────────────────────────
# ENTRY
# ─────────────────────────────────────────────────────────────
async def main():
    validate()

    subaccount = SUBACCOUNT_ADDR

    # Nếu chưa có sub-account → chạy setup
    if not subaccount:
        print("SUBACCOUNT_ADDR chưa có → chạy setup...")
        subaccount = await run_setup()
        # Reload từ env sau khi update
        subaccount = os.getenv("SUBACCOUNT_ADDR", subaccount)

    os.makedirs("logs", exist_ok=True)
    try:
        from loguru import logger
        logger.add(
            f"logs/{MARKET.replace('/','-')}_{{}}.log".replace("{}", "{time:YYYY-MM-DD}"),
            rotation="00:00", retention="14 days", level="DEBUG",
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level:<8} | {message}",
            enqueue=True,
        )
    except ImportError:
        pass

    # Approve builder fee nếu được yêu cầu (APPROVE_FEE=1 trong .env)
    # Chỉ cần chạy 1 lần, sau đó set APPROVE_FEE=0
    if os.getenv("APPROVE_FEE", "0") == "1":
        from aptos_sdk.account import Account
        from aptos_sdk.async_client import RestClient
        net = NETWORKS[NETWORK]
        account = Account.load_key(PRIVATE_KEY)
        client  = RestClient(net["rest"])
        builder = _norm_addr(BUILDER_ADDRESS)
        max_bps = BUILDER_FEE_BPS + 5
        print(f"Approving builder fee ({max_bps} bps)...")
        print(f"  subaccount: {subaccount}")
        print(f"  builder: {builder}")
        print(f"  max_bps: {max_bps}")
        try:
            h = await _submit_entry(
                client, account,
                f"{net['package']}::dex_accounts_entry::approve_max_builder_fee_for_subaccount",
                [], [subaccount, builder, (max_bps, "u64")]
            )
            print(f"  ✓ Builder fee approved: {h}")
            _update_env("APPROVE_FEE", "0")
        except Exception as e:
            print(f"  WARN: Approve fee failed — {e}")
            print("  Bot sẽ chạy nhưng lệnh có thể bị reject nếu chưa approve")

    bot = Bot(subaccount)
    await bot.run()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nBot stopped.")