// ===== DOM =====
const input = document.getElementById("invite-code-input");
const btnSubmit = document.getElementById("btn-submit-code");
const status = document.getElementById("code-status");

// ===== CSRF =====
function csrf() {
    return document.querySelector('meta[name="csrf-token"]').content;
}

// ===== SUBMIT CODE =====
btnSubmit.addEventListener("click", async () => {
    const code = input.value.trim().toUpperCase();
    const userId = localStorage.getItem("petra_temp_user_id");
    const token = localStorage.getItem("petra_temp_token");
    const address = localStorage.getItem("petra_temp_address");

    if (!code) return showStatus("❌ Input invite code!", "red");
    if (!userId)
        return showStatus("❌ session expired, please login again.", "red");

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Verifying...";

    try {
        const res = await fetch("/api/auth/verify-code", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-CSRF-TOKEN": csrf(),
            },
            body: JSON.stringify({
                code,
                user_id: userId,
            }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Invalid code");

        // ✅ Code hợp lệ — lưu token thật
        localStorage.setItem("petra_temp_token", token);
        localStorage.setItem("petra_temp_user_id", userId);
        localStorage.setItem("petra_temp_address", address);

        // Xoá temp
        localStorage.removeItem("petra_temp_token");
        localStorage.removeItem("petra_temp_user_id");
        localStorage.removeItem("petra_temp_address");

        // Lưu JWT vào cookie
        document.cookie = `jwt_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;

        showStatus("✅ Verification successful! Redirecting...", "green");

        setTimeout(() => {
            window.location.href = "/";
        }, 1000);
    } catch (err) {
        showStatus("❌ " + err.message, "red");
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Verify";
    }
});

// ===== ENTER KEY =====
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnSubmit.click();
});

// ===== HELPER =====
function showStatus(msg, color) {
    status.textContent = msg;
    status.style.color = color;
}
