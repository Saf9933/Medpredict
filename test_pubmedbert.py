from transformers import AutoModelForSequenceClassification, AutoTokenizer

model_path = "models/pubmedbert"  # adjust if it's in a different location

try:
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    print("✅ Model and tokenizer loaded successfully. Not corrupted.")
except Exception as e:
    print("❌ Failed to load model or tokenizer.")
    print("Error:", e)
