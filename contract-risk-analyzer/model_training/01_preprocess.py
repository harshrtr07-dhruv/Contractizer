"""
Day 2: Data Preprocessing Script for CUAD Dataset
Instructions: Run this in Google Colab after uploading your CUAD CSV.
"""
import pandas as pd
from sklearn.model_selection import train_test_split
from datasets import Dataset, DatasetDict
from transformers import AutoTokenizer
import json

MODEL_NAME = "nlpaueb/legal-bert-base-uncased"
MAX_LENGTH = 512

def process_cuad():
    # 1. Load the CUAD CSV (You need to upload 'cuad_extracted_clauses.csv' to Colab)
    # The CUAD dataset originally comes in a SQuAD QA format (JSON).
    # For text classification, you would extract the contract context, the clause category,
    # and whether it is risky (present). 
    
    print("Loading data...")
    try:
        df = pd.read_csv("cuad_extracted_clauses.csv")
        print(f"Loaded {len(df)} clauses.")
    except FileNotFoundError:
        print("WARNING: 'cuad_extracted_clauses.csv' not found. Using a dummy dataset for demonstration.")
        df = pd.DataFrame({
            "clause_text": [
                "This agreement shall be governed by the laws of New York.", 
                "Party A's liability shall not exceed the total fees paid.", 
                "This agreement will automatically renew for successive one-year terms."
            ] * 10,  # Duplicate to have enough rows for splitting
            "clause_category": [
                "Governing Law", 
                "Limitation of Liability", 
                "Auto-Renewal"
            ] * 10,
            "is_risky": [0, 1, 1] * 10
        })
    
    # Map categories to integer IDs
    unique_categories = df['clause_category'].unique().tolist()
    label2id = {cat: i for i, cat in enumerate(unique_categories)}
    df['label'] = df['clause_category'].map(label2id)
    
    print(f"Found {len(unique_categories)} unique clause categories.")
    
    # 2. Balance dataset (Undersampling majority classes)
    MAX_SAMPLES_PER_CLASS = 300
    df = df.groupby('label').head(MAX_SAMPLES_PER_CLASS).reset_index(drop=True)
    print(f"Balanced dataset size: {len(df)} clauses.")

    # 3. Split into train/val/test (80/10/10)
    train_df, temp_df = train_test_split(df, test_size=0.2, stratify=df['label'], random_state=42)
    val_df, test_df = train_test_split(temp_df, test_size=0.5, stratify=temp_df['label'], random_state=42)
    
    hf_dataset = DatasetDict({
        "train": Dataset.from_pandas(train_df),
        "validation": Dataset.from_pandas(val_df),
        "test": Dataset.from_pandas(test_df)
    })
    
    # 4. Tokenize using legal-bert-base-uncased
    print(f"Tokenizing using {MODEL_NAME}...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    
    def tokenize_function(examples):
        return tokenizer(examples["clause_text"], padding="max_length", truncation=True, max_length=MAX_LENGTH)
        
    tokenized_datasets = hf_dataset.map(tokenize_function, batched=True)
    
    # Remove string columns to format for PyTorch
    cols_to_remove = ["clause_text", "clause_category", "is_risky"]
    if "__index_level_0__" in tokenized_datasets["train"].column_names:
        cols_to_remove.append("__index_level_0__")
        
    tokenized_datasets = tokenized_datasets.remove_columns(cols_to_remove)
    # tokenized_datasets.set_format("torch") # Commented out to avoid torchvision Colab bug
    
    # 5. Save processed splits and mappings
    tokenized_datasets.save_to_disk("cuad_processed")
    
    with open("label_mapping.json", "w") as f:
        json.dump({"label2id": label2id, "id2label": {v: k for k, v in label2id.items()}}, f)
        
    print("Preprocessing complete. Dataset saved to 'cuad_processed'.")
    print("Label mapping saved to 'label_mapping.json'.")

if __name__ == "__main__":
    process_cuad()
