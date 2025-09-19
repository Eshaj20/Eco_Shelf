// frontend/src/components/StoreLocator.js
import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";

const mapContainerStyle = { width: "100%", height: "500px" };
const defaultCenter = { lat: 19.0760, lng: 72.8777 }; // Mumbai fallback

function StoreLocator() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [stores, setStores] = useState([]);
  const [selected, setSelected] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(defaultCenter);

  useEffect(() => {
    // Fetch store data from backend
    fetch("http://localhost:8000/stores")
      .then((res) => res.json())
      .then((data) => setStores(data.stores));

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      });
    }
  }, []);

  if (!isLoaded) return <p>Loading Maps...</p>;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={10} center={currentLocation}>
      {/* User marker */}
      <Marker position={currentLocation} icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }} />

      {/* Store markers */}
      {stores.map((store) => (
        <Marker
          key={store.id}
          position={{ lat: store.latitude, lng: store.longitude }}
          onClick={() => setSelected(store)}
        />
      ))}

      {/* Info Window */}
      {selected && (
        <InfoWindow
          position={{ lat: selected.latitude, lng: selected.longitude }}
          onCloseClick={() => setSelected(null)}
        >
          <div>
            <h3>{selected.name}</h3>
            <p>🌱 Carbon Savings: {selected.carbon_savings}</p>
            <p>♻ Waste Reduction: {selected.waste_reduction}</p>
            <p>🛒 Products: {selected.discounted_products.join(", ")}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export default StoreLocator;
