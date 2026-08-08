const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');
const DATASET_FILE = path.join(ROOT, 'Crop_recommendation.csv');

fs.mkdirSync(DATA_DIR, { recursive: true });

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [], predictions: [] }, null, 2));
}

const cropDataset = loadCropDataset();

function readStore() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeStore(store) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

function loadCropDataset() {
  if (!fs.existsSync(DATASET_FILE)) {
    return [];
  }

  const csvContent = fs.readFileSync(DATASET_FILE, 'utf8');
  const lines = csvContent.trim().split(/\r?\n/);

  if (lines.length < 2) {
    return [];
  }

  const header = lines[0].split(',').map(value => value.trim());
  const numericColumns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];

  return lines.slice(1).map(line => {
    const cells = line.split(',').map(value => value.trim());
    const row = {};

    header.forEach((key, index) => {
      row[key] = index < cells.length ? cells[index] : '';
    });

    numericColumns.forEach(key => {
      if (row[key] !== undefined && row[key] !== '') {
        row[key] = Number(row[key]);
      }
    });

    return row;
  });
}

function predictCropFromDataset(payload) {
  if (!Array.isArray(cropDataset) || cropDataset.length === 0) {
    return {
      crop: 'Dataset unavailable',
      confidence: 0,
      distance: Number.POSITIVE_INFINITY
    };
  }

  const numericFields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];

  const datasetPayload = {
    N: Number(payload.nitrogen ?? payload.N),
    P: Number(payload.phosphorus ?? payload.P),
    K: Number(payload.potassium ?? payload.K),
    temperature: Number(payload.temperature),
    humidity: Number(payload.humidity),
    ph: Number(payload.ph),
    rainfall: Number(payload.rainfall)
  };

  const datasetRows = cropDataset.map(row => {
    const numeric = {};
    numericFields.forEach(field => {
      numeric[field] = Number(row[field]);
    });
    return numeric;
  });

  const minValues = {};
  const maxValues = {};

  numericFields.forEach(field => {
    const values = cropDataset.map(row => Number(row[field]));
    minValues[field] = Math.min(...values);
    maxValues[field] = Math.max(...values);
  });

  const normalizedInput = {};
  numericFields.forEach(field => {
    const rawValue = Number(datasetPayload[field]);
    const range = maxValues[field] - minValues[field] || 1;
    normalizedInput[field] = (rawValue - minValues[field]) / range;
  });

  let bestMatch = null;
  let bestDatasetRow = null;
  let lowestDistance = Number.POSITIVE_INFINITY;

  datasetRows.forEach((row, index) => {
    let distance = 0;

    numericFields.forEach(field => {
      const range = maxValues[field] - minValues[field] || 1;
      const normalizedRowValue = (row[field] - minValues[field]) / range;
      const diff = normalizedInput[field] - normalizedRowValue;
      distance += diff * diff;
    });

    const finalDistance = Math.sqrt(distance);

    if (finalDistance < lowestDistance) {
      lowestDistance = finalDistance;
      bestMatch = row;
      bestDatasetRow = cropDataset[index];
    }
  });

  const confidence = Math.max(70, Math.round(97 - Math.min(lowestDistance * 100, 27)));

  return {
    crop: bestDatasetRow ? bestDatasetRow.label : 'Unknown crop',
    confidence,
    distance: lowestDistance
  };
}

function getFertilizerRecommendation(crop) {
  const cropMap = {
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

  const normalizedCrop = String(crop).toLowerCase();
  return cropMap[normalizedCrop] || 'Adaptive nutrient recommendation profile';
}

function serializeCropRecommendation(payload) {
  const temperature = Number(payload.temperature);
  const humidity = Number(payload.humidity);
  const ph = Number(payload.ph);
  const rainfall = Number(payload.rainfall);
  const nitrogen = Number(payload.nitrogen);
  const phosphorus = Number(payload.phosphorus);
  const potassium = Number(payload.potassium);

  const datasetPrediction = predictCropFromDataset(payload);
  const crop = datasetPrediction.crop;
  const fertilizer = getFertilizerRecommendation(crop);

  return {
    crop,
    fertilizer,
    confidence: datasetPrediction.confidence,
    summary: `${crop} is the nearest dataset fit for this field profile. ${fertilizer} is recommended to maintain target nutrition and moisture stability.`,
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

function handleApi(req, res, url) {
  if (url.pathname === '/api/health') {
    sendJson(res, 200, { status: 'online', app: 'AGRI MITRA backend', timestamp: new Date().toISOString() });
    return;
  }

  if (url.pathname === '/api/auth/signup' && req.method === 'POST') {
    readRequestBody(req, (error, body) => {
      if (error) {
        sendJson(res, 400, { message: 'Invalid request body.' });
        return;
      }

      const { name, email, password } = body;

      if (!name || !email || !password) {
        sendJson(res, 400, { message: 'Name, email, and password are required.' });
        return;
      }

      const store = readStore();
      const existing = store.users.find(user => user.email.toLowerCase() === String(email).toLowerCase());

      if (existing) {
        sendJson(res, 409, { message: 'An account already exists for this email.' });
        return;
      }

      const user = {
        id: randomUUID(),
        name,
        email: email.toLowerCase(),
        password,
        createdAt: new Date().toISOString()
      };

      store.users.push(user);
      writeStore(store);

      sendJson(res, 201, {
        message: 'Registration successful.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    });

    return;
  }

  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    readRequestBody(req, (error, body) => {
      if (error) {
        sendJson(res, 400, { message: 'Invalid request body.' });
        return;
      }

      const { email, password } = body;

      if (!email || !password) {
        sendJson(res, 400, { message: 'Email and password are required.' });
        return;
      }

      const store = readStore();
      const user = store.users.find(item => item.email.toLowerCase() === String(email).toLowerCase() && item.password === password);

      if (!user) {
        sendJson(res, 401, { message: 'Invalid email or password.' });
        return;
      }

      sendJson(res, 200, {
        message: 'Login successful.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    });

    return;
  }

  if (url.pathname === '/api/crop/predict' && req.method === 'POST') {
    readRequestBody(req, (error, body) => {
      if (error) {
        sendJson(res, 400, { message: 'Invalid prediction request.' });
        return;
      }

      const required = ['temperature', 'humidity', 'ph', 'rainfall', 'nitrogen', 'phosphorus', 'potassium'];
      const missing = required.filter(key => body[key] === undefined || body[key] === '');

      if (missing.length > 0) {
        sendJson(res, 400, { message: 'All crop prediction fields are required.' });
        return;
      }

      const recommendation = serializeCropRecommendation(body);
      const store = readStore();

      const prediction = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        result: recommendation
      };

      store.predictions.push(prediction);
      writeStore(store);

      sendJson(res, 200, {
        message: 'Prediction generated successfully.',
        prediction
      });
    });

    return;
  }

  sendJson(res, 404, { message: 'API route not found.' });
}

function readRequestBody(req, callback) {
  let body = '';

  req.on('data', chunk => {
    body += chunk;

    if (body.length > 1e6) {
      req.destroy();
      callback(new Error('Request body too large'));
    }
  });

  req.on('end', () => {
    if (!body) {
      callback(null, {});
      return;
    }

    try {
      callback(null, JSON.parse(body));
    } catch (err) {
      callback(err);
    }
  });

  req.on('error', err => callback(err));
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, { ok: true });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname.startsWith('/api/')) {
    handleApi(req, res, url);
    return;
  }

  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const safePath = path.normalize(requestedPath).replace(/^([.][.][\/\\])+/, '');
  const fullPath = path.join(ROOT, safePath);

  if (!fullPath.startsWith(ROOT)) {
    sendJson(res, 403, { message: 'Forbidden.' });
    return;
  }

  fs.readFile(fullPath, (error, data) => {
    if (error) {
      sendJson(res, 404, { message: 'File not found.' });
      return;
    }

    res.writeHead(200, {
      'Content-Type': getMimeType(fullPath),
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`AGRI MITRA backend running at http://localhost:${PORT}`);
});
