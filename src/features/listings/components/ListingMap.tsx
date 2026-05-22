import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const COORDS: Record<string, [number, number]> = {
  "bali":[-8.4095,115.1889],"aspen":[39.1911,-106.8175],"new york":[40.7128,-74.006],
  "cotswolds":[51.833,-1.8433],"maldives":[3.2028,73.2207],"zermatt":[46.0207,7.7491],
  "berlin":[52.52,13.405],"tuscany":[43.7711,11.2486],"santorini":[36.3932,25.4615],
  "tokyo":[35.6762,139.6503],"provence":[43.9493,5.1315],"costa rica":[9.7489,-83.7534],
  "boston":[42.3601,-71.0589],"napa valley":[38.5025,-122.2654],"paris":[48.8566,2.3522],
  "tulum":[20.2114,-87.4654],"barcelona":[41.3851,2.1734],"inverness":[57.4778,-4.2247],
  "kyoto":[35.0116,135.7681],"marrakech":[31.6295,-7.9811],"phuket":[7.8804,98.3923],
  "reykjavik":[64.1466,-21.9426],"zanzibar":[-6.1659,39.2026],"queenstown":[-45.0312,168.6626],
  "dubai":[25.2048,55.2708],"indonesia":[-8.4095,115.1889],"greece":[36.3932,25.4615],
  "switzerland":[46.0207,7.7491],"italy":[43.7711,11.2486],"france":[43.9493,5.1315],
  "scotland":[57.4778,-4.2247],"mexico":[20.2114,-87.4654],"thailand":[7.8804,98.3923],
  "iceland":[64.1466,-21.9426],"tanzania":[-6.1659,39.2026],"morocco":[31.6295,-7.9811],
  "england":[51.833,-1.8433],"japan":[35.0116,135.7681],"usa":[39.1911,-106.8175],
};

export function getCoords(location: string): [number, number] | null {
  const lower = location.toLowerCase();
  for (const [key, coords] of Object.entries(COORDS)) {
    if (lower.includes(key)) return coords;
  }
  return null;
}

interface NearbyPlace {
  id: string; name: string; type: string; lat: number; lng: number; distance: string;
}

function FlyTo({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(coords, 13, { duration: 1.2 }); }, [coords]);
  return null;
}

const PLACE_TYPES = [
  { label: "Restaurants", key: "restaurant", color: "#e8442a" },
  { label: "Cafes",       key: "cafe",       color: "#f59e0b" },
  { label: "Hospitals",   key: "hospital",   color: "#10b981" },
  { label: "Shopping",    key: "shopping",   color: "#3b82f6" },
  { label: "Parks",       key: "park",       color: "#22c55e" },
  { label: "Transport",   key: "transport",  color: "#8b5cf6" },
];

function randomNearby(center: [number, number], type: string): NearbyPlace[] {
  const names: Record<string, string[]> = {
    restaurant: ["The Local Kitchen","Sunset Bistro","Garden Table","Casa Mia","The Rustic Spoon"],
    cafe:       ["Morning Brew","Cloud Nine Cafe","The Bean Stop","Artisan Roasters","Lazy Cup"],
    hospital:   ["City Medical Center","St. Luke Clinic","Health First","Downtown Hospital","Care Plus"],
    shopping:   ["Central Market","The Mall","Local Bazaar","Fashion Street","Grand Plaza"],
    park:       ["Riverside Park","Central Garden","Green Hills","Botanical Walk","City Commons"],
    transport:  ["Main Bus Stop","Central Station","Metro Hub","Taxi Rank","Airport Shuttle"],
  };
  const list = names[type] ?? names.restaurant;
  return list.map((name, i) => ({
    id: `${type}-${i}`,
    name,
    type,
    lat: center[0] + (Math.random() - 0.5) * 0.04,
    lng: center[1] + (Math.random() - 0.5) * 0.04,
    distance: `${(Math.random() * 1.5 + 0.1).toFixed(1)} km`,
  }));
}

function placeIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    iconAnchor: [6, 6],
  });
}

function mainIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="background:#e8442a;color:#fff;padding:5px 10px;border-radius:20px;font-size:12px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.25);white-space:nowrap">You are here</div>`,
    iconAnchor: [40, 10],
  });
}

interface Props {
  location: string;
  dark: boolean;
}

export default function ListingMap({ location, dark }: Props) {
  const coords = getCoords(location);
  const [activeType, setActiveType] = useState("restaurant");
  const [nearby, setNearby] = useState<NearbyPlace[]>([]);
  const [search, setSearch] = useState("");

  const card   = dark ? "#1e293b" : "#fff";
  const bg     = dark ? "#0f172a" : "#f7f7f5";
  const text   = dark ? "#f1f5f9" : "#111";
  const sub    = dark ? "#94a3b8" : "#666";
  const border = dark ? "#334155" : "#ebebeb";
  const accent = "#e8442a";

  useEffect(() => {
    if (coords) setNearby(randomNearby(coords, activeType));
  }, [activeType, location]);

  if (!coords) return (
    <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", padding: "32px", textAlign: "center" }}>
      <p style={{ color: sub, fontSize: "14px", margin: 0 }}>Map not available for this location</p>
    </div>
  );

  const filtered = nearby.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const activeColor = PLACE_TYPES.find(t => t.key === activeType)?.color ?? accent;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Type filter */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {PLACE_TYPES.map(t => (
          <button key={t.key} onClick={() => setActiveType(t.key)}
            style={{ padding: "6px 14px", borderRadius: "20px", border: "1.5px solid", borderColor: activeType === t.key ? t.color : border, background: activeType === t.key ? t.color : card, color: activeType === t.key ? "#fff" : sub, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "16px", height: "400px" }}>
        {/* Map */}
        <div style={{ borderRadius: "16px", overflow: "hidden", border: `1px solid ${border}` }}>
          <MapContainer center={coords} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors'/>
            <FlyTo coords={coords} />
            <Marker position={coords} icon={mainIcon()}>
              <Popup><strong>{location}</strong></Popup>
            </Marker>
            {filtered.map(p => (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={placeIcon(activeColor)}>
                <Popup>
                  <div style={{ fontFamily: "Outfit, sans-serif" }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "13px" }}>{p.name}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#666" }}>{p.distance} away</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Nearby list */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px", borderBottom: `1px solid ${border}` }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search nearby..." style={{ width: "100%", background: bg, border: `1px solid ${border}`, borderRadius: "8px", padding: "7px 10px", fontSize: "12px", color: text, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}/>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.map(p => (
              <div key={p.id} style={{ padding: "10px 14px", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: activeColor, flexShrink: 0 }}/>
                  <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: text }}>{p.name}</p>
                </div>
                <span style={{ fontSize: "11px", color: sub, flexShrink: 0 }}>{p.distance}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
