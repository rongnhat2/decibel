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
        const baseUrl = "https://fullnode.mainnet.aptoslabs.com/v1";

        // Kiểm tra account tồn tại
        const accountRes = await fetch(`${baseUrl}/accounts/${address}`);

        if (accountRes.status === 404) {
            return "0.0000";
        }

        // Lấy balance
        const balRes = await fetch(`${baseUrl}/view`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                function: "0x1::coin::balance",
                type_arguments: ["0x1::aptos_coin::AptosCoin"],
                arguments: [address],
            }),
        });

        if (!balRes.ok) {
            throw new Error(`HTTP ${balRes.status}`);
        }

        const balData = await balRes.json();
        const octas = BigInt(balData?.[0] ?? "0");

        return (Number(octas) / 1e8).toFixed(4);
    } catch (err) {
        console.error("Balance error:", err);
        return "0.0000";
    }
}
