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

def extract_clauses_from_cuad_json(json_path="CUADv1.json"):
    """
    Downloads and parses the official CUADv1.json dataset into a structured DataFrame.
    """
    import os
    import urllib.request
    
    if not os.path.exists(json_path):
        print("Downloading CUADv1.json dataset from Zenodo (~18MB)...")
        url = "https://zenodo.org/record/4595826/files/CUADv1.json?download=1"
        urllib.request.urlretrieve(url, json_path)
        print("Download complete.")
        
    print("Parsing CUADv1.json...")
    with open(json_path, "r", encoding="utf-8") as f:
        cuad_data = json.load(f)
        
    records = []
    for contract in cuad_data.get("data", []):
        for para in contract.get("paragraphs", []):
            for qa in para.get("qas", []):
                question = qa.get("question", "")
                category = question
                if "'" in question:
                    category = question.split("'")[1]
                
                for ans in qa.get("answers", []):
                    ans_text = ans.get("text", "").strip()
                    if len(ans_text) > 25:
                        records.append({
                            "clause_text": ans_text,
                            "clause_category": category,
                            "is_risky": 1
                        })
                        
    df = pd.DataFrame(records)
    print(f"Extracted {len(df)} clause annotations across {df['clause_category'].nunique()} categories.")
    return df

def process_cuad():
    print("Loading data...")
    try:
        df = pd.read_csv("cuad_extracted_clauses.csv")
        print(f"Loaded {len(df)} clauses from CSV.")
    except FileNotFoundError:
        print("'cuad_extracted_clauses.csv' not found. Automatically extracting from CUADv1.json...")
        df = extract_clauses_from_cuad_json()
        if df.empty:
            raise RuntimeError("Failed to extract data from CUAD dataset.")
    
    # Map categories to integer IDs
    unique_categories = df['clause_category'].unique().tolist()
    label2id = {cat: i for i, cat in enumerate(unique_categories)}
    df['label'] = df['clause_category'].map(label2id)
    
    print(f"Found {len(unique_categories)} unique clause categories.")
    
    # 2. Balance dataset (Cap samples per class to prevent heavy imbalance)
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
    for col in cols_to_remove:
        if col in tokenized_datasets["train"].column_names:
            tokenized_datasets = tokenized_datasets.remove_columns(col)
    if "__index_level_0__" in tokenized_datasets["train"].column_names:
        tokenized_datasets = tokenized_datasets.remove_columns("__index_level_0__")
        
    # 5. Save processed splits and mappings
    tokenized_datasets.save_to_disk("cuad_processed")
    
    with open("label_mapping.json", "w") as f:
        json.dump({"label2id": label2id, "id2label": {v: k for k, v in label2id.items()}}, f)
        
    print("Preprocessing complete. Dataset saved to 'cuad_processed'.")
    print("Label mapping saved to 'label_mapping.json'.")

if __name__ == "__main__":
    process_cuad()
