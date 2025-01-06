import sys
import torch
import json
import time
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "../finetuned_model/models/pubmedbert_mcqa_finetuned")

tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
model.eval()

label_map = {0: "A", 1: "B", 2: "C", 3: "D"}

def predict(question, choices):
    input_text = f"{question}\nA. {choices[0]}\nB. {choices[1]}\nC. {choices[2]}\nD. {choices[3]}"
    inputs = tokenizer(input_text, return_tensors="pt", padding=True, truncation=True, max_length=256)
    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=-1)[0]

    pred_idx = torch.argmax(probs).item()
    pred_label = label_map[pred_idx]
    pred_choice = choices[pred_idx]
    confidence = probs[pred_idx].item()
    breakdown = {label_map[i]: round(probs[i].item(), 4) for i in range(4)}
    difficulty = "🟢 Easy" if confidence > 0.9 else "🟡 Medium" if confidence > 0.6 else "🔴 Hard"

    return pred_label, pred_choice, confidence, breakdown, difficulty

if __name__ == "__main__":
    payload = json.loads(sys.argv[1])
    question = payload["question"]
    choices = payload["choices"]
    user_answer = payload.get("user_answer", None)
    start_time = payload.get("start_time", None)

    start = time.time()
    pred_label, pred_text, confidence, breakdown, difficulty = predict(question, choices)
    end = time.time()

    correct = user_answer == pred_label if user_answer else None
    time_taken = round(end - start, 2)

    response = {
        "predicted": pred_label,
        "pred_text": pred_text,
        "confidence": round(confidence, 4),
        "breakdown": breakdown,
        "difficulty": difficulty,
        "correct": correct,
        "time_taken": time_taken
    }

    print(json.dumps(response))
