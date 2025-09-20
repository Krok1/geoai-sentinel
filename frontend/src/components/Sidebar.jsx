import React from "react";

export default function Sidebar({ dates, onDateChange, opacity, setOpacity, analyze }) {
  return (
    <div className="sidebar">
      <h2>GeoAI Sentinel</h2>
      <div className="controls">
        <label style={{display:"block", marginBottom:6}}>Дата знімка</label>
        <select onChange={e => onDateChange(e.target.value)} style={{width:"100%", padding:8}}>
          {dates.length===0 ? <option>Loading...</option> : dates.map(d=> <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="controls">
        <label style={{display:"block", marginBottom:6}}>Прозорість NDVI: {Math.round(opacity*100)}%</label>
        <input type="range" min="0" max="1" step="0.01" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))}/>
      </div>

      <div style={{marginTop:20}}>
        <button onClick={analyze}>🔍 Аналіз аномалій</button>
      </div>

      <div style={{marginTop:20}} className="legend">
        <strong>Легенда NDVI</strong>
        <div style={{marginTop:8}}>Темні — низька вегетація; світлі — висока</div>
      </div>
    </div>
  );
}
