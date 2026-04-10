import { getAptosWallets } from "@aptos-labs/wallet-standard";

const btnDisconnect = document.getElementById("btn-disconnect");

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

    // Xoá cookie jwt_token
    document.cookie = "jwt_token=; path=/; max-age=0";

    // Redirect về login
    window.location.href = "/login";
});
