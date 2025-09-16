import React, { useState, useEffect, useCallback } from 'react';
import MapboxMap from './components/MapboxMap';
import FilterPanel from './components/FilterPanel';
import OverviewMap from './components/OverviewMap';
import AnalyticsPanel from './components/AnalyticsPanel';
import { classifyAnomaly, detectAnomalies } from './lib/utils';
import './index.css';

const App = () => {
  // Map state
  const [center] = useState([50.4501, 30.5234]); // Kyiv coordinates
  const [activeFilters, setActiveFilters] = useState(['ndvi']);
  const [opacity, setOpacity] = useState(0.7);
  
  // Data state
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Analysis state
  const [anomalies, setAnomalies] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('ndvi');

  // Fetch available Sentinel-2 items
  const fetchAvailableItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const bbox = [30.2, 50.2, 30.8, 50.7]; // Bbox around Kyiv
      const stacUrl = 'https://planetarycomputer.microsoft.com/api/stac/v1/search';
      
      const requestBody = {
        collections: ['sentinel-2-l2a'],
        bbox: bbox,
        datetime: '2023-01-01T00:00:00Z/2024-12-31T23:59:59Z',
        limit: 20,
        sortby: [{ field: 'datetime', direction: 'desc' }],
        query: {
          'eo:cloud_cover': { lt: 20 } // Less than 20% cloud cover
        }
      };
      
      const response = await fetch(stacUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        setAvailableItems(data.features);
        setSelectedItem(data.features[0]); // Auto-select the newest
        
        // Generate mock anomalies based on the data
        generateMockAnomalies(data.features);
      } else {
        setError('No available images found for this region');
      }
    } catch (err) {
      console.error('Error fetching STAC data:', err);
      setError('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate mock anomalies for demonstration
  const generateMockAnomalies = (items) => {
    const mockAnomalies = [
      {
        id: 1,
        lat: 50.4501,
        lon: 30.5234,
        type: 'fire',
        change: -25.3,
        date: '2024-08-15',
        ...classifyAnomaly(-25.3, 'ndvi')
      },
      {
        id: 2,
        lat: 50.3501,
        lon: 30.6234,
        type: 'deforestation',
        change: -18.7,
        date: '2024-09-02',
        ...classifyAnomaly(-18.7, 'ndvi')
      },
      {
        id: 3,
        lat: 50.5501,
        lon: 30.4234,
        type: 'growth',
        change: 15.2,
        date: '2024-07-20',
        ...classifyAnomaly(15.2, 'ndvi')
      },
      {
        id: 4,
        lat: 50.4001,
        lon: 30.7234,
        type: 'drought',
        change: -12.1,
        date: '2024-08-30',
        ...classifyAnomaly(-12.1, 'ndvi')
      }
    ];
    
    setAnomalies(mockAnomalies);
  };

  useEffect(() => {
    fetchAvailableItems();
  }, [fetchAvailableItems]);

  // Handle filter changes
  const handleFilterChange = (filterId, enabled) => {
    if (enabled) {
      setActiveFilters(prev => [...prev, filterId]);
    } else {
      setActiveFilters(prev => prev.filter(id => id !== filterId));
    }
  };

  // Handle anomaly click from overview map
  const handleAnomalyClick = (anomaly) => {
    // In a real app, this would pan the main map to the anomaly location
    console.log('Anomaly clicked:', anomaly);
    // You could also show a detailed popup or sidebar with anomaly information
  };

  // Handle main map click
  const handleMapClick = (lngLat) => {
    console.log('Map clicked at:', lngLat);
    // In a real app, this could trigger point analysis or add custom markers
  };

  return (
    <div className="relative w-full h-screen bg-gray-50">
      {/* Main Map */}
      <MapboxMap
        center={[center[1], center[0]]} // Mapbox uses [lng, lat]
        zoom={10}
        activeFilters={activeFilters}
        opacity={opacity}
        selectedItem={selectedItem}
        onMapClick={handleMapClick}
      />

      {/* Filter Panel */}
      <FilterPanel
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        opacity={opacity}
        onOpacityChange={setOpacity}
        selectedDate={selectedItem}
        availableDates={availableItems}
        onDateChange={setSelectedItem}
        loading={loading}
      />

      {/* Overview Map with Anomalies */}
      <OverviewMap
        anomalies={anomalies}
        onAnomalyClick={handleAnomalyClick}
        center={center}
      />

      {/* Analytics Panel */}
      <AnalyticsPanel
        data={availableItems}
        selectedMetric={selectedMetric}
      />

      {/* Error Display */}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <div>
                <div className="font-semibold">Помилка завантаження</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div className="text-gray-700">Завантаження супутникових даних...</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;