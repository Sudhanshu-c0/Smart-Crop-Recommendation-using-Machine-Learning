const cropForm = document.getElementById('cropForm');

// The dataset is stored in the public web folder and loaded at runtime.
const DATASET_URL = 'public/dataset.csv';
const FEATURE_COLUMNS = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];

let cropDataset = [];

// -----------------------------------------------------------------------------
// CSV loading and parsing helpers
// -----------------------------------------------------------------------------
async function loadDataset() {
    try {
        const response = await fetch(DATASET_URL);

        if (!response.ok) {
            throw new Error(`Unable to fetch dataset: ${response.status}`);
        }

        const csvText = await response.text();
        cropDataset = parseCropCsv(csvText);
        return cropDataset;
    } catch (error) {
        console.error('CSV loading failed:', error);
        return [];
    }
}

function parseCropCsv(csvText) {
    const rows = csvText.trim().split(/\r?\n/);

    if (rows.length < 2) {
        throw new Error('The dataset file is empty or malformed.');
    }

    const headers = rows[0].split(',').map(value => value.trim());
    const outputRows = [];

    for (let i = 1; i < rows.length; i += 1) {
        const line = rows[i].trim();

        if (!line) {
            continue;
        }

        const values = line.split(',').map(value => value.trim());
        const rowData = {};

        headers.forEach((header, index) => {
            if (header === 'label') {
                rowData[header] = values[index] || '';
            } else if (FEATURE_COLUMNS.includes(header)) {
                const numericValue = Number(values[index]);
                rowData[header] = Number.isNaN(numericValue) ? null : numericValue;
            } else {
                rowData[header] = values[index] || '';
            }
        });

        outputRows.push(rowData);
    }

    return outputRows;
}

// -----------------------------------------------------------------------------
// KNN prediction method
// -----------------------------------------------------------------------------
function computeMinMax(dataset) {
    const minMax = {};

    FEATURE_COLUMNS.forEach((column) => {
        const values = dataset.map(row => Number(row[column]));
        minMax[column] = {
            min: Math.min(...values),
            max: Math.max(...values)
        };
    });

    return minMax;
}

function normalizeValue(value, min, max) {
    if (max === min) {
        return 0;
    }

    return (value - min) / (max - min);
}

function normalizeInput(inputValues, minMax) {
    const userVector = {};

    FEATURE_COLUMNS.forEach((column) => {
        const rawValue = Number(inputValues[column]);
        const { min, max } = minMax[column];
        userVector[column] = normalizeValue(rawValue, min, max);
    });

    return userVector;
}

function normalizeDataset(dataset, minMax) {
    return dataset.map((row) => {
        const normalizedRow = {};

        FEATURE_COLUMNS.forEach((column) => {
            const { min, max } = minMax[column];
            normalizedRow[column] = normalizeValue(Number(row[column]), min, max);
        });

        normalizedRow.label = row.label;
        return normalizedRow;
    });
}

function calculateEuclideanDistance(inputVector, datasetVector) {
    let total = 0;

    FEATURE_COLUMNS.forEach((column) => {
        const diff = inputVector[column] - datasetVector[column];
        total += diff * diff;
    });

    return Math.sqrt(total);
}

function predictCropWithKnn(inputValues, dataset, k = 4) {
    if (!dataset || dataset.length === 0) {
        return null;
    }

    const minMax = computeMinMax(dataset);
    const normalizedDataset = normalizeDataset(dataset, minMax);
    const normalizedInput = normalizeInput(inputValues, minMax);

    const neighbors = normalizedDataset.map((row, index) => {
        const distance = calculateEuclideanDistance(normalizedInput, row);
        return {
            label: dataset[index].label,
            distance
        };
    });

    neighbors.sort((a, b) => a.distance - b.distance);
    const closest = neighbors.slice(0, k);

    const votes = {};

    closest.forEach((row) => {
        votes[row.label] = (votes[row.label] || 0) + 1;
    });

    const prediction = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];

    if (!prediction) {
        return null;
    }

    const confidence = Math.round((prediction[1] / closest.length) * 100);

    return {
        crop: prediction[0],
        confidence,
        neighbors: closest
    };
}

if (cropForm) {
    cropForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const inputValues = {};
        const requiredFields = {
            N: 'nitrogen',
            P: 'phosphorus',
            K: 'potassium',
            temperature: 'temperature',
            humidity: 'humidity',
            ph: 'ph',
            rainfall: 'rainfall'
        };

        const message = document.getElementById('cropMessage');
        const resultCard = document.getElementById('predictionResult');
        const resultCrop = document.getElementById('resultCrop');
        const resultSummary = document.getElementById('resultSummary');
        const resultConfidence = document.getElementById('resultConfidence');
        const resultFertilizer = document.getElementById('resultFertilizer');
        const predictionTime = document.getElementById('predictionTime');

        // Validate the dashboard fields before prediction.
        const emptyFields = Object.entries(requiredFields).filter(([key, fieldName]) => {
            const value = cropForm.elements[fieldName]?.value;
            return value === '' || value === null || value === undefined;
        });

        if (emptyFields.length > 0) {
            message.textContent = 'Enter all soil and weather values before predicting.';
            message.className = 'message error';
            return;
        }

        try {
            const raw = {
                N: Number(cropForm.elements.nitrogen.value),
                P: Number(cropForm.elements.phosphorus.value),
                K: Number(cropForm.elements.potassium.value),
                temperature: Number(cropForm.elements.temperature.value),
                humidity: Number(cropForm.elements.humidity.value),
                ph: Number(cropForm.elements.ph.value),
                rainfall: Number(cropForm.elements.rainfall.value)
            };

            const invalidInputs = Object.values(raw).some((value) => !Number.isFinite(value));

            if (invalidInputs) {
                message.textContent = 'Use valid numbers for every crop recommendation input.';
                message.className = 'message error';
                return;
            }

            if (!cropDataset.length) {
                message.textContent = 'Dataset has not loaded yet. Refresh the page.';
                message.className = 'message error';
                return;
            }

            message.textContent = 'Running field intelligence model...';
            message.className = 'message';

            const prediction = predictCropWithKnn(raw, cropDataset, 4);

            if (!prediction) {
                message.textContent = 'No prediction was available from the dataset.';
                message.className = 'message error';
                return;
            }

            const crop = prediction.crop;
            const fertilizerMap = {
                rice: 'Nitrogen-rich soil supplement',
                maize: 'Phosphorus and potassium soil nutrition plan',
                chickpea: 'Balanced legume nutrition mix',
                kidneybeans: 'Low-N nitrogen controlled blend',
                cotton: 'Potassium and phosphorus grow feed',
                jute: 'Organic compost and nitrogen balance',
                coffee: 'Acid soil correction and potassium plan',
                banana: 'High potassium irrigation nutrition',
                papaya: 'Micronutrient and water-sensitive nutrient plan',
                coconut: 'Organic potassium and magnesium nutrition plan',
                orange: 'Calcium enrichment and balanced NPK',
                apple: 'Controlled nitrogen soil support',
                muskmelon: 'Water efficient balanced nutrient plan',
                grape: 'NPK micro nutrient monitoring',
                watermelon: 'Potassium boost and irrigation support',
                mungbean: 'Nitrogen light crop fertilizer blend',
                lentil: 'Low nitrogen soil support',
                pomegranate: 'Balanced macro fertilizer structure',
                mango: 'Cation-balanced nutrient plan'
            };

            resultCard.classList.add('is-visible');
            resultCrop.textContent = crop;
            resultSummary.textContent = `${crop} is the most suitable crop from the current dataset neighborhood. ${fertilizerMap[crop] || 'Adaptive nutrient recommendation profile'} is recommended.`;
            resultConfidence.textContent = `Confidence: ${prediction.confidence}%`;
            resultFertilizer.textContent = `Nearest records: ${prediction.neighbors.length}`;
            predictionTime.textContent = new Date().toLocaleString();

            message.textContent = 'Prediction complete.';
            message.className = 'message success';
        } catch (error) {
            console.error('Prediction error:', error);
            message.textContent = 'Unable to compute the crop recommendation.';
            message.className = 'message error';
        }
    });
}

// Load the public dataset immediately when the dashboard script initializes.
loadDataset();
