import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import json
import os

# Load data
inventory = pd.read_csv('app/data/inventory_data.csv')
sales = pd.read_csv('app/data/sales_data.csv')

# Convert date fields
sales['sale_date'] = pd.to_datetime(sales['sale_date'])
inventory['mfg_date'] = pd.to_datetime(inventory['mfg_date'])
inventory['expiry_date'] = pd.to_datetime(inventory['expiry_date'])
inventory['current_date'] = pd.to_datetime(inventory['current_date'])

# Feature engineering
features = []
for row in inventory.itertuples():
    prod_sales = sales[(sales['barcode'] == row.barcode) & (sales['sale_date'] <= row.current_date)]
    if prod_sales.empty:
        continue

    days_since_mfg = (row.current_date - row.mfg_date).days or 1
    days_left = max((row.expiry_date - row.current_date).days, 0)
    shelf_life = (row.expiry_date - row.mfg_date).days
    avg_sales_rate = prod_sales['units_sold'].tail(3).mean() or 0
    latest_price = prod_sales['price'].iloc[-1]

    features.append({
        'mfg_date': row.mfg_date,
        'current_date': row.current_date,
        'expiry_date': row.expiry_date,
        'inventory_left': row.inventory_left,
        'shelf_life': shelf_life,
        'days_left': days_left,
        'avg_sales': avg_sales_rate,
        'price': latest_price,
        'product_name': row.product_name,
        'barcode': row.barcode,
        'mrp': row.mrp
    })

# Create DataFrame
df = pd.DataFrame(features)
X = df[['inventory_left', 'shelf_life', 'days_left', 'avg_sales']]
y = df['price']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train MLPRegressor
model = MLPRegressor(
    hidden_layer_sizes=(32, 16),
    alpha=0.001,
    max_iter=1000,
    random_state=42,
    early_stopping=False
)
model.fit(X_train, y_train)

# Save model
os.makedirs("model", exist_ok=True)
joblib.dump(model, 'model/price_model.pkl')

# Evaluation
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = mean_squared_error(y_test, y_pred, squared=False)
r2 = r2_score(y_test, y_pred)

# Save evaluation metrics
os.makedirs("evaluation", exist_ok=True)
with open('evaluation/metrics_report.txt', 'w') as f:
    f.write(f"MAE: {mae:.2f}\nRMSE: {rmse:.2f}\nR^2 Score: {r2:.2f}\n")

# Dynamic pricing logic
discounts = []
grouped = df.groupby(['product_name', 'expiry_date'])

for (prod_name, exp), group_df in grouped:
    trigger = any(
        row['days_left'] <= 2 or row['avg_sales'] < 0.6 * y.mean()
        for _, row in group_df.iterrows()
    )
    if trigger:
        row = group_df.iloc[0]
        input_data = row[['inventory_left', 'shelf_life', 'days_left', 'avg_sales']].values.reshape(1, -1)
        predicted_price = round(float(model.predict(input_data)[0]), 2)
        for _, row in group_df.iterrows():
            if predicted_price < row['mrp']:
                discounts.append({
                    "product_name": row['product_name'],
                    "product_id": row['barcode'],
                    "original_price": row['mrp'],
                    "discounted_price": predicted_price,
                    "mfg_date": str(row['mfg_date'].date()),
                    "expiry_date": str(row['expiry_date'].date()),
                    "days_left": int(row['days_left'])
                })

# Save discount results
os.makedirs("app/updates", exist_ok=True)
with open("app/updates/updated_discounts.json", "w") as jf:
    json.dump(discounts, jf, indent=2)

print("Model trained, evaluated, and discounts updated.")
