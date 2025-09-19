"use client";

import { useEffect, useState } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

// ✅ Default location (India center)
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

export default function StoreLocator() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, // ✅ make sure this is set
  });

  const [coords, setCoords] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);

  // ✅ Detect user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude, // ✅ fixed
        });
      },
      () => {
        setCoords(defaultCenter);
      }
    );
  }, []);

  // ✅ Fetch nearest stores when coords available
  useEffect(() => {
    if (coords) {
      fetch(
        `http://localhost:8000/api/nearest-stores?lat=${coords.lat}&lon=${coords.lng}&max_results=5`
      )
        .then((res) => res.json())
        .then((data) => setStores(data))
        .catch((err) => console.error("Error fetching stores:", err));
    }
  }, [coords]);

  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Find EcoShelf Stores Near You</h2>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={5}
        center={coords || defaultCenter}
      >
        {/* ✅ User Location Marker */}
        {coords && (
          <Marker
            position={coords}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        )}

        {/* ✅ Store Markers */}
        {stores.map((store, idx) => (
          <Marker
            key={idx}
            position={{ lat: store.lat, lng: store.lon }}
            onClick={() => setSelectedStore(store)}
          />
        ))}

        {/* ✅ InfoWindow when a store is clicked */}
        {selectedStore && (
          <InfoWindow
            position={{ lat: selectedStore.lat, lng: selectedStore.lon }}
            onCloseClick={() => setSelectedStore(null)}
          >
            <div>
              <h3 className="font-semibold">{selectedStore.name}</h3>
              <p>Distance: {selectedStore.distance_km.toFixed(2)} km</p>
              <p>
                🌱 Carbon Savings:{" "}
                {Math.floor(Math.random() * 50) + 10} kg CO₂
              </p>
              <p>
                ♻️ Waste Reduction:{" "}
                {Math.floor(Math.random() * 20) + 5} items
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

