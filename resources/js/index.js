function truncateAddress(address) {
    if (!address || address.length < 12) {
        return address || "-";
    }

    return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

async function getAptBalance(address) {
    if (!address) {
        return "0.0000";
    }

    try {
        const balanceRes = await fetch("https://fullnode.testnet.aptoslabs.com/v1/view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                function: "0x1::coin::balance",
                type_arguments: ["0x1::aptos_coin::AptosCoin"],
                arguments: [address],
            }),
        });

        const balanceData = await balanceRes.json();
        const octas = Number(balanceData?.[0] ?? 0);
        return (octas / 1e8).toFixed(4);
    } catch (error) {
        console.error("Get APT balance error:", error);
        return "0.0000";
    }
}

function bindSecretToggle() {
    const secretEl = document.getElementById("dashboard-secret-key");
    const toggleBtn = document.getElementById("toggle-secret-key");
    if (!secretEl || !toggleBtn) {
        return;
    }

    const secretValue = localStorage.getItem("petra_secret_key") || "sk_live_9f3d2c8a7b1e";
    let revealed = false;

    toggleBtn.addEventListener("click", function () {
        revealed = !revealed;
        secretEl.textContent = revealed ? secretValue : "••••••••";
        toggleBtn.innerHTML = revealed
            ? '<i class="fi fi-rr-eye-crossed me-1"></i>Hide'
            : '<i class="fi fi-rr-eye me-1"></i>Show';
    });
}

function bindCopyButton(buttonId, textId) {
    const btn = document.getElementById(buttonId);
    const textEl = document.getElementById(textId);
    if (!btn || !textEl) {
        return;
    }

    btn.addEventListener("click", async function () {
        try {
            await navigator.clipboard.writeText((textEl.textContent || "").trim());
        } catch (error) {
            console.error("Copy failed:", error);
        }
    });
}

window.addEventListener("load", async function () {
    const fullAddress = localStorage.getItem("petra_address") || localStorage.getItem("petra_temp_address") || "";
    const shortAddress = truncateAddress(fullAddress);

    const dashboardAddress = document.getElementById("dashboard-wallet-address");
    if (dashboardAddress) {
        dashboardAddress.textContent = shortAddress;
    }

    const headerAddress = document.getElementById("wallet-address");
    if (headerAddress) {
        headerAddress.textContent = shortAddress;
    }

    const headerAddressDetail = document.getElementById("wallet-address-detail");
    if (headerAddressDetail) {
        headerAddressDetail.textContent = shortAddress;
    }

    const apt = await getAptBalance(fullAddress);

    const dashboardApt = document.getElementById("balance-apt");
    if (dashboardApt) {
        dashboardApt.textContent = apt;
    }

    const headerApt = document.getElementById("apt-balance");
    if (headerApt) {
        headerApt.textContent = `${apt} APT`;
    }

    const usdcbl = localStorage.getItem("petra_usdcbl_balance") || "0.00";
    const usdcblEl = document.getElementById("balance-usdcbl");
    if (usdcblEl) {
        usdcblEl.textContent = usdcbl;
    }

    const apiKeyEl = document.getElementById("dashboard-api-key");
    if (apiKeyEl) {
        apiKeyEl.textContent = localStorage.getItem("petra_api_key") || "xxxxxxxx...";
    }

    bindSecretToggle();
    bindCopyButton("copy-wallet-address", "dashboard-wallet-address");
    bindCopyButton("copy-api-key", "dashboard-api-key");
});
