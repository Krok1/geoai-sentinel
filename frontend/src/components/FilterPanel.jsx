import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Satellite, Thermometer, TreePine, Flame, Droplets, Wind } from 'lucide-react';

const FilterPanel = ({ 
  activeFilters, 
  onFilterChange, 
  opacity, 
  onOpacityChange,
  selectedDate,
  availableDates,
  onDateChange,
  loading 
}) => {
  const filters = [
    { 
      id: 'ndvi', 
      label: 'NDVI (Рослинність)', 
      icon: TreePine, 
      color: 'text-green-500',
      description: 'Індекс рослинності'
    },
    { 
      id: 'temperature', 
      label: 'Температура поверхні', 
      icon: Thermometer, 
      color: 'text-red-500',
      description: 'LST з Landsat'
    },
    { 
      id: 'fire', 
      label: 'Пожежі', 
      icon: Flame, 
      color: 'text-orange-500',
      description: 'Активні пожежі MODIS'
    },
    { 
      id: 'water', 
      label: 'Водні ресурси', 
      icon: Droplets, 
      color: 'text-blue-500',
      description: 'NDWI індекс води'
    },
    { 
      id: 'air_quality', 
      label: 'Якість повітря', 
      icon: Wind, 
      color: 'text-purple-500',
      description: 'NO2, SO2 з Sentinel-5P'
    }
  ];

  return (
    <div className="absolute top-4 left-4 z-10 w-80 space-y-4">
      {/* Main Filters Card */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Satellite className="h-5 w-5 text-blue-600" />
            Фільтри даних
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              📅 Дата знімка
            </label>
            <select
              value={selectedDate?.id || ''}
              onChange={(e) => {
                const item = availableDates.find(item => item.id === e.target.value);
                onDateChange(item);
              }}
              disabled={loading}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableDates.map((item, index) => (
                <option key={item.id} value={item.id}>
                  {new Date(item.properties.datetime).toLocaleDateString('uk-UA')}
                  {index === 0 && ' (найновіший)'}
                  {' • ☁️ ' + (item.properties['eo:cloud_cover']?.toFixed(1) || 'N/A') + '%'}
                </option>
              ))}
            </select>
          </div>

          {/* Layer Filters */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              🗂️ Активні шари
            </label>
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <div key={filter.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    checked={activeFilters.includes(filter.id)}
                    onChange={(checked) => onFilterChange(filter.id, checked)}
                  />
                  <Icon className={`h-4 w-4 ${filter.color}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{filter.label}</div>
                    <div className="text-xs text-gray-500">{filter.description}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Opacity Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              🎚️ Прозорість шарів: {Math.round(opacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onFilterChange('ndvi', !activeFilters.includes('ndvi'))}
              className={activeFilters.includes('ndvi') ? 'bg-green-50 border-green-300' : ''}
            >
              🌱 NDVI
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onFilterChange('temperature', !activeFilters.includes('temperature'))}
              className={activeFilters.includes('temperature') ? 'bg-red-50 border-red-300' : ''}
            >
              🌡️ Температура
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onFilterChange('fire', !activeFilters.includes('fire'))}
              className={activeFilters.includes('fire') ? 'bg-orange-50 border-orange-300' : ''}
            >
              🔥 Пожежі
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onFilterChange('water', !activeFilters.includes('water'))}
              className={activeFilters.includes('water') ? 'bg-blue-50 border-blue-300' : ''}
            >
              💧 Вода
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FilterPanel;