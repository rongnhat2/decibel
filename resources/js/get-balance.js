import { getAptosWallets } from "@aptos-labs/wallet-standard";

// ===== INIT =====
window.addEventListener("load", async () => {
    // Load balance
    const fullAddr = localStorage.getItem("petra_address");
    const apt = await getAptBalance(fullAddr);
    document.getElementById("wallet-address").textContent =
        `${fullAddr.slice(0, 6)}...${fullAddr.slice(-6)}`;
    document.getElementById("wallet-address-detail").textContent =
        `${fullAddr.slice(0, 6)}...${fullAddr.slice(-6)}`;
    document.getElementById("apt-balance").textContent = apt + " APT";
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
