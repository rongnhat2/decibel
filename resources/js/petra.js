import { getAptosWallets } from "@aptos-labs/wallet-standard";

// ===== STATE =====
let petraWallet = null;
let walletAddress = null;
let publicKey = null;
let authToken = localStorage.getItem("petra_token") || null;

// ===== DOM =====
const btnConnect = document.getElementById("btn-connect");
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
        const fullAddr = localStorage.getItem("petra_address") || "";
        walletAddrEl.textContent = `${fullAddr.slice(0, 6)}...${fullAddr.slice(-6)}`;
        walletInfo.style.display = "block";
        btnConnect.style.display = "none";
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
    btnConnect.textContent = "Finding Petra Wallet...";
    btnConnect.disabled = true;

    petraWallet = await findPetraWallet();

    btnConnect.textContent = "Connecting to Petra Wallet";
    btnConnect.disabled = false;

    if (!petraWallet) {
        alert(
            "Petra Wallet not found! Please install the extension and refresh the page.",
        );
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

        const fullAddr = walletAddress;
        walletAddrEl.textContent = `${fullAddr.slice(0, 6)}...${fullAddr.slice(-6)}`;
        walletInfo.style.display = "block";
        btnConnect.style.display = "none";
        btnLogin.style.display = "inline-block"; // hiện nút login
    } catch (err) {
        console.error(err);
        alert("Lỗi: " + (err.message || JSON.stringify(err)));
    }
});

// ===== LOGIN =====
btnLogin.addEventListener("click", async () => {
    if (!walletAddress) return alert("Chưa connect ví!");

    try {
        loginStatus.textContent = "⏳ Verifying...";

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
        if (!verifyRes.ok) throw new Error(data.error || "Verification failed");

        authToken = data.token;
        localStorage.setItem("petra_temp_token", data.token);
        localStorage.setItem("petra_temp_user_id", data.user_id);
        localStorage.setItem("petra_temp_address", data.address);

        loginStatus.textContent = "✅ Login successful!";
        btnLogin.style.display = "none";

        // Lưu JWT vào cookie để Laravel middleware đọc
        document.cookie = `jwt_token=${authToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
        console.log("authToken:", authToken);
        console.log("document.cookie:", document.cookie);
        // Redirect về trang chủ
        window.location.href = "/";
    } catch (err) {
        console.error(err);
        loginStatus.textContent = "❌ " + err.message;
    }
});
window.addEventListener("load", () => {
    const token = localStorage.getItem("petra_token");
    if (token) {
        window.location.href = "/";
        return;
    }
});
