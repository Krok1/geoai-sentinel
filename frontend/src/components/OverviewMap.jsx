import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

const OverviewMap = ({ anomalies, onAnomalyClick, center }) => {
  const canvasRef = useRef(null);
  const [hoveredAnomaly, setHoveredAnomaly] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw base map (simplified)
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw center point
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Draw anomalies
    anomalies.forEach((anomaly, index) => {
      const x = (anomaly.lon - center[1] + 0.5) * width + width / 2;
      const y = (center[0] - anomaly.lat + 0.5) * height + height / 2;

      // Ensure points are within canvas
      if (x < 0 || x > width || y < 0 || y > height) return;

      const severity = anomaly.severity;
      let color = '#10b981'; // default green
      
      if (severity === 'critical') color = '#ef4444';
      else if (severity === 'high') color = '#f97316';
      else if (severity === 'medium') color = '#eab308';
      else if (severity === 'positive') color = '#10b981';

      // Draw anomaly point
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Draw pulse effect for critical anomalies
      if (severity === 'critical') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
  }, [anomalies, center]);

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked anomaly
    const clickedAnomaly = anomalies.find(anomaly => {
      const anomalyX = (anomaly.lon - center[1] + 0.5) * canvas.width + canvas.width / 2;
      const anomalyY = (center[0] - anomaly.lat + 0.5) * canvas.height + canvas.height / 2;
      
      const distance = Math.sqrt((x - anomalyX) ** 2 + (y - anomalyY) ** 2);
      return distance < 8;
    });

    if (clickedAnomaly && onAnomalyClick) {
      onAnomalyClick(clickedAnomaly);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl w-64">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Огляд аномалій
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Mini Map */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={200}
              height={150}
              className="border border-gray-200 rounded cursor-pointer hover:border-blue-300 transition-colors"
              onClick={handleCanvasClick}
            />
            <div className="absolute bottom-1 right-1 text-xs text-gray-500 bg-white/80 px-1 rounded">
              Київ
            </div>
          </div>

          {/* Anomaly Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="font-semibold text-red-600">
                {anomalies.filter(a => a.severity === 'critical').length}
              </div>
              <div className="text-red-500">Критичні</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded">
              <div className="font-semibold text-orange-600">
                {anomalies.filter(a => a.severity === 'high').length}
              </div>
              <div className="text-orange-500">Високі</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-semibold text-green-600">
                {anomalies.filter(a => a.severity === 'positive').length}
              </div>
              <div className="text-green-500">Позитивні</div>
            </div>
          </div>

          {/* Recent Anomalies List */}
          <div className="space-y-1 max-h-32 overflow-y-auto">
            <div className="text-xs font-medium text-gray-700 mb-1">Останні аномалії:</div>
            {anomalies.slice(0, 3).map((anomaly, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-1 rounded hover:bg-gray-50 cursor-pointer text-xs"
                onClick={() => onAnomalyClick && onAnomalyClick(anomaly)}
              >
                <span className="text-sm">{anomaly.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{anomaly.type}</div>
                  <div className="text-gray-500">
                    {anomaly.change > 0 ? '+' : ''}{anomaly.change}%
                  </div>
                </div>
                {anomaly.change > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewMap;