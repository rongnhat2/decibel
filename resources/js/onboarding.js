import { runOnboarding } from "./decibel-onboarding.js";

const STEP_TOTAL = 3;

function setStepState(step, state) {
    const icon = document.getElementById(`step-icon-${step}`);
    const label = document.getElementById(`step-label-${step}`);
    const status = document.getElementById(`step-status-${step}`);

    if (!icon || !label || !status) {
        return;
    }

    if (state === "pending") {
        icon.className = "step-icon text-muted";
        icon.innerHTML = '<i class="fi fi-rr-circle"></i>';
        label.className = "step-label text-secondary";
        status.className = "small text-muted";
        status.textContent = "pending";
        return;
    }

    if (state === "loading") {
        icon.className = "step-icon text-primary";
        icon.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        label.className = "step-label fw-semibold text-dark";
        status.className = "small text-primary";
        status.textContent = "loading";
        return;
    }

    if (state === "success") {
        icon.className = "step-icon text-success";
        icon.innerHTML = '<i class="fi fi-rr-check-circle"></i>';
        label.className = "step-label fw-semibold text-dark";
        status.className = "small text-success";
        status.textContent = "success";
        return;
    }

    if (state === "error") {
        icon.className = "step-icon text-danger";
        icon.innerHTML = '<i class="fi fi-rr-cross-circle"></i>';
        label.className = "step-label fw-semibold text-danger";
        status.className = "small text-danger";
        status.textContent = "error";
    }
}

function setBusy(busy) {
    const startBtn = document.getElementById("btn-start-onboarding");
    if (!startBtn) {
        return;
    }
    startBtn.disabled = busy;
    startBtn.textContent = busy ? "Dang thiet lap..." : "Bat dau thiet lap";
}

window.addEventListener("load", function () {
    const root = document.getElementById("onboarding-steps");
    const startBtn = document.getElementById("btn-start-onboarding");
    const retryBtn = document.getElementById("btn-retry-onboarding");
    const statusText = document.getElementById("onboarding-status-text");
    const errorText = document.getElementById("onboarding-error-text");
    const builderAddressMeta = document.querySelector('meta[name="builder-address"]');

    if (!root || !startBtn || !statusText || !errorText) {
        return;
    }

    const initialStep = Number(root.dataset.initialStep || 0);
    const isOnboarded = root.dataset.isOnboarded === "1";
    const walletAddress = root.dataset.walletAddress || localStorage.getItem("petra_address") || "";
    const builderAddress = builderAddressMeta ? builderAddressMeta.content : "";

    if (isOnboarded) {
        window.location.href = "/";
        return;
    }

    for (let step = 1; step <= STEP_TOTAL; step += 1) {
        if (step <= initialStep) {
            setStepState(step, "success");
        } else {
            setStepState(step, "pending");
        }
    }

    const startStep = Math.min(initialStep + 1, STEP_TOTAL);
    if (initialStep > 0) {
        statusText.textContent = `Da hoan tat buoc ${initialStep}. San sang tiep tuc buoc ${startStep}.`;
    }

    let currentStep = startStep;

    const handleStart = function () {
        retryBtn && retryBtn.classList.add("d-none");
        errorText.classList.add("d-none");
        errorText.textContent = "";
        setBusy(true);

        runOnboarding({
            walletAddress,
            builderAddress,
            startStep,
            onStep: ({ step, state, message }) => {
                currentStep = step || currentStep;
                setStepState(step, state);
                if (message) {
                    statusText.textContent = message;
                }
            },
            onSuccess: () => {
                statusText.textContent = "Hoan tat onboarding. Dang chuyen huong...";
                setTimeout(function () {
                    window.location.href = "/";
                }, 1500);
            },
            onError: (error) => {
                setBusy(false);
                const failedStep = Math.min(currentStep, STEP_TOTAL);
                setStepState(failedStep, "error");
                statusText.textContent = "Onboarding that bai. Vui long thu lai.";
                errorText.textContent = error?.message || "Unknown onboarding error.";
                errorText.classList.remove("d-none");
                retryBtn && retryBtn.classList.remove("d-none");
            },
        });
    };

    startBtn.addEventListener("click", handleStart);
    retryBtn && retryBtn.addEventListener("click", handleStart);
});
