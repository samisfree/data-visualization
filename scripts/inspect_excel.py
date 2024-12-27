import pandas as pd
import sys
import os

def inspect_excel(file_path):
    try:
        print(f"Inspecting Excel file: {file_path}")
        print(f"File exists: {os.path.exists(file_path)}")
        print(f"File size: {os.path.stat(file_path).st_size} bytes")

        # Read Excel file using pandas read_excel function
        df = pd.read_excel(file_path, engine='openpyxl')

        print("\nDataFrame Info:")
        print(df.info(show_counts=True))

        print("\nFirst few rows:")
        print(df.head())

        print("\nColumn names:")
        print(df.columns.tolist())

        # Check for Chinese characters in column names
        print("\nColumns with Chinese characters:")
        for col in df.columns:
            if any('\u4e00' <= char <= '\u9fff' for char in str(col)):
                print(f"- {col}")

        # Analyze cell types and values
        print("\nColumn types and sample values:")
        for col in df.columns:
            print(f"\nColumn: {col}")
            print(f"Type: {df[col].dtype}")
            print("First 5 values:")
            for idx, val in df[col].head().items():
                print(f"  Row {idx}: {val} (type: {type(val)})")

    except Exception as e:
        print(f"Error reading Excel file: {str(e)}")

if __name__ == "__main__":
    file_path = "/home/ubuntu/attachments/.xlsx"
    inspect_excel(file_path)
