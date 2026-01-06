import { useEffect, useRef, useState } from 'react';
import { Navigation, MapPin, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { formatDuration, getCurrentTrafficConditions } from '../lib/duration-calculator';
import { InteractiveMapView } from './InteractiveMapView';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface RouteMapPreviewProps {
  pickup: Location;
  destination: Location;
  distanceKm: number;
  estimatedDuration: number;
  className?: string;
}

/**
 * 🗺️ PRÉVISUALISATION DE L'ITINÉRAIRE AVEC CARTE INTERACTIVE
 * 
 * Affiche une carte Leaflet interactive avec :
 * - L'itinéraire tracé entre départ et arrivée
 * - Les informations de distance, durée et trafic
 * - Contrôles de zoom
 */
export function RouteMapPreview({ 
  pickup, 
  destination, 
  distanceKm, 
  estimatedDuration,
  className = '' 
}: RouteMapPreviewProps) {
  const traffic = getCurrentTrafficConditions();

  // Calculer le trafic textuel
  const getTrafficStatus = () => {
    if (traffic.congestionMultiplier > 1.4) return { text: 'Dense', color: '#ef4444' };
    if (traffic.congestionMultiplier > 1.2) return { text: 'Modéré', color: '#f59e0b' };
    return { text: 'Fluide', color: '#10b981' };
  };

  const trafficStatus = getTrafficStatus();

  return (
    <div className={`relative ${className}`}>
      {/* Carte interactive Leaflet avec itinéraire */}
      <div className="w-full h-80 rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <InteractiveMapView
          center={pickup}
          zoom={13}
          showRoute={true}
          routeStart={pickup}
          routeEnd={destination}
          enableZoomControls={true}
          enableGeolocation={false}
          className="w-full h-full"
        />
      </div>

      {/* Info-bulle flottante avec détails du trajet */}
      <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: trafficStatus.color }}
            />
            <span className="text-sm font-medium text-gray-900">
              Meilleur itinéraire suggéré
            </span>
          </div>
          <Navigation className="w-4 h-4 text-blue-600" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Distance */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-500">Distance</span>
            </div>
            <p className="font-semibold text-gray-900">{distanceKm.toFixed(1)} km</p>
          </div>

          {/* Durée */}
          <div className="text-center border-x border-gray-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-500">Durée</span>
            </div>
            <p className="font-semibold text-gray-900">{formatDuration(estimatedDuration)}</p>
          </div>

          {/* Trafic */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-500">Trafic</span>
            </div>
            <p className="font-semibold text-gray-900 text-xs">
              {trafficStatus.text}
            </p>
          </div>
        </div>

        {/* Alerte trafic si besoin */}
        {traffic.congestionMultiplier > 1.4 && (
          <div className="mt-3 flex items-start gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-orange-800">
              Trafic dense détecté. La durée peut varier de ±{Math.round(estimatedDuration * 0.2)} min selon les conditions.
            </p>
          </div>
        )}
      </div>

      {/* Légende du trafic */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 border border-gray-200">
        <p className="text-xs font-medium text-gray-600 mb-2">État du trafic :</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600">Fluide</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs text-gray-600">Modéré</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-600">Dense</span>
          </div>
        </div>
      </div>
    </div>
  );
}