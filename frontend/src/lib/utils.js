import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Utility functions for data processing
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getCloudCover = (item) => {
  return item.properties['eo:cloud_cover']?.toFixed(1) || 'N/A';
};

export const calculateNDVIChange = (current, previous) => {
  if (!current || !previous) return null;
  const change = ((current - previous) / previous) * 100;
  return change.toFixed(1);
};

export const detectAnomalies = (data, threshold = 20) => {
  return data.filter(item => Math.abs(item.change) > threshold);
};

export const classifyAnomaly = (change, type = 'ndvi') => {
  if (type === 'ndvi') {
    if (change < -30) return { type: 'fire', icon: '🔥', severity: 'critical' };
    if (change < -20) return { type: 'deforestation', icon: '🪓', severity: 'high' };
    if (change < -10) return { type: 'drought', icon: '🌵', severity: 'medium' };
    if (change > 20) return { type: 'growth', icon: '🌱', severity: 'positive' };
  }
  return { type: 'unknown', icon: '❓', severity: 'low' };
};