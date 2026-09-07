"use strict";

const RECOMMENDATION_DEFAULTS = {
    nitrogen: 90,
    phosphorus: 42,
    potassium: 40,
    temperature: 25.0,
    humidity: 70.0,
    ph: 6.3,
    rainfall: 110.0
};

const RECOMMENDATION_FIELDS = Object.entries(RECOMMENDATION_DEFAULTS).map(([id, value]) => ({
    id,
    defaultValue: value,
    min: Number(document.getElementById(id)?.min),
    max: Number(document.getElementById(id)?.max)
}));

const FERTILIZER_BY_CROP = {
    rice: "Nitrogen-rich fertilizer such as Urea with balanced NPK support.",
    maize: "NPK fertilizer with good nitrogen and phosphorus support.",
    chickpea: "Phosphorus-rich fertilizer with controlled nitrogen.",
    cotton: "Balanced NPK fertilizer with additional potassium.",
    banana: "Potassium-rich NPK fertilizer with organic manure.",
    coffee: "Balanced NPK fertilizer with organic compost."
};

function displayMessage(message, type = "") {
    const element = document.getElementById("pageMessage");
    if (!element) return;
    element.textContent = message;
    element.className = `page-message ${type}`;
}

function getRecommendationValues(form) {
    return Object.fromEntries(RECOMMENDATION_FIELDS.map(({ id }) => [id, Number(form.elements[id].value)]));
}

function renderRecommendation(values) {
    const result = document.getElementById("recommendationResult");
    if (!result) return;

    const { crop, confidence } = predictCrop({
        n: values.nitrogen,
        p: values.phosphorus,
        k: values.potassium,
        temperature: values.temperature,
        humidity: values.humidity,
        ph: values.ph,
        rainfall: values.rainfall
    });
    const fertilizer = FERTILIZER_BY_CROP[crop.toLowerCase()] || "Use a balanced NPK fertilizer according to soil-test results.";

    result.innerHTML = `
        <div class="result-heading">
            <div><span class="page-kicker">Analysis complete</span><h2>Best match: <span>${crop}</span></h2></div>
            <strong>${confidence}% confidence</strong>
        </div>
        <div class="confidence-track"><span style="width:${confidence}%"></span></div>
        <div class="result-grid">
            <div class="result-mini"><small>Fertilizer guidance</small><b>${fertilizer}</b></div>
            <div class="result-mini"><small>Soil profile</small><b>${values.ph.toFixed(1)} pH · ${values.rainfall} mm rain</b></div>
            <div class="result-mini"><small>Nitrogen (N)</small><b>${values.nitrogen} mg/kg</b></div>
            <div class="result-mini"><small>Phosphorus (P) / Potassium (K)</small><b>${values.phosphorus} / ${values.potassium} mg/kg</b></div>
        </div>
        <p class="result-note">This browser-based estimate uses AGRI MITRA's local crop dataset. Confirm recommendations with a soil test and local agronomist guidance.</p>
    `;
    result.classList.add("is-visible");
}

function initRecommendationPage() {
    const form = document.getElementById("recommendationForm");
    if (!form) return;

    RECOMMENDATION_FIELDS.forEach(({ id, defaultValue }) => {
        form.elements[id].value = defaultValue;
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const values = getRecommendationValues(form);
        const invalid = RECOMMENDATION_FIELDS.some(({ id, min, max }) => {
            const value = values[id];
            return !Number.isFinite(value) || value < min || value > max;
        });
        if (invalid) {
            displayMessage("Check each value against its displayed range.", "error");
            return;
        }
        displayMessage("Recommendation generated from the local crop dataset.", "success");
        renderRecommendation(values);
    });

    document.getElementById("resetRecommendation")?.addEventListener("click", () => {
        RECOMMENDATION_FIELDS.forEach(({ id, defaultValue }) => {
            form.elements[id].value = defaultValue;
        });
        document.getElementById("recommendationResult")?.classList.remove("is-visible");
        displayMessage("Values reset to the balanced soil profile.");
    });
}

function hasAuthenticatedSession() {
    return Boolean(localStorage.getItem("agriMitraUser") || localStorage.getItem("agriMitraAdmin"));
}

document.addEventListener("DOMContentLoaded", () => {
    if (!hasAuthenticatedSession()) {
        window.location.replace("login.html");
        return;
    }
    initRecommendationPage();
});
