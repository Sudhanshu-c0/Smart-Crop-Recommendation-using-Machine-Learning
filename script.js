<<<<<<< HEAD
=======
```javascript
>>>>>>> 2701f995008f88afa9d85da95826b4c382fedcde
const tabButtons = document.querySelectorAll(".tab-btn");
const authForms = document.querySelectorAll(".auth-form");


// ================= AUTH TABS =================

if (tabButtons.length > 0) {

    function switchTab(target) {

        tabButtons.forEach((button) => {

            button.classList.toggle(
                "active",
                button.dataset.tab === target
            );

        });

        authForms.forEach((form) => {

            form.classList.toggle(
                "active-form",
                form.id === `${target}Form`
            );

        });

    }


    tabButtons.forEach((button) => {

        button.addEventListener("click", () => {

            switchTab(button.dataset.tab);

        });

    });

}
<<<<<<< HEAD


// ============================================================
// AGRI MITRA - BULK CSV PREDICTION (FRONTEND ONLY)
// Parses the CSV in-browser and runs predictCrop() from
// crop-data.js for each row — no server required.
// Expected CSV columns (header row, any order):
// n or N, p or P, k or K, temperature, humidity, ph, rainfall
// ============================================================

const FERTILIZER_MAP = {

    rice: "Nitrogen-rich fertilizer such as Urea with balanced NPK support.",
    maize: "NPK fertilizer with good nitrogen and phosphorus support.",
    chickpea: "Phosphorus-rich fertilizer with controlled nitrogen.",
    kidneybeans: "Phosphorus and potassium fertilizer with limited nitrogen.",
    pigeonpeas: "Phosphorus-rich fertilizer with organic manure.",
    cotton: "Balanced NPK fertilizer with additional potassium.",
    jute: "Nitrogen-rich fertilizer with organic compost.",
    coffee: "Balanced NPK fertilizer with organic compost.",
    banana: "Potassium-rich NPK fertilizer with organic manure.",
    papaya: "Nitrogen and potassium-rich fertilizer with micronutrients.",
    coconut: "Potassium and magnesium-rich fertilizer with organic manure.",
    orange: "Balanced NPK fertilizer with potassium and micronutrients.",
    apple: "Balanced NPK fertilizer with controlled nitrogen.",
    muskmelon: "Balanced NPK fertilizer with additional potassium.",
    grapes: "Balanced NPK fertilizer with micronutrient support.",
    watermelon: "Potassium-rich fertilizer with proper irrigation support.",
    mungbean: "Phosphorus-rich fertilizer with controlled nitrogen.",
    blackgram: "Phosphorus-rich fertilizer with controlled nitrogen.",
    mothbeans: "Phosphorus-rich fertilizer with controlled nitrogen.",
    lentil: "Phosphorus-rich fertilizer with limited nitrogen.",
    pomegranate: "Balanced NPK fertilizer with additional potassium.",
    mango: "Balanced NPK fertilizer with organic compost."

};


function parseCSV(csvText) {

    const lines =
        csvText
            .trim()
            .split(/\r?\n/)
            .filter(line => line.length > 0);

    if (lines.length < 2) {

        throw new Error(
            "CSV needs a header row plus at least one data row."
        );

    }

    const headers =
        lines[0]
            .split(",")
            .map(header => header.trim().toLowerCase());

    const rows = lines.slice(1).map((line) => {

        const values = line.split(",").map(v => v.trim());

        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index];
        });

        return row;

    });

    return rows;

}


function normalizeRow(row) {

    const get = (...keys) => {

        for (const key of keys) {

            if (row[key] !== undefined) {

                return Number(row[key]);

            }

        }

        return NaN;

    };

    return {

        n: get("n", "nitrogen"),
        p: get("p", "phosphorus"),
        k: get("k", "potassium"),
        temperature: get("temperature"),
        humidity: get("humidity"),
        ph: get("ph"),
        rainfall: get("rainfall")

    };

}


async function predictCSV() {

    const fileInput = document.getElementById("csvFile");
    const message = document.getElementById("csvMessage");

    if (!fileInput.files.length) {
        message.textContent = "Please select a CSV file.";
        return;
    }

    const file = fileInput.files[0];

    if (!file.name.toLowerCase().endsWith(".csv")) {
        message.textContent = "Please upload a CSV file.";
        return;
    }

    try {

        message.textContent = "🤖 Processing CSV...";

        const csvText = await file.text();

        const rows = parseCSV(csvText);

        if (typeof predictCrop !== "function") {

            throw new Error(
                "crop-data.js was not loaded."
            );

        }

        const results = rows.map((row, index) => {

            const inputData = normalizeRow(row);

            const invalid =
                Object.values(inputData).some(
                    value => !Number.isFinite(value)
                );

            if (invalid) {

                return {
                    row: index + 1,
                    n: row.n ?? row.nitrogen ?? "--",
                    p: row.p ?? row.phosphorus ?? "--",
                    k: row.k ?? row.potassium ?? "--",
                    temperature: row.temperature ?? "--",
                    humidity: row.humidity ?? "--",
                    ph: row.ph ?? "--",
                    rainfall: row.rainfall ?? "--",
                    predicted_crop: "INVALID ROW",
                    confidence: 0,
                    fertilizer: "--"
                };

            }

            const { crop, confidence } = predictCrop(inputData);

            const fertilizer =
                FERTILIZER_MAP[crop.toLowerCase()] ||
                "Balanced NPK fertilizer based on soil requirements.";

            return {
                row: index + 1,
                n: inputData.n,
                p: inputData.p,
                k: inputData.k,
                temperature: inputData.temperature,
                humidity: inputData.humidity,
                ph: inputData.ph,
                rainfall: inputData.rainfall,
                predicted_crop: crop,
                confidence,
                fertilizer
            };

        });

        displayCSVResults(results);

        message.textContent =
            `✅ ${results.length} rows predicted successfully.`;

    } catch (error) {
        console.error(error);
        message.textContent = "❌ " + error.message;
    }
}


function displayCSVResults(results) {

    const tbody =
        document.querySelector("#csvResultsTable tbody");

    tbody.innerHTML = "";

    results.forEach(result => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${result.row}</td>
            <td>${result.n}</td>
            <td>${result.p}</td>
            <td>${result.k}</td>
            <td>${result.temperature}</td>
            <td>${result.humidity}</td>
            <td>${result.ph}</td>
            <td>${result.rainfall}</td>
            <td><strong>🌾 ${result.predicted_crop}</strong></td>
            <td>${result.confidence}%</td>
            <td>${result.fertilizer}</td>
        `;

        tbody.appendChild(row);
    });
}
=======
```

>>>>>>> 2701f995008f88afa9d85da95826b4c382fedcde
