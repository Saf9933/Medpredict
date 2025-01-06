import pandas as pd
from fuzzywuzzy import fuzz
import os
import json
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

symptom_csv = os.path.join(BASE_DIR, "DiseaseAndSymptoms.csv")
precaution_csv = os.path.join(BASE_DIR, "Disease precaution.csv")


if not os.path.exists(symptom_csv) or not os.path.exists(precaution_csv):
    print(json.dumps({ "error": "Required CSV files not found." }))
    sys.exit()

symptom_df = pd.read_csv(symptom_csv).fillna("")
precaution_df = pd.read_csv(precaution_csv).fillna("")

# Synonyms dictionary
SYMPTOM_SYNONYMS = SYMPTOM_SYNONYMS = {
    "throwing up": "vomiting",
    "nauseated": "nausea",
    "queasy": "nausea",
    "sick to stomach": "nausea",
    "head pain": "headache",
    "pain in head": "headache",
    "lightheaded": "dizziness",
    "dizzy": "dizziness",
    "tired": "fatigue",
    "tiredness": "fatigue",
    "feeling tired": "fatigue",
    "fatigued": "fatigue",
    "high temperature": "high_fever",
    "feverish": "high_fever",
    "skin bumps": "skin_rash",
    "itchy skin": "itching",
    "itchy": "itching",
    "red skin": "skin_rash",
    "pimples": "pus_filled_pimples",
    "whiteheads": "pus_filled_pimples",
    "blackheads": "pus_filled_pimples",
    "pustules": "pus_filled_pimples",
    "boils": "pus_filled_pimples",
    "acne": "pus_filled_pimples",
    "sore throat": "patches_in_throat",
    "throat pain": "patches_in_throat",
    "belly pain": "abdominal_pain",
    "stomach ache": "abdominal_pain",
    "stomach hurts": "abdominal_pain",
    "coughing": "cough",
    "dry cough": "cough",
    "continuous sneeze": "continuous_sneezing",
    "sneezing a lot": "continuous_sneezing",
    "stuffy nose": "congestion",
    "runny nose": "runny_nose",
    "blocked nose": "congestion",
    "blurry vision": "blurred_and_distorted_vision",
    "distorted vision": "blurred_and_distorted_vision",
    "hard to breathe": "breathlessness",
    "shortness of breath": "breathlessness",
    "fast heartbeat": "fast_heart_rate",
    "rapid heartbeat": "fast_heart_rate",
    "irregular heartbeat": "palpitations",
    "palpitations": "palpitations",
    "back ache": "back_pain",
    "pain in back": "back_pain",
    "joint aches": "joint_pain",
    "pain in joints": "joint_pain",
    "swollen joints": "swelling_joints",
    "eye redness": "redness_of_eyes",
    "red eyes": "redness_of_eyes",
    "blood poop": "bloody_stool",
    "black stool": "bloody_stool",
    "diarrhea": "diarrhoea",
    "loose motion": "diarrhoea",
    "feeling sad": "depression",
    "loss of interest": "depression",
    "anxious": "anxiety",
    "worrying": "anxiety",
    "upset stomach": "indigestion",
    "gas": "passage_of_gases",
    "bloating": "distention_of_abdomen",
    "cold hands": "cold_hands_and_feets",
    "cold feet": "cold_hands_and_feets",
    "urinating often": "polyuria",
    "frequent urination": "polyuria",
    "painful urination": "burning_micturition",
    "urine burns": "burning_micturition",
    "urine smells": "foul_smell_of_urine",
    "dry lips": "drying_and_tingling_lips",
    "tingling lips": "drying_and_tingling_lips",
    "eye watering": "watering_from_eyes",
    "watery eyes": "watering_from_eyes",
    "eye crust": "yellow_crust_ooze",
    "yellow eyes": "yellowing_of_eyes",
    "yellow skin": "yellowish_skin",
    "losing weight": "weight_loss",
    "gaining weight": "weight_gain"
}


def clean_symptom(text):
    return str(text).strip().lower().replace(" ", "_").replace("__", "_")

def normalize_symptom(symptom, known_symptoms):
    sym = clean_symptom(symptom)
    sym = SYMPTOM_SYNONYMS.get(sym, sym)

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
        for value in df[col]:
            cleaned = clean_symptom(value)
            if cleaned:
                symptoms.add(cleaned)
    return list(symptoms)

def classify_symptoms(user_symptoms, symptom_df):
    known_symptoms = get_all_known_symptoms(symptom_df)
    normalized_input = [normalize_symptom(sym, known_symptoms) for sym in user_symptoms]
    input_set = set(normalized_input)

    disease_scores = {}
    for _, row in symptom_df.iterrows():
        disease = str(row["Disease"]).strip()
        row_symptoms = {
            clean_symptom(row[col])
            for col in symptom_df.columns[1:] if str(row[col]).strip()
        }
        match_count = len(input_set & row_symptoms)
        total_symptoms = len(row_symptoms)
        if total_symptoms == 0:
            continue
        confidence = (match_count / total_symptoms) * 100
        if confidence > 0:
            disease_scores[disease] = max(disease_scores.get(disease, 0), confidence)

    sorted_diseases = sorted(disease_scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_diseases[:3]

def get_precautions(disease, precaution_df):
    row = precaution_df[precaution_df["Disease"].str.lower().str.strip() == disease.lower().strip()]
    if not row.empty:
        return row.iloc[0, 1:].dropna().tolist()
    return []

# MAIN ENTRY FOR API CALL
if len(sys.argv) < 2:
    print(json.dumps({ "error": "No symptoms provided" }))
    sys.exit()

user_input = sys.argv[1]
user_symptoms = [sym.strip() for sym in json.loads(user_input) if sym.strip()]
predictions = classify_symptoms(user_symptoms, symptom_df)

if predictions:
    top_disease = predictions[0][0]
    precautions = get_precautions(top_disease, precaution_df)
    result = {
        "predictions": [
            { "disease": disease, "confidence": round(conf, 1) }
            for disease, conf in predictions
        ],
        "precautions": precautions
    }
else:
    result = {
        "predictions": [],
        "precautions": []
    }

print(json.dumps(result))
sys.exit(0)
