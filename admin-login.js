"use strict";

const ADMIN_KEY = "agriMitraAdmins";

function getAdmins() {
    try { return JSON.parse(localStorage.getItem(ADMIN_KEY)) || []; } catch { return []; }
}

const adminLoginForm = document.getElementById("adminLoginForm");
document.querySelectorAll(".admin-password-toggle").forEach((button) => {
    button.addEventListener("click", () => {
        const password = document.getElementById(button.dataset.passwordTarget);
        const visible = password.type === "text";
        password.type = visible ? "password" : "text";
        button.textContent = visible ? "👁" : "🙈";
        button.setAttribute("aria-label", visible ? "Show password" : "Hide password");
    });
});

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const email = adminLoginForm.email.value.trim().toLowerCase();
        const password = adminLoginForm.password.value;
        const message = document.getElementById("adminLoginMessage");
        const admin = getAdmins().find((item) => item.email === email && item.password === password);
        if (!admin) {
            message.textContent = "Invalid admin email or password.";
            message.className = "admin-auth-message error";
            return;
        }
        localStorage.setItem("agriMitraAdmin", JSON.stringify({ id: admin.id, name: admin.name, email: admin.email }));
        message.textContent = "Admin login successful. Opening dashboard...";
        message.className = "admin-auth-message success";
        window.setTimeout(() => { window.location.href = "dashboard.html"; }, 500);
    });
}
