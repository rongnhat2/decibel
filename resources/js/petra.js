import { getAptosWallets } from "@aptos-labs/wallet-standard";

// ===== STATE =====
let petraWallet = null;
let walletAddress = null;
let publicKey = null;
let authToken = localStorage.getItem("petra_token") || null;

// ===== DOM =====
const btnConnect = document.getElementById("btn-connect");
const btnDisconnect = document.getElementById("btn-disconnect");
const btnLogin = document.getElementById("btn-login");
const walletInfo = document.getElementById("wallet-info");
const walletAddrEl = document.getElementById("wallet-address");
const loginStatus = document.getElementById("login-status");

// ===== CSRF =====
function csrf() {
    return document.querySelector('meta[name="csrf-token"]').content;
}

// ===== INIT =====
window.addEventListener("load", () => {
    if (authToken) {
        loginStatus.textContent = "✅ Đã đăng nhập";
        btnLogin.style.display = "none";
        walletAddrEl.textContent = localStorage.getItem("petra_address") || "";
        walletInfo.style.display = "block";
        btnConnect.style.display = "none";
        btnDisconnect.style.display = "inline-block";
    }
});

// ===== TÌM PETRA =====
async function findPetraWallet() {
    return new Promise((resolve) => {
        const result = getAptosWallets();
        const wallets = result.aptosWallets;
        const on = result.on;

        console.log("wallets:", wallets);

        const found = wallets.find((w) => w.name === "Petra");
        if (found) return resolve(found);

        const timer = setTimeout(() => resolve(null), 5000);
        on("register", (w) => {
            if (w.name === "Petra") {
                clearTimeout(timer);
                resolve(w);
            }
        });
    });
}

// ===== CONNECT =====
btnConnect.addEventListener("click", async () => {
    btnConnect.textContent = "Đang tìm...";
    btnConnect.disabled = true;

    petraWallet = await findPetraWallet();

    btnConnect.textContent = "Connect Petra Wallet";
    btnConnect.disabled = false;

    if (!petraWallet) {
        alert("Không tìm thấy Petra! Cài extension rồi F5 lại.");
        window.open("https://petra.app/", "_blank");
        return;
    }

    try {
        const res = await petraWallet.features["aptos:connect"].connect();
        console.log("Connect res:", res);

        const account = res?.accounts?.[0] ?? res?.[0] ?? res;

        walletAddress =
            res?.address?.toString() ?? res?.args?.address?.toString();
        publicKey =
            res?.publicKey?.toString() ?? res?.args?.publicKey?.toString();

        console.log("✅ Address:", walletAddress);
        console.log("✅ PublicKey:", publicKey);

        localStorage.setItem("petra_address", walletAddress);

        walletAddrEl.textContent = walletAddress;
        walletInfo.style.display = "block";
        btnConnect.style.display = "none";
        btnLogin.style.display = "inline-block"; // hiện nút login
        btnDisconnect.style.display = "inline-block";
    } catch (err) {
        console.error(err);
        alert("Lỗi: " + (err.message || JSON.stringify(err)));
    }
});

// ===== LOGIN =====
btnLogin.addEventListener("click", async () => {
    if (!walletAddress) return alert("Chưa connect ví!");

    try {
        loginStatus.textContent = "⏳ Đang xác thực...";

        // Bước 0: Lấy CSRF cookie từ Sanctum TRƯỚC
        await fetch("/sanctum/csrf-cookie", {
            method: "GET",
            credentials: "include",
        });
        // Bước 1: Lấy nonce
        const nonceRes = await fetch("/api/auth/nonce", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json", // ← thêm
                "X-CSRF-TOKEN": csrf(),
            },
            body: JSON.stringify({ address: walletAddress }),
        });

        if (!nonceRes.ok) throw new Error("Không lấy được nonce");
        const { nonce } = await nonceRes.json();

        // Bước 2: Ký nonce
        const signResult = await petraWallet.features[
            "aptos:signMessage"
        ].signMessage({
            message: nonce,
            nonce: nonce,
        });

        console.log("signResult full:", signResult);

        // Lấy signature đúng — serialize thành string
        const rawSig =
            signResult?.signature ??
            signResult?.args?.signature ??
            signResult?.args;

        const signature =
            typeof rawSig === "string" ? rawSig : JSON.stringify(rawSig);

        console.log("signature string:", signature);

        console.log("signature:", signature);

        const verifyRes = await fetch("/api/auth/verify", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-CSRF-TOKEN": csrf(),
            },
            body: JSON.stringify({
                address: walletAddress,
                public_key: publicKey,
                signature: signature, // ← dùng biến này
                message: nonce,
            }),
        });

        const data = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(data.error || "Xác thực thất bại");

        authToken = data.token;
        localStorage.setItem("petra_token", authToken);
        localStorage.setItem("petra_user_id", data.user_id);
        localStorage.setItem("petra_address", data.address);

        loginStatus.textContent = "✅ Đăng nhập thành công!";
        btnLogin.style.display = "none";

        // Load balance
        const apt = await getAptBalance(walletAddress);
        document.getElementById("apt-balance").textContent = apt + " APT";
    } catch (err) {
        console.error(err);
        loginStatus.textContent = "❌ " + err.message;
    }
});
// ===== LẤY APT BALANCE =====
async function getAptBalance(address) {
    try {
        // Thử cách mới — dùng account balance API
        const url = `https://fullnode.testnet.aptoslabs.com/v1/accounts/${address}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log("Account data:", data);

        if (res.status === 404) return "0.0000";

        // Thử lấy qua view function
        const balRes = await fetch(
            "https://fullnode.testnet.aptoslabs.com/v1/view",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    function: "0x1::coin::balance",
                    type_arguments: ["0x1::aptos_coin::AptosCoin"],
                    arguments: [address],
                }),
            },
        );

        const balData = await balRes.json();
        console.log("Balance data:", balData);

        const octas = balData?.[0] ?? 0;
        return (octas / 1e8).toFixed(4);
    } catch (err) {
        console.error("Balance error:", err);
        return "0.0000";
    }
}
// ===== DISCONNECT =====
btnDisconnect.addEventListener("click", async () => {
    try {
        await petraWallet?.features["aptos:disconnect"]?.disconnect();
    } catch (_) {}

    petraWallet = walletAddress = publicKey = authToken = null;
    localStorage.removeItem("petra_token");
    localStorage.removeItem("petra_user_id");
    localStorage.removeItem("petra_address");

    walletInfo.style.display = "none";
    btnConnect.style.display = "inline-block";
    btnLogin.style.display = "none";
    btnDisconnect.style.display = "none";
    loginStatus.textContent = "";
});
