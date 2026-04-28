import { runOnboarding, continueOnboarding } from "./decibel-onboarding.js";

// ===== DOM =====
const stepsEl = document.getElementById("onboarding-steps");
const btnStart = document.getElementById("btn-start-onboarding");
const btnRetry = document.getElementById("btn-retry-onboarding");
const statusText = document.getElementById("onboarding-status-text");
const errorText = document.getElementById("onboarding-error-text");

// ===== DATA from Blade =====
const initialStep = parseInt(stepsEl.dataset.initialStep ?? "0");
const isOnboarded = stepsEl.dataset.isOnboarded === "1";
const walletAddress = stepsEl.dataset.walletAddress;
const builderAddress = document.querySelector(
    'meta[name="builder-address"]',
)?.content;

// ===== INIT =====
window.addEventListener("load", () => {
    // If already onboarded, redirect immediately
    if (isOnboarded) {
        window.location.href = "/";
        return;
    }

    // Highlight previously completed steps
    for (let i = 1; i <= initialStep; i++) {
        setStepState(i, "success");
    }

    btnStart.addEventListener("click", startOnboarding);
    btnRetry.addEventListener("click", startOnboarding);
});
// ===== START ONBOARDING =====
async function startOnboarding() {
    btnStart.disabled = true;
    btnRetry.classList.add("d-none");
    errorText.classList.add("d-none");

    try {
        await runOnboarding({
            builderAddress,

            onStep: ({ step, state, message }) => {
                statusText.textContent = message;
                if (step === 0) return;
                setStepState(step, state);
            },

            // PAUSE — show APT deposit prompt
            onWaitForGas: (botAddress) => {
                showWaitForGas(botAddress);
            },

            onError: (err) => {
                errorText.textContent = err.message;
                errorText.classList.remove("d-none");
                statusText.textContent =
                    "An error has occurred. Please try again.";
                btnStart.disabled = false;
                btnRetry.classList.remove("d-none");
            },
        });
    } catch (_) {}
}

// ===== SHOW APT DEPOSIT PROMPT =====
function showWaitForGas(botAddress) {
    statusText.innerHTML = `
        ✅ Bot wallet has been created!<br><br>
        <strong>⚠️ Next step:</strong> Deposit at least <strong>0.5 APT</strong> 
        to the following address so the bot has transaction fees:<br><br>
        <code>${botAddress}</code>
        <button class="btn btn-sm btn-outline-secondary ms-2" 
                onclick="navigator.clipboard.writeText('${botAddress}')">Copy</button>
    `;

    // Hide start button, show confirm button
    btnStart.classList.add("d-none");

    const btnConfirm = document.getElementById("btn-confirm-gas");
    btnConfirm.classList.remove("d-none");
    btnConfirm.onclick = () => checkGasAndContinue(botAddress);
}

// ===== CHECK APT AND CONTINUE =====
async function checkGasAndContinue(botAddress) {
    const btnConfirm = document.getElementById("btn-confirm-gas");
    btnConfirm.disabled = true;
    btnConfirm.textContent = "Checking...";

    try {
        const apt = await checkBotAptBalance(botAddress);
        console.log("Bot APT balance:", apt);

        if (parseFloat(apt) < 0.1) {
            alert(
                `The bot wallet currently has ${apt} APT — not enough. Please deposit more.`,
            );
            btnConfirm.disabled = false;
            btnConfirm.textContent = "I've already deposited APT";
            return;
        }

        // Enough APT → continue
        btnConfirm.classList.add("d-none");
        statusText.textContent = "Continuing setup...";

        await continueOnboarding({
            builderAddress,

            onStep: ({ step, state, message }) => {
                statusText.textContent = message;
                if (step === 0) return;
                setStepState(step, state);
            },

            onSuccess: async () => {
                for (let i = 1; i <= 3; i++) setStepState(i, "success");
                statusText.textContent = "✅ Setup complete! Redirecting...";

                setTimeout(() => (window.location.href = "/"), 1500);
            },

            onError: (err) => {
                errorText.textContent = err.message;
                errorText.classList.remove("d-none");
                statusText.textContent =
                    "An error has occurred. Please try again.";
                btnConfirm.disabled = false;
                btnConfirm.textContent = "Try again";
                btnConfirm.classList.remove("d-none");
            },
        });
    } catch (err) {
        alert("Error: " + err.message);
        btnConfirm.disabled = false;
        btnConfirm.textContent = "I've already deposited APT";
    }
}

// ===== CHECK APT BALANCE =====
async function checkBotAptBalance(botAddress) {
    try {
        console.log("Checking address:", botAddress);
        const res = await fetch("https://api.mainnet.aptoslabs.com/v1/view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                function: "0x1::coin::balance",
                type_arguments: ["0x1::aptos_coin::AptosCoin"],
                arguments: [botAddress],
            }),
        });
        const data = await res.json();
        console.log("Balance response:", data);
        const balance = ((data?.[0] ?? 0) / 1e8).toFixed(4);
        console.log("APT balance:", balance);
        return balance;
    } catch {
        return "0.0000";
    }
}

// ===== SET STEP STATE =====
function setStepState(step, state) {
    const icon = document.getElementById(`step-icon-${step}`);
    const label = document.getElementById(`step-label-${step}`);
    const status = document.getElementById(`step-status-${step}`);
    const item = document.querySelector(`.step-item[data-step="${step}"]`);

    if (!icon || !label || !status || !item) {
        console.warn(`Step ${step} not found in DOM`);
        return;
    }

    item.classList.remove("border-primary", "border-success", "border-danger");
    icon.className = "step-icon";
    label.className = "step-label";

    switch (state) {
        case "pending":
            icon.innerHTML = '<i class="fi fi-rr-circle"></i>';
            icon.classList.add("text-muted");
            label.classList.add("text-secondary");
            status.textContent = "pending";
            status.className = "small text-muted";
            break;
        case "loading":
            icon.innerHTML =
                '<div class="spinner-border spinner-border-sm text-primary" role="status"></div>';
            label.classList.add("text-primary", "fw-semibold");
            status.textContent = "processing...";
            status.className = "small text-primary";
            item.classList.add("border-primary");
            break;
        case "success":
            icon.innerHTML =
                '<i class="fi fi-rr-check-circle text-success"></i>';
            label.classList.add("text-success", "fw-semibold");
            status.textContent = "completed";
            status.className = "small text-success";
            item.classList.add("border-success");
            break;
        case "error":
            icon.innerHTML =
                '<i class="fi fi-rr-cross-circle text-danger"></i>';
            label.classList.add("text-danger");
            status.textContent = "error";
            status.className = "small text-danger";
            item.classList.add("border-danger");
            break;
    }
}
