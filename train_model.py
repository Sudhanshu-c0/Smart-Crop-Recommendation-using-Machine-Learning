import os
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ==============================
# FILE PATHS
# ==============================

DATASET_PATH = "Crop_recommendation.csv"
MODEL_PATH = "crop_model.pkl"


# ==============================
# LOAD DATASET
# ==============================

if not os.path.exists(DATASET_PATH):
    raise FileNotFoundError(
        f"{DATASET_PATH} not found. "
        "Make sure the CSV is in the same folder."
    )

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded successfully!")
print("Shape:", df.shape)
print("Columns:", list(df.columns))


# ==============================
# CLEAN COLUMN NAMES
# ==============================

df.columns = df.columns.str.strip().str.lower()


# ==============================
# FEATURES
# ==============================

features = [
    "n",
    "p",
    "k",
    "temperature",
    "humidity",
    "ph",
    "rainfall"
]

target = "label"


# ==============================
# CHECK COLUMNS
# ==============================

missing = [
    column
    for column in features + [target]
    if column not in df.columns
]

if missing:
    raise ValueError(
        f"Missing columns: {missing}"
    )


# ==============================
# CLEAN DATA
# ==============================

df = df.dropna(
    subset=features + [target]
)

X = df[features]
y = df[target].astype(str).str.strip()


# ==============================
# SPLIT DATA
# ==============================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# ==============================
# TRAIN MODEL
# ==============================

print("\nTraining model...")

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)


# ==============================
# EVALUATE
# ==============================

predictions = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print("\nModel Accuracy:")
print(f"{accuracy * 100:.2f}%")


print("\nClassification Report:")
print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


# ==============================
# SAVE MODEL
# ==============================

model_data = {
    "model": model,
    "features": features
}

joblib.dump(
    model_data,
    MODEL_PATH
)

print("\nModel saved successfully!")
print(f"File: {MODEL_PATH}")