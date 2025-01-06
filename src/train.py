import os
import json
import pandas as pd
from datasets import Dataset
from transformers import (
    Trainer,
    TrainingArguments,
    AutoTokenizer,
    AutoModelForSequenceClassification,
    set_seed
)
from sklearn.metrics import accuracy_score, f1_score

set_seed(42)

CHOICE_LETTERS = ["A", "B", "C", "D"]

# Convert MedMCQA .jsonl to HF-compatible format
def load_medmcqa_jsonl(path):
    data = []
    with open(path, 'r') as f:
        for line in f:
            item = json.loads(line)
            question = item["question"]
            choices = item["choices"]
            answer = item["answer"]

            if isinstance(answer, str) and answer in CHOICE_LETTERS:
                label = CHOICE_LETTERS.index(answer)
            elif isinstance(answer, int) and 0 <= answer < len(choices):
                label = answer
            else:
                continue 

            # Join question with choices to form full input
            input_text = question + "\n" + "\n".join([f"{c}" for c in choices])
            data.append({"input_text": input_text, "label": label})
    return Dataset.from_pandas(pd.DataFrame(data))

def compute_metrics(pred):
    labels = pred.label_ids
    preds = pred.predictions.argmax(-1)
    return {
        "accuracy": accuracy_score(labels, preds),
        "f1": f1_score(labels, preds, average="weighted")
    }

def main():
    model_name = "models/pubmedbert"  # Local path to downloaded PubMedBERT
    data_dir = "data/medmcqa"
    output_dir = "models/mp_finetuned"

    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=4, ignore_mismatched_sizes=True)


    print("Loading datasets...")
    train_dataset = load_medmcqa_jsonl(os.path.join(data_dir, "train.jsonl"))
    val_dataset = load_medmcqa_jsonl(os.path.join(data_dir, "validation.jsonl"))
    test_dataset = load_medmcqa_jsonl(os.path.join(data_dir, "test.jsonl"))

    def tokenize_function(example):
        return tokenizer(example["input_text"], truncation=True, padding="max_length", max_length=512)

    train_dataset = train_dataset.map(tokenize_function)
    val_dataset = val_dataset.map(tokenize_function)
    test_dataset = test_dataset.map(tokenize_function)

    training_args = TrainingArguments(
        output_dir=output_dir,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        learning_rate=5e-6,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        num_train_epochs=3,
        weight_decay=0.01,
        logging_dir=os.path.join(output_dir, "logs"),
        logging_steps=50,
        save_total_limit=2,
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        report_to="none",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        tokenizer=tokenizer,
        compute_metrics=compute_metrics,
    )

    print("Training...")
    trainer.train()

    print("Saving model...")
    trainer.save_model(output_dir)

    print("Evaluating on test set...")
    results = trainer.evaluate(test_dataset)
    print("Test Results:", results)

if __name__ == "__main__":
    main()
