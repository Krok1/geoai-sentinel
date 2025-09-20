import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import Sidebar from "./components/Sidebar";
import MiniMap from "./components/MiniMap";
import axios from "axios";
import 'leaflet/dist/leaflet.css';

const buildTitilerTileUrl = (stacItemId, expression) => {
  const endpoint = "https://planetarycomputer.microsoft.com/api/data/v1";
  // Planetary pattern for item -> we construct STAC item url
  const stacUrl = `https://planetarycomputer.microsoft.com/api/stac/v1/collections/sentinel-2-l2a-cogs/items/${encodeURIComponent(stacItemId)}`;
  const expr = encodeURIComponent(expression);
  const url = encodeURIComponent(stacUrl);
  return `${endpoint}/stac/WebMercatorQuad/tile/{z}/{x}/{y}.png?url=${url}&expression=${expr}&asset_as_band=true&colormap_name=viridis&rescale=-1,1`;
};

export default function App(){
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [opacity, setOpacity] = useState(0.75);
  const [tileUrl, setTileUrl] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [itemsMap, setItemsMap] = useState({});

  const center = [50.45, 30.523]; // Kyiv

  useEffect(()=>{
    // fetch available STAC items for bbox around center
    const fetchDates = async ()=>{
      const lonMin = 30.0, latMin = 49.0, lonMax = 31.5, latMax = 51.0;
      try {
        const res = await axios.get('http://localhost:8000/api/stac/search', { params: { lon_min: lonMin, lat_min: latMin, lon_max: lonMax, lat_max: latMax, limit: 12 }});
        const items = res.data.items || [];
        const sorted = items.sort((a,b)=> b.datetime.localeCompare(a.datetime));
        setDates(sorted.map(it => it.datetime));
        // store map datetime -> id
        const mp = {};
        sorted.forEach(it => mp[it.datetime] = it.id);
        setItemsMap(mp);
        if(sorted.length) setSelectedDate(sorted[0].datetime);
      } catch(e){
        console.error("stac search error", e);
      }
    };
    fetchDates();
  }, []);

  useEffect(()=>{
    if(!selectedDate) return;
    const id = itemsMap[selectedDate];
    if(!id) return;
    const url = buildTitilerTileUrl(id, '(B08-B04)/(B08+B04)');
    setTileUrl(url);
  }, [selectedDate, itemsMap]);

  const analyze = async ()=>{
    // simple: fetch events from backend; in future we can trigger analysis worker
    try {
      const res = await axios.get('http://localhost:8000/api/events');
      setAnomalies(res.data.events || []);
      window.alert(`Found ${res.data.events.length} events`);
    } catch(e){
      console.error(e);
    }
  };

  const onClickAnomaly = (a) => {
    // simple behavior: show alert, in prod - recenter main map via ref
    window.alert(`Anomaly: ${a.type}\n${a.summary}`);
  };

  return (
    <div className="app">
      <div className="map-container">
        <MapContainer center={center} zoom={6} style={{height:"100%", width:"100%"}}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
          {tileUrl && <TileLayer url={tileUrl} opacity={opacity} attribution="NDVI — PlanetaryComputer/TiTiler" />}
        </MapContainer>

        <MiniMap center={center} anomalies={anomalies} onClickAnomaly={onClickAnomaly} />
      </div>

      <Sidebar dates={dates} onDateChange={(d)=> setSelectedDate(d)} opacity={opacity} setOpacity={setOpacity} analyze={analyze}/>
    </div>
  );
}
