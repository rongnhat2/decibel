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
        const balanceRes = await fetch(
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

        const balanceData = await balanceRes.json();
        const octas = Number(balanceData?.[0] ?? 0);
        return (octas / 1e8).toFixed(4);
    } catch (error) {
        console.error("Get APT balance error:", error);
        return "0.0000";
    }
}

// Toggle hide/show for secret key
function bindSecretToggle() {
    const secretEl = document.getElementById("dashboard-secret-key");
    const toggleBtn = document.getElementById("toggle-secret-key");
    if (!secretEl || !toggleBtn) {
        return;
    }

    const secretValue =
        localStorage.getItem("petra_secret_key") || "sk_live_9f3d2c8a7b1e";
    let revealed = false;

    toggleBtn.addEventListener("click", function () {
        revealed = !revealed;
        secretEl.textContent = revealed ? secretValue : "••••••••";
        toggleBtn.innerHTML = revealed
            ? '<i class="fi fi-rr-eye-crossed me-1"></i>Hide'
            : '<i class="fi fi-rr-eye me-1"></i>Show';
    });
}

// Add copy-to-clipboard button event
function bindCopyButton(buttonId, textId) {
    const btn = document.getElementById(buttonId);
    const textEl = document.getElementById(textId);
    if (!btn || !textEl) {
        return;
    }

    btn.addEventListener("click", async function () {
        try {
            await navigator.clipboard.writeText(
                (textEl.textContent || "").trim(),
            );
        } catch (error) {
            console.error("Copy failed:", error);
        }
    });
}

window.addEventListener("load", async function () {
    // Get address from localStorage, truncate, and display in UI
    const fullAddress =
        localStorage.getItem("petra_address") ||
        localStorage.getItem("petra_temp_address") ||
        "";
    const shortAddress = truncateAddress(fullAddress);

    const dashboardAddress = document.getElementById(
        "dashboard-wallet-address",
    );
    if (dashboardAddress) {
        dashboardAddress.textContent = shortAddress;
    }

    const headerAddress = document.getElementById("wallet-address");
    if (headerAddress) {
        headerAddress.textContent = shortAddress;
    }

    const headerAddressDetail = document.getElementById(
        "wallet-address-detail",
    );
    if (headerAddressDetail) {
        headerAddressDetail.textContent = shortAddress;
    }

    // Fetch and display APT balance
    const apt = await getAptBalance(fullAddress);

    const dashboardApt = document.getElementById("balance-apt");
    if (dashboardApt) {
        dashboardApt.textContent = apt;
    }

    const headerApt = document.getElementById("apt-balance");
    if (headerApt) {
        headerApt.textContent = `${apt} APT`;
    }

    // Set USDCBL balance if available
    const usdcbl = localStorage.getItem("petra_usdcbl_balance") || "0.00";
    const usdcblEl = document.getElementById("balance-usdcbl");
    if (usdcblEl) {
        usdcblEl.textContent = usdcbl;
    }

    // Set API key value from localStorage
    const apiKeyEl = document.getElementById("dashboard-api-key");
    if (apiKeyEl) {
        apiKeyEl.textContent =
            localStorage.getItem("petra_api_key") || "xxxxxxxx...";
    }

    bindSecretToggle();
    bindCopyButton("copy-wallet-address", "dashboard-wallet-address");
    bindCopyButton("copy-api-key", "dashboard-api-key");
});

// Add clipboard copy for wallet address board
document
    .getElementById("copy-wallet-address")
    ?.addEventListener("click", () => {
        const address = document
            .getElementById("wallet-address-board")
            .textContent.trim();
        navigator.clipboard.writeText(address);

        const btn = document.getElementById("copy-wallet-address");
        btn.innerHTML = '<i class="fi fi-rr-check me-1"></i>Copied!';
        setTimeout(() => {
            btn.innerHTML = '<i class="fi fi-rr-copy me-1"></i>Copy';
        }, 2000);
    });

// Generate new API key button functionality
document
    .getElementById("btn-generate-api-key")
    ?.addEventListener("click", async () => {
        if (
            !confirm(
                "Generating a new API key will disable the previous one. Continue?",
            )
        )
            return;

        const btn = document.getElementById("btn-generate-api-key");
        btn.disabled = true;
        btn.textContent = "Generating...";

        try {
            // Fetch JWT token from cookies
            function getJwtToken() {
                const match = document.cookie.match(/jwt_token=([^;]+)/);
                return match ? match[1] : null;
            }

            const res = await fetch("/api/account/regenerate-credentials", {
                method: "POST",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${getJwtToken()}`, // changed here
                    Accept: "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]',
                    ).content,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Generate error");

            // Show API key and secret key once
            const apiKeyEl = document.getElementById("dashboard-api-key");
            const secretKeyEl = document.getElementById("dashboard-secret-key");

            document.getElementById("api-key-row").style.display = "block";
            document.getElementById("secret-key-row").style.display = "block";

            apiKeyEl.textContent = data.api_key;
            secretKeyEl.textContent = data.secret_key; // display plain secret key once

            // Toggle visibility for secret key
            const toggleBtn = document.getElementById("toggle-secret-key");
            let visible = true;
            toggleBtn.innerHTML =
                '<i class="fi fi-rr-eye-crossed me-1"></i>Hide';
            toggleBtn.onclick = () => {
                visible = !visible;
                secretKeyEl.textContent = visible
                    ? data.secret_key
                    : "••••••••••••••••";
                toggleBtn.innerHTML = visible
                    ? '<i class="fi fi-rr-eye-crossed me-1"></i>Hide'
                    : '<i class="fi fi-rr-eye me-1"></i>Show';
            };

            // Copy button for API key
            document
                .getElementById("copy-api-key")
                ?.addEventListener("click", () => {
                    navigator.clipboard.writeText(data.api_key);
                    document.getElementById("copy-api-key").textContent =
                        "Copied!";
                    setTimeout(() => {
                        document.getElementById("copy-api-key").innerHTML =
                            '<i class="fi fi-rr-copy me-1"></i>Copy';
                    }, 2000);
                });

            alert(
                "⚠️ Save the Secret Key now! It will not be shown again after you reload the page.",
            );
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML =
                '<i class="fi fi-rr-reload me-1"></i>Generate API Key';
        }
    });
