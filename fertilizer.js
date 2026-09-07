"use strict";

const FERTILIZER_PROFILES = {
    balanced: {
        n: 90, p: 42, k: 43,
        name: "Balanced NPK",
        status: "Well balanced",
        detail: "Maintain a balanced NPK blend and split applications around the crop growth stages."
    },
    nitrogen: {
        n: 25, p: 18, k: 50,
        name: "Urea + DAP",
        status: "Nitrogen deficient",
        detail: "Prioritize nitrogen and phosphorus, then reassess the soil after the next application."
    },
    potassium: {
        n: 85, p: 60, k: 15,
        name: "Muriate of Potash",
        status: "Potassium deficient",
        detail: "Add potassium in measured applications and avoid overloading already sufficient nutrients."
    }
};

function renderFertilizerProfile(profileName) {
    const profile = FERTILIZER_PROFILES[profileName];
    if (!profile) return;

    ["n", "p", "k"].forEach((nutrient) => {
        const prefix = nutrient.toUpperCase();
        document.getElementById(`fert${prefix}Val`).textContent = `${profile[nutrient]} mg/kg`;
        document.getElementById(`fert${prefix}Bar`).style.width = `${Math.min(profile[nutrient] / 2, 100)}%`;
    });
    document.getElementById("fertilizerName").textContent = profile.name;
    document.getElementById("fertilizerStatus").textContent = profile.status;
    document.getElementById("fertilizerDetail").textContent = profile.detail;
}

document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("fertilizerName")) return;
    document.querySelectorAll("[data-profile]").forEach((button) => {
        button.addEventListener("click", () => renderFertilizerProfile(button.dataset.profile));
    });
    renderFertilizerProfile("balanced");
});
