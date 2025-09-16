import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Note: In production, you would set this via environment variable
// TODO: Replace with your actual Mapbox access token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE';

const MapboxMap = ({ 
  center = [30.5234, 50.4501], 
  zoom = 10, 
  activeFilters = [], 
  opacity = 0.7,
  selectedItem,
  onMapClick 
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: center,
      zoom: zoom,
      antialias: true
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
      }), 'bottom-left');

      // Add click handler
      map.current.on('click', (e) => {
        if (onMapClick) {
          onMapClick(e.lngLat);
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update layers when filters change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Remove existing layers
    const existingLayers = ['ndvi-layer', 'temperature-layer', 'fire-layer', 'water-layer', 'air-quality-layer'];
    existingLayers.forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current.getSource(layerId)) {
        map.current.removeSource(layerId);
      }
    });

    // Add active layers
    activeFilters.forEach(filterId => {
      addDataLayer(filterId);
    });
  }, [activeFilters, mapLoaded, selectedItem, opacity]);

  const addDataLayer = (filterId) => {
    if (!map.current || !selectedItem) return;

    const titilerUrl = 'https://planetarycomputer.microsoft.com/api/data/v1/titiler';
    let expression, colormap, rescale;

    switch (filterId) {
      case 'ndvi':
        expression = '(B08-B04)/(B08+B04)';
        colormap = 'viridis';
        rescale = '-1,1';
        break;
      case 'temperature':
        expression = 'B10'; // Thermal infrared
        colormap = 'plasma';
        rescale = '280,320'; // Kelvin to reasonable range
        break;
      case 'fire':
        expression = '(B12-B11)/(B12+B11)'; // Fire index
        colormap = 'hot';
        rescale = '-1,1';
        break;
      case 'water':
        expression = '(B03-B08)/(B03+B08)'; // NDWI
        colormap = 'blues';
        rescale = '-1,1';
        break;
      case 'air_quality':
        // This would require Sentinel-5P data, using NDVI as placeholder
        expression = '(B08-B04)/(B08+B04)';
        colormap = 'magma';
        rescale = '-1,1';
        break;
      default:
        return;
    }

    // Construct tile URL
    const tileUrl = `${titilerUrl}/item/tiles/{z}/{x}/{y}?` +
      `url=${encodeURIComponent(selectedItem.assets.rendered_preview?.href || selectedItem.links.find(l => l.rel === 'self')?.href)}&` +
      `expression=${encodeURIComponent(expression)}&` +
      `colormap_name=${colormap}&` +
      `rescale=${rescale}`;

    // Add raster source
    map.current.addSource(`${filterId}-layer`, {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: 256,
      attribution: '© Microsoft Planetary Computer, © ESA Sentinel-2'
    });

    // Add raster layer
    map.current.addLayer({
      id: `${filterId}-layer`,
      type: 'raster',
      source: `${filterId}-layer`,
      paint: {
        'raster-opacity': opacity
      }
    });
  };

  // Update opacity when it changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    activeFilters.forEach(filterId => {
      const layerId = `${filterId}-layer`;
      if (map.current.getLayer(layerId)) {
        map.current.setPaintProperty(layerId, 'raster-opacity', opacity);
      }
    });
  }, [opacity, activeFilters, mapLoaded]);

  // Add anomaly markers
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Mock anomaly data
    const anomalies = [
      { id: 1, lon: 30.5234, lat: 50.4501, type: 'fire', severity: 'critical', change: -25.3 },
      { id: 2, lon: 30.6234, lat: 50.3501, type: 'deforestation', severity: 'high', change: -18.7 },
      { id: 3, lon: 30.4234, lat: 50.5501, type: 'growth', severity: 'positive', change: 15.2 },
      { id: 4, lon: 30.7234, lat: 50.4001, type: 'drought', severity: 'medium', change: -12.1 }
    ];

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.anomaly-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add new markers
    anomalies.forEach(anomaly => {
      const el = document.createElement('div');
      el.className = 'anomaly-marker';
      el.style.cssText = `
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        background-color: ${
          anomaly.severity === 'critical' ? '#ef4444' :
          anomaly.severity === 'high' ? '#f97316' :
          anomaly.severity === 'medium' ? '#eab308' :
          '#10b981'
        };
      `;

      // Add popup on click
      const popup = new mapboxgl.Popup({ offset: 15 })
        .setHTML(`
          <div class="p-2">
            <div class="font-semibold text-sm">${getAnomalyIcon(anomaly.type)} ${getAnomalyTitle(anomaly.type)}</div>
            <div class="text-xs text-gray-600 mt-1">
              Зміна: ${anomaly.change > 0 ? '+' : ''}${anomaly.change}%
            </div>
            <div class="text-xs text-gray-500">
              Координати: ${anomaly.lat.toFixed(4)}, ${anomaly.lon.toFixed(4)}
            </div>
          </div>
        `);

      new mapboxgl.Marker(el)
        .setLngLat([anomaly.lon, anomaly.lat])
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [mapLoaded]);

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'fire': return '🔥';
      case 'deforestation': return '🪓';
      case 'drought': return '🌵';
      case 'growth': return '🌱';
      default: return '❓';
    }
  };

  const getAnomalyTitle = (type) => {
    switch (type) {
      case 'fire': return 'Пожежа';
      case 'deforestation': return 'Вирубка';
      case 'drought': return 'Посуха';
      case 'growth': return 'Зростання';
      default: return 'Невідомо';
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Loading indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Завантаження карти...</div>
          </div>
        </div>
      )}

      {/* Attribution */}
      <div className="absolute bottom-0 right-0 bg-white/80 text-xs p-1 rounded-tl">
        © Mapbox © OpenStreetMap
      </div>
    </div>
  );
};

export default MapboxMap;