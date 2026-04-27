import { runOnboarding } from "./decibel-onboarding.js";

// ===== DOM =====
const stepsEl = document.getElementById("onboarding-steps");
const btnStart = document.getElementById("btn-start-onboarding");
const btnRetry = document.getElementById("btn-retry-onboarding");
const statusText = document.getElementById("onboarding-status-text");
const errorText = document.getElementById("onboarding-error-text");

// ===== DATA từ Blade =====
const initialStep = parseInt(stepsEl.dataset.initialStep ?? "0");
const isOnboarded = stepsEl.dataset.isOnboarded === "1";
const walletAddress = stepsEl.dataset.walletAddress;
const builderAddress = document.querySelector(
    'meta[name="builder-address"]',
)?.content;

// ===== INIT =====
window.addEventListener("load", () => {
    // Nếu đã onboarded redirect luôn
    if (isOnboarded) {
        window.location.href = "/";
        return;
    }

    // Highlight bước đã xong trước đó
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
    errorText.textContent = "";

    // Reset step chưa xong về pending
    for (let i = initialStep + 1; i <= 3; i++) {
        setStepState(i, "pending");
    }
    console.log("walletAddress:", walletAddress);
    console.log("builderAddress:", builderAddress);
    console.log("initialStep:", initialStep);
    console.log(document.getElementById("onboarding-steps").dataset);
    try {
        // Fix: pass walletAddress into runOnboarding
        await runOnboarding({
            walletAddress,
            builderAddress,

            onStep: (step, msg) => {
                statusText.textContent = msg;

                if (step === 0) return;

                if (step > 1) setStepState(step - 1, "success");
                setStepState(step, "loading");
            },

            onSuccess: ({ subaccountAddress, txHashes } = {}) => {
                for (let i = 1; i <= 3; i++) {
                    setStepState(i, "success");
                }

                statusText.textContent =
                    "✅ Thiết lập hoàn tất! Đang chuyển hướng...";
                btnStart.classList.add("d-none");

                console.log("Subaccount:", subaccountAddress);
                console.log("Transactions:", txHashes);

                setTimeout(() => {
                    window.location.href = "/";
                }, 1500);
            },

            onError: (err) => {
                errorText.textContent = err.message;
                errorText.classList.remove("d-none");
                statusText.textContent = "Đã xảy ra lỗi. Vui lòng thử lại.";

                btnStart.disabled = false;
                btnRetry.classList.remove("d-none");
            },
        });
    } catch (err) {
        // onError đã handle rồi, không cần làm gì thêm
    }
}

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
            status.textContent = "đang xử lý...";
            status.className = "small text-primary";
            item.classList.add("border-primary");
            break;

        case "success":
            icon.innerHTML =
                '<i class="fi fi-rr-check-circle text-success"></i>';
            label.classList.add("text-success", "fw-semibold");
            status.textContent = "hoàn tất";
            status.className = "small text-success";
            item.classList.add("border-success");
            break;

        case "error":
            icon.innerHTML =
                '<i class="fi fi-rr-cross-circle text-danger"></i>';
            label.classList.add("text-danger");
            status.textContent = "lỗi";
            status.className = "small text-danger";
            item.classList.add("border-danger");
            break;
    }
}
