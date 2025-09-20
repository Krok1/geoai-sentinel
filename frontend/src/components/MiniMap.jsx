import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function MiniMap({ center, anomalies, onClickAnomaly }) {
  return (
    <div className="mini-map">
      <MapContainer center={center} zoom={6} style={{height:"100%", width:"100%"}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        {anomalies.map((a)=> (
          <Marker key={a.id} position={[a.lat, a.lon]} eventHandlers={{click: ()=> onClickAnomaly(a)}}>
            <Popup>{a.type}: {a.summary}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
