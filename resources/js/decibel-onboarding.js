function csrf() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.content : "";
}

async function postJson(url, payload) {
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-TOKEN": csrf(),
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.error || "Request failed");
    }
    return data;
}


export async function runOnboarding(options) {
    const {
        walletAddress,
        builderAddress,
        startStep = 1,
        onStep,
        onSuccess,
        onError,
    } = options || {};

    try {
        if (!walletAddress) {
            throw new Error("Missing wallet address");
        }

        // Step 1
        if (startStep <= 1) {
            onStep && onStep({ step: 1, state: "loading", message: "Dang tao Trading Account..." });
            const bot = await postJson("/api/onboard/bot-key", { wallet_address: walletAddress });
            await postJson("/api/onboard/progress", {
                wallet_address: walletAddress,
                step: 1,
                subaccount_address: bot.bot_key_address || walletAddress,
                tx_hash: "tx_create_subaccount_" + Date.now(),
            });
            onStep && onStep({ step: 1, state: "success", message: "Tao Trading Account thanh cong." });
        }

        // Step 2
        if (startStep <= 2) {
            onStep && onStep({ step: 2, state: "loading", message: "Dang approve Builder Fee..." });
            await postJson("/api/onboard/progress", {
                wallet_address: walletAddress,
                step: 2,
                tx_hash: "tx_approve_builder_" + Date.now(),
                builder_address: builderAddress || "",
            });
            onStep && onStep({ step: 2, state: "success", message: "Approve Builder Fee thanh cong." });
        }

        // Step 3
        if (startStep <= 3) {
            onStep && onStep({ step: 3, state: "loading", message: "Dang uy quyen Bot Trading..." });
            await postJson("/api/onboard/progress", {
                wallet_address: walletAddress,
                step: 3,
                tx_hash: "tx_delegate_bot_" + Date.now(),
            });
            onStep && onStep({ step: 3, state: "success", message: "Uy quyen Bot Trading thanh cong." });
        }

        onSuccess && onSuccess();
    } catch (error) {
        onError && onError(error);
    }
}
