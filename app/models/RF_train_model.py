import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler
import joblib
import json
import os

# Load data
inventory = pd.read_csv('app/data/inventory_data.csv')
sales = pd.read_csv('app/data/sales_data.csv')

# Date conversion
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

    days_since_mfg = max((row.current_date - row.mfg_date).days, 1)
    days_left = (row.expiry_date - row.current_date).days
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

# Dataframe
df = pd.DataFrame(features)
X = df[['inventory_left', 'shelf_life', 'days_left', 'avg_sales']]
y = df['price']

# Scaling features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Save scaler
os.makedirs("model", exist_ok=True)
joblib.dump(scaler, 'model/scaler.pkl')

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Model training (Random Forest)
model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)
joblib.dump(model, 'model/price_model.pkl')

# Evaluation
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = mean_squared_error(y_test, y_pred, squared=False)
r2 = r2_score(y_test, y_pred)

# Save metrics
os.makedirs("evaluation", exist_ok=True)
with open('evaluation/rf_metrics_report.txt', 'w') as f:
    f.write(f"MAE: {mae:.2f}\nRMSE: {rmse:.2f}\nR^2 Score: {r2:.2f}\n")

# Discount calculation
scaler = joblib.load('model/scaler.pkl')
discounts = []
for i, row in df.iterrows():
    if row['days_left'] <= 2 or row['avg_sales'] < 0.6 * y.mean():
        input_data = scaler.transform([[
            row['inventory_left'], row['shelf_life'], row['days_left'], row['avg_sales']
        ]])
        predicted = round(float(model.predict(input_data)[0]), 2)
        if predicted < row['mrp']:
            discounts.append({
                "product_name": row['product_name'],
                    "product_id": row['barcode'],
                    "original_price": row['mrp'],
                    "mfg_date": str(row['mfg_date'].date()),
                    "expiry_date": str(row['expiry_date'].date()),
                    "days_left": int(row['days_left']),
                    "discounted_price": predicted
            })

# Save discounts
os.makedirs("app/updates", exist_ok=True)
with open("app/updates/rf_discounts.json", "w") as jf:
    json.dump(discounts, jf, indent=2)

print("Model trained (Random Forest), evaluated, and discounts updated.")
