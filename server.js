const http = require("http");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const { spawn } = require("child_process");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");
const MODEL_FILE = path.join(ROOT, "crop_model.pkl");


// ======================================================
// CREATE DATA FOLDER / STORE
// ======================================================

fs.mkdirSync(DATA_DIR, { recursive: true });

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(
            {
                users: [],
                predictions: []
            },
            null,
            2
        )
    );
}


// ======================================================
// STORE FUNCTIONS
// ======================================================

function readStore() {
    try {
        return JSON.parse(
            fs.readFileSync(DATA_FILE, "utf8")
        );
    } catch (error) {
        return {
            users: [],
            predictions: []
        };
    }
}


function writeStore(store) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(store, null, 2)
    );
}


// ======================================================
// JSON RESPONSE
// ======================================================

function sendJson(res, statusCode, payload) {

    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });

    res.end(
        JSON.stringify(payload)
    );
}


// ======================================================
// MIME TYPES
// ======================================================

function getMimeType(filePath) {

    const ext =
        path.extname(filePath).toLowerCase();

    const mimeTypes = {

        ".html":
            "text/html; charset=utf-8",

        ".css":
            "text/css; charset=utf-8",

        ".js":
            "application/javascript; charset=utf-8",

        ".json":
            "application/json; charset=utf-8",

        ".png":
            "image/png",

        ".jpg":
            "image/jpeg",

        ".jpeg":
            "image/jpeg",

        ".svg":
            "image/svg+xml",

        ".ico":
            "image/x-icon"
    };

    return (
        mimeTypes[ext] ||
        "application/octet-stream"
    );
}


// ======================================================
// READ REQUEST BODY
// ======================================================

function readRequestBody(req, callback) {

    let body = "";

    req.on("data", chunk => {

        body += chunk;

        if (body.length > 1e6) {

            req.destroy();

            callback(
                new Error(
                    "Request body too large"
                )
            );
        }
    });


    req.on("end", () => {

        if (!body) {

            callback(null, {});

            return;
        }


        try {

            const data =
                JSON.parse(body);

            callback(null, data);

        } catch (error) {

            callback(error);

        }

    });


    req.on("error", error => {

        callback(error);

    });

}


// ======================================================
// RUN PYTHON ML MODEL
// ======================================================

function predictCropWithModel(payload) {

    return new Promise(
        (resolve, reject) => {

            if (!fs.existsSync(MODEL_FILE)) {

                reject(
                    new Error(
                        "crop_model.pkl not found."
                    )
                );

                return;
            }


            const python =
                spawn(
                    "python",
                    ["predict.py"],
                    {
                        cwd: ROOT
                    }
                );


            let output = "";
            let errorOutput = "";


            // Send dashboard data to Python
            const pythonInput = {

                n:
                    Number(
                        payload.nitrogen
                    ),

                p:
                    Number(
                        payload.phosphorus
                    ),

                k:
                    Number(
                        payload.potassium
                    ),

                temperature:
                    Number(
                        payload.temperature
                    ),

                humidity:
                    Number(
                        payload.humidity
                    ),

                ph:
                    Number(
                        payload.ph
                    ),

                rainfall:
                    Number(
                        payload.rainfall
                    )
            };


            python.stdin.write(
                JSON.stringify(
                    pythonInput
                )
            );


            python.stdin.end();


            // Python output
            python.stdout.on(
                "data",
                data => {

                    output +=
                        data.toString();

                }
            );


            // Python error
            python.stderr.on(
                "data",
                data => {

                    errorOutput +=
                        data.toString();

                }
            );


            python.on(
                "error",
                error => {

                    reject(error);

                }
            );


            python.on(
                "close",
                code => {

                    if (code !== 0) {

                        console.error(
                            "Python error:",
                            errorOutput
                        );

                        reject(
                            new Error(
                                errorOutput ||
                                "Python prediction failed."
                            )
                        );

                        return;
                    }


                    try {

                        const result =
                            JSON.parse(
                                output.trim()
                            );


                        resolve(result);

                    } catch (error) {

                        console.error(
                            "Invalid Python output:"
                        );

                        console.error(
                            output
                        );

                        reject(
                            new Error(
                                "Invalid response from predict.py"
                            )
                        );
                    }

                }
            );

        }
    );

}


// ======================================================
// FERTILIZER RECOMMENDATION
// ======================================================

function getFertilizerRecommendation(
    crop
) {

    const cropMap = {

        rice:
            "Nitrogen-rich fertilizer with balanced NPK support",

        maize:
            "Phosphorus and potassium rich NPK fertilizer",

        chickpea:
            "Balanced phosphorus and potassium nutrition",

        kidneybeans:
            "Low-nitrogen fertilizer with phosphorus support",

        cotton:
            "Potassium and phosphorus rich fertilizer",

        jute:
            "Nitrogen-rich fertilizer with organic compost",

        coffee:
            "Acid-soil friendly fertilizer with potassium",

        banana:
            "High-potassium fertilizer with balanced NPK",

        papaya:
            "Balanced NPK with micronutrient support",

        orange:
            "Balanced NPK with calcium and micronutrients",

        apple:
            "Controlled nitrogen and balanced NPK",

        muskmelon:
            "Balanced NPK with potassium support",

        grape:
            "Balanced NPK with micronutrient monitoring",

        watermelon:
            "Potassium-rich fertilizer with balanced NPK",

        mungbean:
            "Low-nitrogen fertilizer with phosphorus support",

        lentil:
            "Low-nitrogen fertilizer with phosphorus support",

        pomegranate:
            "Balanced NPK fertilizer",

        mango:
            "Balanced NPK with potassium support"
    };


    const normalizedCrop =
        String(crop)
            .toLowerCase()
            .trim();


    return (
        cropMap[normalizedCrop] ||
        "Balanced NPK fertilizer based on soil requirements"
    );
}


// ======================================================
// CREATE FINAL RECOMMENDATION
// ======================================================

async function serializeCropRecommendation(
    payload
) {

    const temperature =
        Number(payload.temperature);

    const humidity =
        Number(payload.humidity);

    const ph =
        Number(payload.ph);

    const rainfall =
        Number(payload.rainfall);

    const nitrogen =
        Number(payload.nitrogen);

    const phosphorus =
        Number(payload.phosphorus);

    const potassium =
        Number(payload.potassium);


    // ==============================================
    // USE TRAINED RANDOM FOREST MODEL
    // ==============================================

    const modelPrediction =
        await predictCropWithModel(
            payload
        );


    const crop =
        modelPrediction.crop;


    const confidence =
        Number(
            modelPrediction.confidence
        );


    const fertilizer =
        getFertilizerRecommendation(
            crop
        );


    return {

        crop,

        fertilizer,

        confidence,

        summary:
            `${crop} is recommended based on the soil nutrients, temperature, humidity, pH and rainfall provided.`,

        inputs: {

            temperature,

            humidity,

            ph,

            rainfall,

            nitrogen,

            phosphorus,

            potassium

        }

    };

}


// ======================================================
// API HANDLER
// ======================================================

function handleApi(
    req,
    res,
    url
) {


    // ==================================================
    // HEALTH CHECK
    // ==================================================

    if (
        url.pathname ===
        "/api/health"
    ) {

        sendJson(
            res,
            200,
            {

                status: "online",

                app:
                    "AGRI MITRA backend",

                model:
                    fs.existsSync(
                        MODEL_FILE
                    )
                        ? "loaded"
                        : "missing",

                timestamp:
                    new Date().toISOString()

            }
        );

        return;
    }


    // ==================================================
    // SIGN UP
    // ==================================================

    if (
        url.pathname ===
        "/api/auth/signup" &&
        req.method === "POST"
    ) {

        readRequestBody(
            req,
            (error, body) => {

                if (error) {

                    sendJson(
                        res,
                        400,
                        {
                            message:
                                "Invalid request body."
                        }
                    );

                    return;
                }


                const {
                    name,
                    email,
                    password
                } = body;


                if (
                    !name ||
                    !email ||
                    !password
                ) {

                    sendJson(
                        res,
                        400,
                        {
                            message:
                                "Name, email, and password are required."
                        }
                    );

                    return;
                }


                const store =
                    readStore();


                const existing =
                    store.users.find(
                        user =>
                            user.email
                                .toLowerCase() ===
                            String(email)
                                .toLowerCase()
                    );


                if (existing) {

                    sendJson(
                        res,
                        409,
                        {
                            message:
                                "An account already exists for this email."
                        }
                    );

                    return;
                }


                const user = {

                    id:
                        randomUUID(),

                    name,

                    email:
                        String(email)
                            .toLowerCase(),

                    password,

                    createdAt:
                        new Date()
                            .toISOString()

                };


                store.users.push(
                    user
                );


                writeStore(
                    store
                );


                sendJson(
                    res,
                    201,
                    {

                        message:
                            "Registration successful.",

                        user: {

                            id:
                                user.id,

                            name:
                                user.name,

                            email:
                                user.email

                        }

                    }
                );

            }
        );

        return;
    }


    // ==================================================
    // LOGIN
    // ==================================================

    if (
        url.pathname ===
        "/api/auth/login" &&
        req.method === "POST"
    ) {

        readRequestBody(
            req,
            (error, body) => {

                if (error) {

                    sendJson(
                        res,
                        400,
                        {
                            message:
                                "Invalid request body."
                        }
                    );

                    return;
                }


                const {
                    email,
                    password
                } = body;


                if (
                    !email ||
                    !password
                ) {

                    sendJson(
                        res,
                        400,
                        {
                            message:
                                "Email and password are required."
                        }
                    );

                    return;
                }


                const store =
                    readStore();


                const user =
                    store.users.find(
                        item =>
                            item.email
                                .toLowerCase() ===
                            String(email)
                                .toLowerCase() &&
                            item.password ===
                                password
                    );


                if (!user) {

                    sendJson(
                        res,
                        401,
                        {
                            message:
                                "Invalid email or password."
                        }
                    );

                    return;
                }


                sendJson(
                    res,
                    200,
                    {

                        message:
                            "Login successful.",

                        user: {

                            id:
                                user.id,

                            name:
                                user.name,

                            email:
                                user.email

                        }

                    }
                );

            }
        );

        return;
    }


    // ==================================================
    // CROP PREDICTION
    // ==================================================

    if (
        url.pathname ===
        "/api/crop/predict" &&
        req.method === "POST"
    ) {

        readRequestBody(
            req,
            async (error, body) => {

                if (error) {

                    sendJson(
                        res,
                        400,
                        {
                            message:
                                "Invalid prediction request."
                        }
                    );

                    return;
                }


                const required = [

                    "temperature",

                    "humidity",

                    "ph",

                    "rainfall",

                    "nitrogen",

                    "phosphorus",

                    "potassium"

                ];


                const missing =
                    required.filter(
                        key =>
                            body[key] ===
                                undefined ||
                            body[key] === ""
                    );


                if (
                    missing.length > 0
                ) {

                    sendJson(
                        res,
                        400,
                        {

                            message:
                                "All crop prediction fields are required.",

                            missing

                        }
                    );

                    return;
                }


                try {

                    console.log(
                        "\n🌱 New crop prediction request"
                    );


                    console.log(
                        "Input:",
                        body
                    );


                    const recommendation =
                        await serializeCropRecommendation(
                            body
                        );


                    console.log(
                        "Prediction:",
                        recommendation.crop
                    );


                    const store =
                        readStore();


                    const prediction = {

                        id:
                            randomUUID(),

                        createdAt:
                            new Date()
                                .toISOString(),

                        result:
                            recommendation

                    };


                    store.predictions.push(
                        prediction
                    );


                    writeStore(
                        store
                    );


                    sendJson(
                        res,
                        200,
                        {

                            message:
                                "Prediction generated successfully.",

                            prediction

                        }
                    );

                } catch (error) {

                    console.error(
                        "Prediction failed:",
                        error
                    );


                    sendJson(
                        res,
                        500,
                        {

                            message:
                                "ML prediction failed.",

                            error:
                                error.message

                        }
                    );

                }

            }
        );

        return;
    }


    // ==================================================
    // UNKNOWN API
    // ==================================================

    sendJson(
        res,
        404,
        {
            message:
                "API route not found."
        }
    );

}


// ======================================================
// HTTP SERVER
// ======================================================

const server =
    http.createServer(
        (req, res) => {


            // OPTIONS / CORS
            if (
                req.method ===
                "OPTIONS"
            ) {

                sendJson(
                    res,
                    200,
                    {
                        ok: true
                    }
                );

                return;
            }


            const url =
                new URL(
                    req.url,
                    `http://${req.headers.host}`
                );


            // API REQUEST
            if (
                url.pathname.startsWith(
                    "/api/"
                )
            ) {

                handleApi(
                    req,
                    res,
                    url
                );

                return;
            }


            // ==================================================
            // STATIC FILE SERVER
            // ==================================================

            const requestedPath =
                url.pathname === "/"
                    ? "/index.html"
                    : url.pathname;


            const safePath =
                path
                    .normalize(
                        requestedPath
                    )
                    .replace(
                        /^([.][.][\/\\])+/, 
                        ""
                    );


            const fullPath =
                path.join(
                    ROOT,
                    safePath
                );


            // Prevent directory traversal
            if (
                !fullPath.startsWith(
                    ROOT
                )
            ) {

                sendJson(
                    res,
                    403,
                    {
                        message:
                            "Forbidden."
                    }
                );

                return;
            }


            fs.readFile(
                fullPath,
                (error, data) => {

                    if (error) {

                        sendJson(
                            res,
                            404,
                            {
                                message:
                                    "File not found."
                            }
                        );

                        return;
                    }


                    res.writeHead(
                        200,
                        {

                            "Content-Type":
                                getMimeType(
                                    fullPath
                                ),

                            "Access-Control-Allow-Origin":
                                "*"

                        }
                    );


                    res.end(
                        data
                    );

                }
            );

        }
    );


// ======================================================
// START SERVER
// ======================================================

server.listen(
    PORT,
    () => {

        console.log(
            `\n🌱 AGRI MITRA backend running at http://localhost:${PORT}`
        );

        console.log(
            `🤖 ML model: ${
                fs.existsSync(MODEL_FILE)
                    ? "READY"
                    : "NOT FOUND"
            }`
        );

        console.log(
            "📊 Prediction API: /api/crop/predict"
        );

    }
);