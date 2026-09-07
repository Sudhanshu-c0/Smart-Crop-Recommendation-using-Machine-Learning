"use strict";

const sessionUser = (() => {
    try { return JSON.parse(localStorage.getItem("agriMitraUser")); } catch { return null; }
})();

if (sessionUser?.name) {
    const header = document.querySelector(".topbar, .navbar");
    if (header && !header.querySelector(".session-user")) {
        const userBadge = document.createElement("div");
        userBadge.className = "session-user";
        userBadge.innerHTML = `<span class="session-user-avatar">${sessionUser.name.trim().charAt(0).toUpperCase()}</span><span><strong>${sessionUser.name}</strong><small>${sessionUser.email || "Farmer account"}</small></span>`;
        header.appendChild(userBadge);
    }
}
