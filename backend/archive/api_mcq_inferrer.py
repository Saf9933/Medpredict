import sys
import torch
import json
import time
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "../finetuned_model/models/pubmedbert_mcqa_finetuned")

# Graceful model loading — silently degrade if weights are missing
_model_available = False
tokenizer = None
model = None

if os.path.isfile(os.path.join(MODEL_DIR, "config.json")):
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
        model.eval()
        _model_available = True
    except Exception as e:
        print(json.dumps({"error": f"Model load failed: {str(e)}"}))
        sys.exit(1)

label_map = {0: "A", 1: "B", 2: "C", 3: "D"}

def predict(question, choices, include_attention=False):
    if not _model_available:
        return None, None, None, None, None, None

    input_text = f"{question}\nA. {choices[0]}\nB. {choices[1]}\nC. {choices[2]}\nD. {choices[3]}"
    inputs = tokenizer(input_text, return_tensors="pt", padding=True, truncation=True, max_length=256)

    attention_data = None

    with torch.no_grad():
        if include_attention:
            outputs = model(**inputs, output_attentions=True)
            logits = outputs.logits
            attentions = outputs.attentions  # tuple of (batch, heads, seq, seq)

            # Extract last layer attention, average across all heads
            last_layer = attentions[-1]  # (1, num_heads, seq_len, seq_len)
            num_heads = last_layer.shape[1]
            avg_attention = last_layer.mean(dim=1)  # (1, seq_len, seq_len)

            # CLS token attention to all other tokens
            cls_attention = avg_attention[0, 0, :].numpy()  # (seq_len,)

            # Get tokens
            token_ids = inputs["input_ids"][0].tolist()
            tokens = tokenizer.convert_ids_to_tokens(token_ids)

            # Min-max normalize to [0, 1]
            raw_weights = cls_attention.tolist()
            min_w = min(raw_weights)
            max_w = max(raw_weights)
            range_w = max_w - min_w if max_w > min_w else 1.0
            normalized = [(w - min_w) / range_w for w in raw_weights]

            attention_data = {
                "tokens": tokens,
                "weights": normalized,
                "raw_weights": raw_weights,
                "layer": len(attentions) - 1,
                "num_heads": int(num_heads)
            }
        else:
            logits = model(**inputs).logits

    probs = torch.softmax(logits, dim=-1)[0]

    pred_idx = torch.argmax(probs).item()
    pred_label = label_map[pred_idx]
    pred_choice = choices[pred_idx]
    confidence = probs[pred_idx].item()
    breakdown = {label_map[i]: round(probs[i].item(), 4) for i in range(4)}
    difficulty = "Easy" if confidence > 0.9 else "Medium" if confidence > 0.6 else "Hard"

    return pred_label, pred_choice, confidence, breakdown, difficulty, attention_data

if __name__ == "__main__":
    payload = json.loads(sys.argv[1])
    question = payload["question"]
    choices = payload["choices"]
    user_answer = payload.get("user_answer", None)
    start_time = payload.get("start_time", None)
    include_attention = payload.get("include_attention", False)

    if not _model_available:
        print(json.dumps({"error": "Model weights not found. Classifier unavailable."}))
        sys.exit(1)

    start = time.time()
    pred_label, pred_text, confidence, breakdown, difficulty, attention_data = predict(
        question, choices, include_attention=include_attention
    )
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

    if attention_data is not None:
        response["attention"] = attention_data

    print(json.dumps(response))
