import os
import re
import time
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline
from sklearn.metrics import (
    classification_report,
    accuracy_score,
    confusion_matrix
)

# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEIGHTS_DIR = os.path.join(BASE_DIR, "model_weights")

os.makedirs(WEIGHTS_DIR, exist_ok=True)

dataframes = []


# ============================================================
# 1. LOAD SMS DATASET
# ============================================================

sms_path = os.path.join(BASE_DIR, "SMSSpamCollection")

if os.path.exists(sms_path):
    print("Loading SMS dataset...")

    df_sms = pd.read_csv(
        sms_path,
        sep="\t",
        names=["label_raw", "text"],
        on_bad_lines="skip"
    )

    df_sms["label"] = df_sms["label_raw"].map({
        "ham": 0,
        "spam": 1
    })

    dataframes.append(
        df_sms[["text", "label"]]
    )

    print(f"Loaded {len(df_sms)} SMS records.")

else:
    print(f"Warning: '{sms_path}' not found.")


# ============================================================
# 2. LOAD EMAIL DATASET
# ============================================================

email_path = os.path.join(BASE_DIR, "CEAS_08.csv")

if os.path.exists(email_path):

    print("Loading Email dataset (CEAS_08.csv)...")

    try:
        df_email = pd.read_csv(
            email_path,
            on_bad_lines="skip"
        )

        text_col = (
            "subject"
            if "subject" in df_email.columns
            else (
                "text"
                if "text" in df_email.columns
                else df_email.columns[0]
            )
        )

        label_col = (
            "label"
            if "label" in df_email.columns
            else df_email.columns[-1]
        )

        if (
            "subject" in df_email.columns
            and "body" in df_email.columns
        ):
            df_email["text"] = (
                df_email["subject"].fillna("")
                + " "
                + df_email["body"].fillna("")
            )
        else:
            df_email["text"] = df_email[text_col]

        df_email["label"] = df_email[label_col].astype(int)

        dataframes.append(
            df_email[["text", "label"]]
        )

        print(
            f"Loaded {len(df_email)} Email records."
        )

    except Exception as e:
        print(f"Error reading CEAS_08.csv: {e}")

else:
    print(f"Warning: '{email_path}' not found.")


# ============================================================
# 3. LOAD URL DATASET
# ============================================================

url_path = os.path.join(BASE_DIR, "malicious_phish.csv")

if os.path.exists(url_path):

    print(
        "Loading URL dataset "
        "(malicious_phish.csv)..."
    )

    try:
        df_url = pd.read_csv(
            url_path,
            on_bad_lines="skip"
        )

        url_col = (
            "url"
            if "url" in df_url.columns
            else df_url.columns[0]
        )

        label_col = (
            "type"
            if "type" in df_url.columns
            else df_url.columns[1]
        )

        df_url["text"] = df_url[url_col]

        df_url["label"] = df_url[label_col].apply(
            lambda x:
                0
                if str(x).lower()
                in ["benign", "0", "safe"]
                else 1
        )

        dataframes.append(
            df_url[["text", "label"]]
        )

        print(
            f"Loaded {len(df_url)} URL records."
        )

    except Exception as e:
        print(
            f"Error reading malicious_phish.csv: {e}"
        )

else:
    print(
        f"Warning: '{url_path}' not found."
    )


# ============================================================
# MERGE DATASETS
# ============================================================

if not dataframes:
    raise RuntimeError(
        "No datasets were successfully loaded!"
    )

full_df = (
    pd.concat(
        dataframes,
        ignore_index=True
    )
    .dropna()
)

print(
    f"\nCombined dataset total size: "
    f"{len(full_df)} rows."
)


# ============================================================
# TEXT PREPROCESSING
# ============================================================

def preprocess_text(text):

    text = str(text)

    text = re.sub(
        r'https?://',
        'http ',
        text
    )

    text = re.sub(
        r'[^a-zA-Z0-9\s]',
        ' ',
        text
    )

    return text.lower()


print(
    "Preprocessing text feature column..."
)

full_df["clean_text"] = (
    full_df["text"]
    .apply(preprocess_text)
)


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(

    full_df["clean_text"],

    full_df["label"],

    test_size=0.2,

    random_state=42,

    stratify=full_df["label"]
)

print(
    f"\nTraining samples: {len(X_train)}"
)

print(
    f"Testing samples: {len(X_test)}"
)


# ============================================================
# MODEL PIPELINE
# ============================================================

print(
    "\nTraining optimized "
    "TF-IDF + Random Forest model..."
)

model_pipeline = make_pipeline(

    TfidfVectorizer(

        # Keep the same 20,000 features
        # so we don't unnecessarily change
        # the feature representation.
        ngram_range=(1, 2),

        max_features=20000,

        stop_words="english"
    ),

    RandomForestClassifier(

        # Reduced from 100 to 50 trees
        n_estimators=50,

        # Prevent extremely deep trees
        max_depth=30,

        n_jobs=-1,

        random_state=42
    )
)


# ============================================================
# TRAINING
# ============================================================

training_start = time.perf_counter()

model_pipeline.fit(
    X_train,
    y_train
)

training_time = (
    time.perf_counter()
    - training_start
)

print(
    f"\nTraining time: "
    f"{training_time:.2f} seconds"
)


# ============================================================
# PREDICTION
# ============================================================

prediction_start = time.perf_counter()

y_pred = model_pipeline.predict(
    X_test
)

prediction_time = (
    time.perf_counter()
    - prediction_start
)


# ============================================================
# PERFORMANCE METRICS
# ============================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)

print(
    "\n=========================================="
)

print(
    f"Accuracy: {accuracy * 100:.2f}%"
)

print(
    f"Prediction time: "
    f"{prediction_time:.4f} seconds"
)

print(
    f"Average prediction time: "
    f"{(prediction_time / len(X_test)) * 1000:.4f} ms/sample"
)

print(
    "==========================================\n"
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print(
    "Classification Report:"
)

print(
    classification_report(
        y_test,
        y_pred,
        target_names=[
            "Safe",
            "Spam/Phishing"
        ]
    )
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print(
    "Confusion Matrix:"
)

print(
    confusion_matrix(
        y_test,
        y_pred
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

model_output_path = os.path.join(
    WEIGHTS_DIR,
    "fraud_detector_model.pkl"
)

print(
    "\nSaving model..."
)

joblib.dump(
    model_pipeline,
    model_output_path,
    compress=3
)


# ============================================================
# MODEL SIZE
# ============================================================

model_size_bytes = os.path.getsize(
    model_output_path
)

model_size_mb = (
    model_size_bytes
    / (1024 * 1024)
)

print(
    f"\nModel saved successfully to:"
    f"\n{model_output_path}"
)

print(
    f"\nModel size: "
    f"{model_size_mb:.2f} MB"
)

print(
    "\n=========================================="
)

print("TRAINING COMPLETE")

print(
    f"Accuracy: {accuracy * 100:.2f}%"
)

print(
    f"Training time: "
    f"{training_time:.2f} seconds"
)

print(
    f"Prediction time: "
    f"{prediction_time:.4f} seconds"
)

print(
    f"Model size: "
    f"{model_size_mb:.2f} MB"
)

print(
    "=========================================="
)