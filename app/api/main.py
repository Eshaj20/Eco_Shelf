from fastapi import FastAPI
import pandas as pd
import joblib

app = FastAPI()
model = joblib.load('model/price_model.pkl')

inventory = pd.read_csv('app/data/inventory_data.csv')
sales = pd.read_csv('app/data/sales_data.csv')

sales['sale_date'] = pd.to_datetime(sales['sale_date'])
inventory['mfg_date'] = pd.to_datetime(inventory['mfg_date'])
inventory['expiry_date'] = pd.to_datetime(inventory['expiry_date'])
inventory['current_date'] = pd.to_datetime(inventory['current_date'])

@app.get('/predict-prices')
def predict_prices():
    result = []
    for row in inventory.itertuples():
        prod_sales = sales[(sales['barcode'] == row.barcode) & (sales['sale_date'] <= row.current_date)]
        if prod_sales.empty:
            continue

        days_since_mfg = (row.current_date - row.mfg_date).days or 1
        days_left = (row.expiry_date - row.current_date).days
        shelf_life = (row.expiry_date - row.mfg_date).days
        avg_sales_rate = prod_sales['units_sold'].tail(3).mean() or 0
        latest_price = prod_sales['price'].iloc[-1]

        if days_left > 2:
            predicted_price = latest_price
        elif avg_sales_rate < 0.6 * (prod_sales['units_sold'].sum() / days_since_mfg):
            input_data = pd.DataFrame([{
                'inventory_left': row.inventory_left,
                'shelf_life': shelf_life,
                'days_left': days_left,
                'avg_sales': avg_sales_rate
            }])
            predicted_price = round(float(model.predict(input_data)[0]), 2)
        else:
            predicted_price = latest_price

        if predicted_price < latest_price:
            result.append({
                'product_id': row.barcode,
                'product_name': row.product_name,
                'predicted_price': predicted_price,
                'expiry': row.expiry_date.strftime('%Y-%m-%d')
            })
    return result
