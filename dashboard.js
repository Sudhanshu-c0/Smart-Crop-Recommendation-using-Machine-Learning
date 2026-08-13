const cropForm = document.getElementById("cropForm");


// ============================================================
// AGRI MITRA - CROP PREDICTION
// Connects dashboard → Node.js → Python → crop_model.pkl
// ============================================================

if (cropForm) {

    cropForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        // ------------------------------------------------------
        // Get result elements
        // ------------------------------------------------------

        const message =
            document.getElementById("cropMessage");

        const resultCard =
            document.getElementById("predictionResult");

        const resultCrop =
            document.getElementById("resultCrop");

        const resultSummary =
            document.getElementById("resultSummary");

        const resultConfidence =
            document.getElementById("resultConfidence");

        const resultFertilizer =
            document.getElementById("resultFertilizer");

        const predictionTime =
            document.getElementById("predictionTime");


        // ------------------------------------------------------
        // Read dashboard inputs
        // ------------------------------------------------------

        const inputData = {

            n: Number(
                cropForm.elements.nitrogen.value
            ),

            p: Number(
                cropForm.elements.phosphorus.value
            ),

            k: Number(
                cropForm.elements.potassium.value
            ),

            temperature: Number(
                cropForm.elements.temperature.value
            ),

            humidity: Number(
                cropForm.elements.humidity.value
            ),

            ph: Number(
                cropForm.elements.ph.value
            ),

            rainfall: Number(
                cropForm.elements.rainfall.value
            )

        };


        // ------------------------------------------------------
        // Validate inputs
        // ------------------------------------------------------

        const invalid =
            Object.values(inputData).some(
                value => !Number.isFinite(value)
            );


        if (invalid) {

            message.textContent =
                "Please enter valid values in all fields.";

            message.className =
                "message error";

            return;

        }


        // ------------------------------------------------------
        // Loading state
        // ------------------------------------------------------

        message.textContent =
            "🌱 AGRI MITRA is analyzing your field...";

        message.className =
            "message";


        resultCrop.textContent =
            "ANALYZING...";

        resultSummary.textContent =
            "Checking soil nutrients and weather conditions.";

        resultConfidence.textContent =
            "Confidence: --";

        resultFertilizer.textContent =
            "Fertilizer: --";


        // ------------------------------------------------------
        // Send data to Node.js backend
        // ------------------------------------------------------

        try {

            const response =
                await fetch(
                    "http://localhost:3000/api/predict",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(inputData)

                    }
                );


            const data =
                await response.json();


            // --------------------------------------------------
            // Backend error
            // --------------------------------------------------

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Prediction failed."
                );

            }


            // --------------------------------------------------
            // Prediction received
            // --------------------------------------------------

            const crop =
                data.crop;


            const confidence =
                data.confidence;


            // --------------------------------------------------
            // Fertilizer recommendations
            // --------------------------------------------------

            const fertilizerMap = {

                rice:
                    "Nitrogen-rich fertilizer such as Urea with balanced NPK support.",

                maize:
                    "NPK fertilizer with good nitrogen and phosphorus support.",

                chickpea:
                    "Phosphorus-rich fertilizer with controlled nitrogen.",

                kidneybeans:
                    "Phosphorus and potassium fertilizer with limited nitrogen.",

                pigeonpeas:
                    "Phosphorus-rich fertilizer with organic manure.",

                cotton:
                    "Balanced NPK fertilizer with additional potassium.",

                jute:
                    "Nitrogen-rich fertilizer with organic compost.",

                coffee:
                    "Balanced NPK fertilizer with organic compost.",

                banana:
                    "Potassium-rich NPK fertilizer with organic manure.",

                papaya:
                    "Nitrogen and potassium-rich fertilizer with micronutrients.",

                coconut:
                    "Potassium and magnesium-rich fertilizer with organic manure.",

                orange:
                    "Balanced NPK fertilizer with potassium and micronutrients.",

                apple:
                    "Balanced NPK fertilizer with controlled nitrogen.",

                muskmelon:
                    "Balanced NPK fertilizer with additional potassium.",

                grape:
                    "Balanced NPK fertilizer with micronutrient support.",

                watermelon:
                    "Potassium-rich fertilizer with proper irrigation support.",

                mungbean:
                    "Phosphorus-rich fertilizer with controlled nitrogen.",

                lentil:
                    "Phosphorus-rich fertilizer with limited nitrogen.",

                pomegranate:
                    "Balanced NPK fertilizer with additional potassium.",

                mango:
                    "Balanced NPK fertilizer with organic compost."

            };


            const fertilizer =
                fertilizerMap[
                    crop.toLowerCase()
                ] ||
                "Use a balanced NPK fertilizer according to soil-test results.";


            // --------------------------------------------------
            // Display result
            // --------------------------------------------------

            resultCard.classList.add(
                "is-visible"
            );


            resultCrop.textContent =
                crop.toUpperCase();


            resultSummary.textContent =
                `Based on your soil and weather conditions, AGRI MITRA recommends ${crop} as the most suitable crop.`;


            resultConfidence.textContent =
                `🎯 Confidence: ${confidence}%`;


            resultFertilizer.textContent =
                `🌱 Fertilizer: ${fertilizer}`;


            predictionTime.textContent =
                new Date().toLocaleString();


            message.textContent =
                "✅ Crop prediction completed successfully.";

            message.className =
                "message success";


        } catch (error) {

            console.error(
                "Prediction error:",
                error
            );


            message.textContent =
                "❌ Unable to connect to the prediction server.";

            message.className =
                "message error";


            resultCrop.textContent =
                "--";


            resultSummary.textContent =
                "Make sure the AGRI MITRA backend is running.";

            resultConfidence.textContent =
                "Confidence: --";

            resultFertilizer.textContent =
                "Fertilizer: --";

        }

    });

}
```
