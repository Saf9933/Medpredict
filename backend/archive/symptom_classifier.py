import pandas as pd
from fuzzywuzzy import fuzz
import os


# ------------------------- Load Datasets -------------------------
symptom_csv = "archive/DiseaseAndSymptoms.csv"
precaution_csv = "archive/Disease precaution.csv"

if not os.path.exists(symptom_csv) or not os.path.exists(precaution_csv):
    print(" Make sure both CSV files are in the same folder as this script.")
    exit()

symptom_df = pd.read_csv(symptom_csv).fillna("")
precaution_df = pd.read_csv(precaution_csv).fillna("")

# ------------------------- Synonym Dictionary -------------------------
SYMPTOM_SYNONYMS = {
    "throwing up": "vomiting",
    "pain in head": "headache",
    "rash on skin": "skin rash",
    "high temperature": "fever",
    "feeling tired": "fatigue",
    "tiredness": "fatigue",
    "lightheadedness": "dizziness",
    "dry cough": "cough",
    "sneezing continuously": "continuous_sneezing"
}

# ------------------------- Utility Functions -------------------------

def normalize_symptom(symptom, known_symptoms):
    # Lowercase & trim
    sym = symptom.lower().strip()
    # Check synonyms
    sym = SYMPTOM_SYNONYMS.get(sym, sym)

    # Fuzzy match to known symptoms
    best_match = sym
    best_score = 0
    for known in known_symptoms:
        score = fuzz.ratio(sym, known)
        if score > best_score and score > 85:
            best_match = known
            best_score = score
    return best_match

def get_all_known_symptoms(df):
    symptoms = set()
    for col in df.columns[1:]:
        symptoms.update(df[col].str.lower().str.strip())
    symptoms.discard("")
    return list(symptoms)

def classify_symptoms(user_symptoms, symptom_df):
    known_symptoms = get_all_known_symptoms(symptom_df)
    normalized_input = [normalize_symptom(sym, known_symptoms) for sym in user_symptoms]
    input_set = set(normalized_input)

    disease_scores = {}

    for idx, row in symptom_df.iterrows():
        disease = row["Disease"]
        row_symptoms = set()

        for col in symptom_df.columns[1:]:
            symptom = str(row[col]).strip().lower()
            if symptom and symptom != "nan":
                row_symptoms.add(symptom)

        match_count = len(input_set & row_symptoms)
        total_symptoms = len(row_symptoms)
        if total_symptoms == 0:
            continue

        confidence = (match_count / total_symptoms) * 100
        if confidence > 0:
            if disease in disease_scores:
                disease_scores[disease] = max(disease_scores[disease], confidence)
            else:
                disease_scores[disease] = confidence

    # Sort by confidence
    sorted_diseases = sorted(disease_scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_diseases[:3]  # Return top 3


def get_precautions(disease, precaution_df):
    row = precaution_df[precaution_df["Disease"].str.lower().str.strip() == disease.lower().strip()]
    if not row.empty:
        return row.iloc[0, 1:].tolist()
    return []

# ------------------------- Interactive Loop -------------------------
print("🩺 Symptom Checker")
print("Type symptoms separated by commas (e.g., fever, cough). Type 'exit' to quit.\n")

while True:
    user_input = input("🔍 Symptoms: ").strip()
    if user_input.lower() == "exit":
        print(" Session ended. Stay healthy!")
        break

    user_symptoms = [sym.strip() for sym in user_input.split(",") if sym.strip()]
    predictions = classify_symptoms(user_symptoms, symptom_df)

    if predictions:
        print("\n🧠 Possible Diagnoses:")
        for disease, confidence in predictions:
            print(f"   {disease} — {confidence:.1f}% confidence")

        # Show precautions for top result
        top_disease = predictions[0][0]
        precautions = get_precautions(top_disease, precaution_df)
        if precautions:
            print("📋 Recommended precautions:")
            for p in precautions:
                if p.strip():
                    print(f"  - {p}")
        else:
            print("⚠️ No precautions found in database.\n")
    else:
        print(" Sorry, no matching disease found. Try more specific symptoms.\n")