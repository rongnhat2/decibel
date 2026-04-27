import { getAptosWallets } from "@aptos-labs/wallet-standard";

const btnDisconnect = document.getElementById("btn-disconnect");

if (btnDisconnect) {
    btnDisconnect.addEventListener("click", async () => {
        try {
            const { aptosWallets } = getAptosWallets();
            const petra = aptosWallets?.find((w) => w.name === "Petra");
            await petra?.features["aptos:disconnect"]?.disconnect();
        } catch (_) {}

        // Xoá localStorage
        localStorage.removeItem("petra_token");
        localStorage.removeItem("petra_user_id");
        localStorage.removeItem("petra_address");

        // Xoá cookie JWT phía client (non-HttpOnly)
        document.cookie = "jwt_token=; path=/; max-age=0";

        // Đảm bảo server xoá luôn cookie HttpOnly nếu có
        window.location.href = "/logout";
    });
}
