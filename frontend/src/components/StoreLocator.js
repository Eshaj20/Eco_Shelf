import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function StoreLocator() {
  const [stores, setStores] = useState([]);
  const [coords, setCoords] = useState(null);

  // Fix missing marker icons in Leaflet
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });

  // Default center (India)
  const defaultCenter = {
    lat: 20.5937,
    lon: 78.9629,
  };

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setCoords(defaultCenter);
      }
    );
  }, []);

  // Fetch nearest stores from backend
  useEffect(() => {
    if (coords) {
      fetch(
        `http://localhost:8000/api/nearest-stores?lat=${coords.lat}&lon=${coords.lon}&max_results=5`
      )
        .then((res) => res.json())
        .then((data) => setStores(data));
    }
  }, [coords]);

  return (
    <div>
      <h2>EcoShelf Store Locator (OpenStreetMap)</h2>
      {coords ? (
        <MapContainer
          center={[coords.lat, coords.lon]}
          zoom={12}
          className="leaflet-container"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* User location marker */}
          <Marker position={[coords.lat, coords.lon]}>
            <Popup>📍 You are here</Popup>
          </Marker>

          {/* Store markers */}
          {stores.map((store) => (
            <Marker
              key={store.store_id}
              position={[store.latitude, store.longitude]}
            >
              <Popup>
                <h3>{store.store_name}</h3>
                <p>{store.address}</p>
                <p>📍 {store.distance_km.toFixed(2)} km away</p>
                <p>
                  🌱 Carbon Saving: {store.carbon_saving} kg <br />
                  ♻ Waste Reduction: {store.waste_reduction} kg
                </p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <p>Fetching location...</p>
      )}
    </div>
  );
}

export default StoreLocator;

