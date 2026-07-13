import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Listing } from "../types";

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
  "dubai":[25.2048,55.2708],
};

function getCoords(location: string): [number, number] | null {
  const lower = location.toLowerCase();
  for (const [key, coords] of Object.entries(COORDS)) {
    if (lower.includes(key)) return coords;
  }
  return null;
}

function priceIcon(price: number) {
  return L.divIcon({
    className: "",
    html: `<div style="background:#e8442a;color:#fff;padding:4px 8px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25)">$${price}</div>`,
    iconAnchor: [20, 10],
  });
}

export default function ListingsMapView({ listings }: { listings: Listing[] }) {
  const navigate = useNavigate();
  const mapped = listings
    .map(l => ({ listing: l, coords: getCoords(l.location) }))
    .filter(x => x.coords !== null) as { listing: Listing; coords: [number, number] }[];

  return (
    <div style={{ height: "calc(100vh - 220px)", borderRadius: "16px", overflow: "hidden", border: "1px solid #ebebeb" }}>
      <MapContainer center={[20, 10]} zoom={2} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {mapped.map(({ listing, coords }) => (
          <Marker key={listing.id} position={coords} icon={priceIcon(listing.pricePerNight)}>
            <Popup maxWidth={220}>
              <div style={{ fontFamily: "Outfit, sans-serif", cursor: "pointer" }} onClick={() => navigate(`/listings/${listing.id}`)}>
                {(listing as any).photos?.[0]?.url && (
                  <img src={(listing as any).photos[0].url} alt={listing.title} style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "13px", color: "#111" }}>{listing.title}</p>
                <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#666" }}>{listing.location}</p>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#e8442a" }}>${listing.pricePerNight}<span style={{ fontWeight: 400, color: "#666", fontSize: "11px" }}>/night</span></p>
                <button onClick={() => navigate(`/listings/${listing.id}`)} style={{ marginTop: "8px", width: "100%", background: "#e8442a", color: "#fff", border: "none", borderRadius: "6px", padding: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>View listing</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
