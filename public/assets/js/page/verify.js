import { getAptosWallets } from "@aptos-labs/wallet-standard";

let walletAddress = null;
let publicKey = null;
let petraWallet = null;
let authToken = localStorage.getItem("petra_token") || null;

const btnConnect = document.getElementById("btn-connect");
const btnLogin = document.getElementById("btn-login");
const btnDisconnect = document.getElementById("btn-disconnect");
const walletInfo = document.getElementById("wallet-info");
const walletAddrEl = document.getElementById("wallet-address");
const loginStatus = document.getElementById("login-status");

window.addEventListener("load", async () => {
    if (authToken) loginStatus.textContent = "Đã đăng nhập!";

    btnConnect.addEventListener("click", connectWallet);
    btnDisconnect.addEventListener("click", disconnectWallet);
    btnLogin.addEventListener("click", loginWithLaravel);
});

// ===== TÌM PETRA =====
async function findPetraWallet() {
    return new Promise((resolve) => {
        const { wallets, on } = getAptosWallets();

        console.log("Wallets ngay lúc gọi:", wallets);

        // Tìm ngay nếu có rồi
        const found = wallets.find((w) => w.name === "Petra");
        if (found) return resolve(found);

        // Chờ Petra đăng ký, timeout 5 giây
        const timer = setTimeout(() => {
            console.log("Timeout - wallets lúc này:", wallets);
            resolve(null);
        }, 5000);

        on("register", (wallet) => {
            console.log("Wallet registered:", wallet.name, wallet);
            if (wallet.name === "Petra") {
                clearTimeout(timer);
                resolve(wallet);
            }
        });
    });
}

// ===== CONNECT =====
async function connectWallet() {
    btnConnect.disabled = true;
    btnConnect.textContent = "Đang tìm ví...";

    petraWallet = await findPetraWallet();

    btnConnect.disabled = false;
    btnConnect.textContent = "Connect Petra Wallet";

    if (!petraWallet) {
        const install = confirm("Không tìm thấy Petra. Mở trang cài không?");
        if (install) window.open("https://petra.app/", "_blank");
        return;
    }

    try {
        console.log("Petra features:", Object.keys(petraWallet.features));

        const res = await petraWallet.features["aptos:connect"].connect();
        console.log("Connect response:", res);

        const account = res?.accounts?.[0] ?? res?.[0] ?? res;
        walletAddress = account?.address?.toString();
        publicKey = account?.publicKey?.toString();

        console.log("✅ Address:", walletAddress);
        console.log("✅ PublicKey:", publicKey);

        walletAddrEl.textContent = walletAddress;
        walletInfo.style.display = "block";
        btnConnect.style.display = "none";
        btnLogin.style.display = "inline-block";
        btnDisconnect.style.display = "inline-block";
    } catch (err) {
        console.error("Connect thất bại:", err);
        alert("Lỗi: " + (err.message || JSON.stringify(err)));
    }
}

// ===== LOGIN =====
async function loginWithLaravel() {
    if (!walletAddress) return alert("Chưa connect ví!");

    try {
        const nonceRes = await fetch("/api/auth/nonce", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector(
                    'meta[name="csrf-token"]',
                ).content,
            },
            body: JSON.stringify({ address: walletAddress }),
        });
        const { nonce } = await nonceRes.json();

        const signResult = await petraWallet.features[
            "aptos:signMessage"
        ].signMessage({
            message: nonce,
            nonce: nonce,
        });
        console.log("Sign result:", signResult);

        const verifyRes = await fetch("/api/auth/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector(
                    'meta[name="csrf-token"]',
                ).content,
            },
            body: JSON.stringify({
                address: walletAddress,
                public_key: publicKey,
                signature: signResult.signature,
                message: nonce,
            }),
        });

        const data = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(data.error || "Xác thực thất bại");

        authToken = data.token;
        localStorage.setItem("petra_token", authToken);
        loginStatus.textContent = "✅ Đăng nhập thành công!";
        btnLogin.style.display = "none";
    } catch (err) {
        console.error("Login thất bại:", err);
        alert("Lỗi: " + err.message);
    }
}

// ===== DISCONNECT =====
async function disconnectWallet() {
    try {
        await petraWallet?.features["aptos:disconnect"]?.disconnect();
    } catch (_) {}

    walletAddress = publicKey = petraWallet = authToken = null;
    localStorage.removeItem("petra_token");

    walletInfo.style.display = "none";
    btnConnect.style.display = "inline-block";
    btnLogin.style.display = "none";
    btnDisconnect.style.display = "none";
    loginStatus.textContent = "";
}
