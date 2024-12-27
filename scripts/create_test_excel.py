import pandas as pd
import numpy as np

# Create sample data for line chart testing
data = {
    'Date': pd.date_range(start='2024-01-01', periods=10).strftime('%Y-%m-%d').tolist(),
    'Value1': np.random.randint(100, 1000, 10).tolist(),
    'Value2': np.random.randint(500, 1500, 10).tolist(),
    'Category': ['A', 'B', 'A', 'C', 'B', 'A', 'C', 'B', 'A', 'C']
}

# Create DataFrame
df = pd.DataFrame(data)

# Save to Excel
output_file = 'public/line_chart_test.xlsx'
df.to_excel(output_file, index=False, engine='openpyxl')

print(f"Created test Excel file: {output_file}")
print("\nData Preview:")
print(df.head())
print("\nColumn Types:")
print(df.dtypes)
