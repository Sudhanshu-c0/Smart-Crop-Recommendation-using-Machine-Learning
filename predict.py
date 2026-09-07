import sys
import json
import joblib

MODEL_PATH = "crop_model.pkl"

model_data = joblib.load(MODEL_PATH)

model = model_data["model"]

data = json.loads(sys.stdin.read())

values = [[
    float(data["n"]),
    float(data["p"]),
    float(data["k"]),
    float(data["temperature"]),
    float(data["humidity"]),
    float(data["ph"]),
    float(data["rainfall"])
]]

prediction = model.predict(values)[0]

probabilities = model.predict_proba(values)[0]

confidence = max(probabilities) * 100

result = {
    "crop": str(prediction),
    "confidence": round(confidence, 2)
}

print(json.dumps(result))
