import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Thermometer } from 'lucide-react';

const AnalyticsPanel = ({ data, selectedMetric = 'ndvi' }) => {
  // Mock data for demonstration
  const ndviData = [
    { date: '2024-01', ndvi: 0.65, temperature: 15.2, change: 2.1 },
    { date: '2024-02', ndvi: 0.68, temperature: 12.8, change: 4.6 },
    { date: '2024-03', ndvi: 0.72, temperature: 18.5, change: 5.9 },
    { date: '2024-04', ndvi: 0.75, temperature: 22.1, change: 4.2 },
    { date: '2024-05', ndvi: 0.78, temperature: 25.6, change: 4.0 },
    { date: '2024-06', ndvi: 0.71, temperature: 28.9, change: -9.0 },
    { date: '2024-07', ndvi: 0.69, temperature: 31.2, change: -2.8 },
    { date: '2024-08', ndvi: 0.66, temperature: 29.8, change: -4.3 },
    { date: '2024-09', ndvi: 0.73, temperature: 24.5, change: 10.6 },
    { date: '2024-10', ndvi: 0.70, temperature: 19.3, change: -4.1 },
    { date: '2024-11', ndvi: 0.67, temperature: 14.7, change: -4.3 },
    { date: '2024-12', ndvi: 0.64, temperature: 8.9, change: -4.5 }
  ];

  const anomalyData = [
    { type: 'Пожежі', count: 3, severity: 'critical' },
    { type: 'Посуха', count: 7, severity: 'high' },
    { type: 'Вирубка', count: 2, severity: 'high' },
    { type: 'Повінь', count: 1, severity: 'medium' },
    { type: 'Зростання', count: 12, severity: 'positive' }
  ];

  const currentNDVI = ndviData[ndviData.length - 1]?.ndvi || 0;
  const previousNDVI = ndviData[ndviData.length - 2]?.ndvi || 0;
  const ndviTrend = ((currentNDVI - previousNDVI) / previousNDVI * 100).toFixed(1);

  const currentTemp = ndviData[ndviData.length - 1]?.temperature || 0;
  const previousTemp = ndviData[ndviData.length - 2]?.temperature || 0;
  const tempTrend = ((currentTemp - previousTemp) / previousTemp * 100).toFixed(1);

  return (
    <div className="absolute bottom-4 left-4 right-4 z-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Key Metrics */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Ключові показники
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* NDVI Metric */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="text-xs text-gray-600">NDVI (поточний)</div>
                <div className="text-lg font-bold text-green-700">{currentNDVI.toFixed(3)}</div>
              </div>
              <div className="flex items-center gap-1">
                {ndviTrend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${ndviTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ndviTrend > 0 ? '+' : ''}{ndviTrend}%
                </span>
              </div>
            </div>

            {/* Temperature Metric */}
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <div className="text-xs text-gray-600">Температура (°C)</div>
                <div className="text-lg font-bold text-orange-700">{currentTemp.toFixed(1)}°</div>
              </div>
              <div className="flex items-center gap-1">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <span className={`text-sm font-medium ${tempTrend > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  {tempTrend > 0 ? '+' : ''}{tempTrend}%
                </span>
              </div>
            </div>

            {/* Anomaly Count */}
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <div className="text-xs text-gray-600">Аномалії (місяць)</div>
                <div className="text-lg font-bold text-red-700">
                  {anomalyData.reduce((sum, item) => sum + item.count, 0)}
                </div>
              </div>
              <div className="text-xs text-red-600">
                {anomalyData.filter(item => item.severity === 'critical').length} критичних
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NDVI Trend Chart */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">📈 Динаміка NDVI</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={ndviData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                />
                <YAxis 
                  domain={['dataMin - 0.05', 'dataMax + 0.05']}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="ndvi" 
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Anomaly Distribution */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">🚨 Розподіл аномалій</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={anomalyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="type" 
                  tick={{ fontSize: 9 }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill={(entry) => {
                    switch(entry.severity) {
                      case 'critical': return '#ef4444';
                      case 'high': return '#f97316';
                      case 'medium': return '#eab308';
                      case 'positive': return '#10b981';
                      default: return '#6b7280';
                    }
                  }}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPanel;