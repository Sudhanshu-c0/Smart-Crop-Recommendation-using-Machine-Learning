"use strict";

const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("agriMitraUser")); } catch { return null; }
})();

const farmerName = storedUser?.name || "Farmer";
const firstName = farmerName.trim().split(/\s+/)[0] || "Farmer";

document.querySelectorAll("#userName, #sidebarUserName").forEach((element) => {
    element.textContent = element.id === "userName" ? firstName : farmerName;
});

const avatar = document.getElementById("userAvatar");
if (avatar) avatar.textContent = firstName.charAt(0).toUpperCase();

document.querySelector(".nav-action")?.addEventListener("click", () => {
    localStorage.removeItem("agriMitraUser");
});
