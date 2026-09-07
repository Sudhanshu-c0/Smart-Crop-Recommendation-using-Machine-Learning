"use strict";

const ADMIN_KEY = "agriMitraAdmins";
function getAdmins() { try { return JSON.parse(localStorage.getItem(ADMIN_KEY)) || []; } catch { return []; } }
function saveAdmins(admins) { localStorage.setItem(ADMIN_KEY, JSON.stringify(admins)); }

const adminSignupForm = document.getElementById("adminSignupForm");
document.querySelectorAll(".admin-password-toggle").forEach((button) => {
    button.addEventListener("click", () => {
        const password = document.getElementById(button.dataset.passwordTarget);
        const visible = password.type === "text";
        password.type = visible ? "password" : "text";
        button.textContent = visible ? "👁" : "🙈";
        button.setAttribute("aria-label", visible ? "Show password" : "Hide password");
    });
});

if (adminSignupForm) {
    adminSignupForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = adminSignupForm.name.value.trim();
        const email = adminSignupForm.email.value.trim().toLowerCase();
        const password = adminSignupForm.password.value;
        const message = document.getElementById("adminSignupMessage");
        const admins = getAdmins();
        if (admins.some((item) => item.email === email)) {
            message.textContent = "An admin account already exists for this email.";
            message.className = "admin-auth-message error";
            return;
        }
        const admin = { id: `admin_${Date.now()}`, name, email, password, createdAt: new Date().toISOString() };
        admins.push(admin);
        saveAdmins(admins);
        localStorage.setItem("agriMitraAdmin", JSON.stringify({ id: admin.id, name: admin.name, email: admin.email }));
        message.textContent = "Admin account created. Opening dashboard...";
        message.className = "admin-auth-message success";
        window.setTimeout(() => { window.location.href = "dashboard.html"; }, 500);
    });
}
