"""
Day 2: Fine-Tuning Script
Instructions: Run this in Colab AFTER running 01_preprocess.py.
Make sure you have run `notebook_login()` to authenticate with Hugging Face.
"""
import json
import numpy as np
from datasets import load_from_disk
from transformers import (
    AutoModelForSequenceClassification, 
    TrainingArguments, 
    Trainer,
    AutoTokenizer
)
import evaluate
import torch
from torch import nn
from sklearn.utils.class_weight import compute_class_weight

MODEL_NAME = "nlpaueb/legal-bert-base-uncased"

# --- CHANGE THESE ---
HF_USERNAME = "harshrtr07" # e.g., "johndoe"
REPO_NAME = "legal-bert-cuad-risk-analyzer"
# --------------------

def compute_metrics(eval_pred):
    metric = evaluate.load("f1")
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    # Use weighted F1 for imbalanced multi-class classification
    results = metric.compute(predictions=predictions, references=labels, average="weighted")
    return results

def train_model():
    print("Loading processed dataset...")
    dataset = load_from_disk("cuad_processed")
    
    print("Loading label mappings...")
    with open("label_mapping.json", "r") as f:
        mappings = json.load(f)
        label2id = mappings["label2id"]
        # JSON keys are strings, convert back to int for id2label
        id2label = {int(k): v for k, v in mappings["id2label"].items()}
        
    num_labels = len(label2id)
    
    print(f"Loading {MODEL_NAME} for {num_labels} classes...")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME, 
        num_labels=num_labels,
        id2label=id2label,
        label2id=label2id
    )
    
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    
    print("Setting up Training Arguments...")
    training_args = TrainingArguments(
        output_dir="./results",
        eval_strategy="epoch",
        save_strategy="epoch",
        learning_rate=2e-5,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        gradient_accumulation_steps=2,
        num_train_epochs=15,
        weight_decay=0.01,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        push_to_hub=True,
        hub_model_id=f"{HF_USERNAME}/{REPO_NAME}"
    )
    
    # Compute class weights for imbalanced dataset
    labels = dataset["train"]["label"]
    class_weights = compute_class_weight(
        class_weight="balanced", 
        classes=np.unique(labels), 
        y=labels
    )
    class_weights_tensor = torch.tensor(class_weights, dtype=torch.float32)
    
    # Custom Trainer to apply class weights
    class CustomTrainer(Trainer):
        def compute_loss(self, model, inputs, return_outputs=False, **kwargs):
            labels = inputs.pop("labels")
            outputs = model(**inputs)
            logits = outputs.logits
            loss_fct = nn.CrossEntropyLoss(weight=class_weights_tensor.to(model.device))
            loss = loss_fct(logits.view(-1, self.model.config.num_labels), labels.view(-1))
            return (loss, outputs) if return_outputs else loss
            
    trainer = CustomTrainer(
        model=model,
        args=training_args,
        train_dataset=dataset["train"],
        eval_dataset=dataset["validation"],
        processing_class=tokenizer,
        compute_metrics=compute_metrics,
    )
    
    print("Starting training...")
    trainer.train()
    
    print("Evaluating on test set...")
    test_results = trainer.evaluate(dataset["test"])
    print(f"Test Metrics: {test_results}")
    
    print("Pushing to Hugging Face Hub...")
    trainer.push_to_hub()
    print("Done! Model is live on Hugging Face.")

if __name__ == "__main__":
    train_model()
