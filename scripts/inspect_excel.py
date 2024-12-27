from pandas import read_excel
import sys
import os

def inspect_excel(file_path):
    try:
        print(f"Inspecting Excel file: {file_path}")
        print(f"File exists: {os.path.exists(file_path)}")
        print(f"File size: {os.path.stat(file_path).st_size} bytes")

        # Read Excel file using pandas read_excel function
        df = read_excel(file_path, engine='openpyxl')
        print("\nDataFrame Info:")
        print(df.info(show_counts=True))

        print("\nFirst few rows:")
        print(df.head())

        print("\nColumn names:")
        print(df.columns.tolist())

    except Exception as e:
        print(f"Error reading Excel file: {str(e)}")

if __name__ == "__main__":
    file_path = "public/line_chart_test.xlsx"
    inspect_excel(file_path)
