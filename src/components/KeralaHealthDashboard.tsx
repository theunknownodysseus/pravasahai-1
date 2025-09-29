import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./KeralaHealthDashboard.css";

const API_BASE = "https://kerala-migrant-health-data-clustering.onrender.com";
const districts = {
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "properties": { "district": "Thiruvananthapuram" }, "geometry": { "type": "Point", "coordinates": [76.9366, 8.5241] } },
    { "type": "Feature", "properties": { "district": "Kollam" }, "geometry": { "type": "Point", "coordinates": [76.6141, 8.8932] } },
    { "type": "Feature", "properties": { "district": "Pathanamthitta" }, "geometry": { "type": "Point", "coordinates": [76.787, 9.2648] } },
    { "type": "Feature", "properties": { "district": "Alappuzha" }, "geometry": { "type": "Point", "coordinates": [76.3388, 9.4981] } },
    { "type": "Feature", "properties": { "district": "Kottayam" }, "geometry": { "type": "Point", "coordinates": [76.5222, 9.5916] } },
    { "type": "Feature", "properties": { "district": "Idukki" }, "geometry": { "type": "Point", "coordinates": [76.9739, 9.9151] } },
    { "type": "Feature", "properties": { "district": "Ernakulam" }, "geometry": { "type": "Point", "coordinates": [76.2673, 9.9312] } },
    { "type": "Feature", "properties": { "district": "Thrissur" }, "geometry": { "type": "Point", "coordinates": [76.2144, 10.5276] } },
    { "type": "Feature", "properties": { "district": "Palakkad" }, "geometry": { "type": "Point", "coordinates": [76.6548, 10.7867] } },
    { "type": "Feature", "properties": { "district": "Malappuram" }, "geometry": { "type": "Point", "coordinates": [76.0711, 11.051] } },
    { "type": "Feature", "properties": { "district": "Kozhikode" }, "geometry": { "type": "Point", "coordinates": [75.7804, 11.2588] } },
    { "type": "Feature", "properties": { "district": "Wayanad" }, "geometry": { "type": "Point", "coordinates": [76.132, 11.6854] } },
    { "type": "Feature", "properties": { "district": "Kannur" }, "geometry": { "type": "Point", "coordinates": [75.3704, 11.8745] } },
    { "type": "Feature", "properties": { "district": "Kasaragod" }, "geometry": { "type": "Point", "coordinates": [75.004, 12.4996] } }
  ]
};
// Type definitions
interface DiseaseDetails {
  cases: number;
  mainly_affected: {
    age_group: string;
    gender: string;
  };
  possible_causes: string[];
}

interface DistrictData {
  disease_summary: Record<string, DiseaseDetails>;
  [key: string]: any;
}

// Utility: calculate severity color
function calculateSeverityColor(diseaseSummary: Record<string, DiseaseDetails> = {}) {
  const totalCases = Object.values(diseaseSummary).reduce(
    (sum, disease) => sum + (disease.cases || 0),
    0
  );
  if (totalCases < 2500) return "#2ecc71"; // green
  else if (totalCases < 4500) return "#f39c12"; // orange
  else return "#e74c3c"; // red
}

// Custom Radar Marker
function createRadarIcon(diseaseSummary: Record<string, DiseaseDetails> = {}) {
  const color = calculateSeverityColor(diseaseSummary);
  const html = `
    <div class="radar-marker">
      <div class="radar-dot" style="background:${color};"></div>
      <div class="radar-ring" style="border-color: ${color}66;"></div>
      <div class="radar-ring-2" style="border-color: ${color}44;"></div>
    </div>
  `;
  return L.divIcon({ className: "", html, iconSize: [36, 36], iconAnchor: [18, 18] });
}

// Marker Component with Fetch
function DistrictMarker({
  coords,
  district,
  onClick,
}: {
  coords: [number, number];
  district: string;
  onClick: (district: string) => void;
}) {
  const [diseaseSummary, setDiseaseSummary] = useState<Record<string, DiseaseDetails>>({});

  useEffect(() => {
    fetch(`${API_BASE}/district_info?district=${district}`)
      .then((res) => res.json())
      .then((data: DistrictData) => setDiseaseSummary(data.disease_summary || {}))
      .catch(() => setDiseaseSummary({}));
  }, [district]);

  return (
    <Marker
      position={coords}
      icon={createRadarIcon(diseaseSummary)}
      eventHandlers={{ click: () => onClick(district) }}
    />
  );
}

// Info Panel
function DistrictInfo({
  district,
  onClose,
}: {
  district: string | null;
  onClose: () => void;
}) {
  type State =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "error"; error: string }
    | { status: "success"; data: DistrictData };

  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    if (!district) return;

    setState({ status: "loading" });

    fetch(`${API_BASE}/district_info?district=${district}`)
      .then((res) => res.json())
      .then((info: DistrictData) => setState({ status: "success", data: info }))
      .catch((err) => setState({ status: "error", error: err.toString() }));
  }, [district]);

  if (!district) return null;

  return (
    <div className={`district-info ${district ? "show" : "hidden"}`}>
      <button className="close-btn" onClick={onClose}>
        &times;
      </button>

      {state.status === "loading" && <p>Loading...</p>}
      {state.status === "error" && <p>{district}: {state.error}</p>}
      {state.status === "success" && state.data.disease_summary && (
        <>
          <h4>{district} - Disease Summary</h4>
          {Object.entries(state.data.disease_summary)
            .sort((a, b) => b[1].cases - a[1].cases)
            .map(([disease, details]) => (
              <div key={disease}>
                <b>{disease}</b>: {details.cases} cases <br />
                Mainly affected: {details.mainly_affected.age_group},{" "}
                {details.mainly_affected.gender}
                <br />
                Possible causes: {details.possible_causes.join(", ")}
                <hr />
              </div>
            ))}
        </>
      )}
    </div>
  );
}


// Main Component
export default function KeralaHealthDashboard() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  return (
    <div id="widget-container">
      <h3>Kerala District Health Dashboard</h3>
      <MapContainer
        center={[10.8505, 76.2711]}
        zoom={7}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {districts.features.map((feature) => {
          const coords: [number, number] = [
            feature.geometry.coordinates[1],
            feature.geometry.coordinates[0],
          ];
          return (
            <DistrictMarker
              key={feature.properties.district}
              coords={coords}
              district={feature.properties.district}
              onClick={setSelectedDistrict}
            />
          );
        })}
      </MapContainer>

      <DistrictInfo district={selectedDistrict} onClose={() => setSelectedDistrict(null)} />
    </div>
  );
}
