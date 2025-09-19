from fastapi import FastAPI, Request, HTTPException
import pandas as pd
import joblib
import json
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from geopy.distance import geodesic

app = FastAPI()

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Safe model load
try:
    model_path = os.path.join("model", "price_model.pkl")
    model = joblib.load(model_path)
except Exception as e:
    model = None
    print(f"❌ Failed to load model: {e}")

# Load CSV data
def load_data():
    inventory = pd.read_csv(os.path.join("app", "data", "inventory_data.csv"))
    sales = pd.read_csv(os.path.join("app", "data", "sales_data.csv"))

    sales['sale_date'] = pd.to_datetime(sales['sale_date'])
    inventory['mfg_date'] = pd.to_datetime(inventory['mfg_date'])
    inventory['expiry_date'] = pd.to_datetime(inventory['expiry_date'])
    inventory['current_date'] = pd.to_datetime(inventory['current_date'])
    return inventory, sales

# Prediction function
def predict_discounted_prices(inventory: pd.DataFrame, sales: pd.DataFrame):
    result = []

    for row in inventory.itertuples():
        prod_sales = sales[
            (sales['barcode'] == row.barcode) &
            (sales['sale_date'] <= row.current_date)
        ]
        if prod_sales.empty:
            continue

        days_since_mfg = max((row.current_date - row.mfg_date).days, 1)
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

# GET: Predict from default CSV
@app.get("/predict-prices")
def predict_prices():
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    inventory, sales = load_data()
    results = predict_discounted_prices(inventory, sales)

    # Save to JSON
    json_path = os.path.join("app", "updates", "updated_discounts.json")
    with open(json_path, "w") as f:
        json.dump(results, f, indent=2)

    return JSONResponse(content=results)

# POST: Predict from live inventory
@app.post("/predict-live")
async def predict_live(request: Request):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    body = await request.json()
    inventory = pd.DataFrame(body["inventory"])
    sales = pd.DataFrame(body["sales"])

    # Convert dates
    inventory['mfg_date'] = pd.to_datetime(inventory['mfg_date'])
    inventory['expiry_date'] = pd.to_datetime(inventory['expiry_date'])
    inventory['current_date'] = pd.to_datetime(inventory['current_date'])
    sales['sale_date'] = pd.to_datetime(sales['sale_date'])

    results = predict_discounted_prices(inventory, sales)
    return JSONResponse(content=results)

# GET: Get previously updated prices
@app.get("/api/discounted-prices")
def get_discounted_prices():
    json_path = os.path.join("app", "updates", "updated_discounts.json")
    if not os.path.exists(json_path):
        return JSONResponse(content=[])
    with open(json_path, "r") as f:
        data = json.load(f)
    return JSONResponse(content=data)

# --------------------------
# 📍 Store Locator Feature
# --------------------------
def load_stores():
    stores = pd.read_csv(os.path.join("app", "data", "stores_data.csv"))
    return stores

@app.get("/api/nearest-stores")
def get_nearest_stores(lat: float, lon: float, max_results: int = 5):
    stores = load_stores()

    # Compute distance from user
    stores["distance_km"] = stores.apply(
        lambda row: geodesic((lat, lon), (row["latitude"], row["longitude"])).km, axis=1
    )

    # Filter stores with discounted products
    stores = stores[stores["has_discounted_products"] == True]

    # Sort by distance
    nearest = stores.sort_values("distance_km").head(max_results)

    # Return JSON
    results = nearest.to_dict(orient="records")
    return JSONResponse(content=results)

