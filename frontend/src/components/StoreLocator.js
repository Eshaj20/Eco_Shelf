import { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

function StoreLocator() {
  const [stores, setStores] = useState([]);
  const [coords, setCoords] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);

  // Google Maps container style
  const containerStyle = {
    width: "100%",
    height: "500px",
  };

  // Default center (if geolocation fails)
  const defaultCenter = {
    lat: 20.5937, // India center
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
        // fallback if location access denied
        setCoords(defaultCenter);
      }
    );
  }, []);

  // Fetch nearest stores
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
      <h2>EcoShelf Store Locator</h2>
      {coords ? (
        <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{ lat: coords.lat, lng: coords.lon }}
            zoom={12}
          >
            {/* User location marker */}
            <Marker
              position={{ lat: coords.lat, lng: coords.lon }}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              }}
            />

            {/* Store markers */}
            {stores.map((store) => (
              <Marker
                key={store.store_id}
                position={{ lat: store.latitude, lng: store.longitude }}
                onClick={() => setSelectedStore(store)}
              />
            ))}

            {/* Info window on marker click */}
            {selectedStore && (
              <InfoWindow
                position={{
                  lat: selectedStore.latitude,
                  lng: selectedStore.longitude,
                }}
                onCloseClick={() => setSelectedStore(null)}
              >
                <div>
                  <h3>{selectedStore.store_name}</h3>
                  <p>{selectedStore.address}</p>
                  <p>📍 {selectedStore.distance_km.toFixed(2)} km away</p>
                  <p>
                    🌱 Carbon Saving: {selectedStore.carbon_saving} kg <br />
                    ♻ Waste Reduction: {selectedStore.waste_reduction} kg
                  </p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      ) : (
        <p>Fetching location...</p>
      )}
    </div>
  );
}

export default StoreLocator;

