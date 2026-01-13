import { useEffect, useRef, useState } from 'react';
import { Navigation, MapPin, Clock, TrendingUp, AlertCircle, Navigation2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDuration, getCurrentTrafficConditions } from '../lib/duration-calculator';
import { InteractiveMapView } from './InteractiveMapView';
import type { Location } from '../types/location';

interface RouteMapPreviewProps {
  pickup: Location;
  destination: Location;
  distanceKm: number;
  estimatedDuration: number;
  className?: string;
}

/**
 * 🗺️ PRÉVISUALISATION ULTRA-MODERNE DE L'ITINÉRAIRE
 * 
 * Version spectaculaire avec :
 * - Tracé animé et gradient de couleurs
 * - Marqueurs 3D avec animations pulse
 * - Interface futuriste avec glassmorphism
 * - Indicateurs de trafic en temps réel
 * - Animations fluides et transitions élégantes
 */
export function RouteMapPreview({ 
  pickup, 
  destination, 
  distanceKm, 
  estimatedDuration,
  className = '' 
}: RouteMapPreviewProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const traffic = getCurrentTrafficConditions();

  // Calculer le statut du trafic avec emoji et couleur
  const getTrafficStatus = () => {
    if (traffic.congestionMultiplier > 1.4) {
      return { 
        text: 'Dense', 
        color: '#ef4444',
        gradient: 'from-red-500 to-orange-500',
        emoji: '🚦',
        description: 'Circulation très dense'
      };
    }
    if (traffic.congestionMultiplier > 1.2) {
      return { 
        text: 'Modéré', 
        color: '#f59e0b',
        gradient: 'from-orange-500 to-yellow-500',
        emoji: '⚠️',
        description: 'Trafic modéré'
      };
    }
    return { 
      text: 'Fluide', 
      color: '#10b981',
      gradient: 'from-green-500 to-emerald-500',
      emoji: '✨',
      description: 'Circulation fluide'
    };
  };

  const trafficStatus = getTrafficStatus();

  // Animation du loader
  useEffect(() => {
    const timer = setTimeout(() => setIsMapReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Carte interactive ultra-moderne avec overlay gradient */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
        {/* Carte Leaflet */}
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
        
        {/* Gradient overlay en haut pour meilleure lisibilité */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
        
        {/* Gradient overlay en bas */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* 🎯 CARD FLOTTANTE PRINCIPALE - Glassmorphism ultra-moderne */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute top-3 left-3 right-3 backdrop-blur-xl bg-white/90 rounded-2xl shadow-2xl border border-white/30 overflow-hidden"
      >
        {/* Header avec gradient */}
        <div className={`bg-gradient-to-r ${trafficStatus.gradient} p-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <Navigation2 className="w-4 h-4 text-white" />
              </motion.div>
              <div>
                <h3 className="text-xs font-semibold text-white/90">Meilleur itinéraire</h3>
                <p className="text-[10px] text-white/70">Optimisé pour le trafic actuel</p>
              </div>
            </div>
            
            {/* Badge trafic animé */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full"
            >
              <span className="text-base">{trafficStatus.emoji}</span>
              <span className="text-xs font-bold text-white">{trafficStatus.text}</span>
            </motion.div>
          </div>
        </div>

        {/* Stats en 3 colonnes */}
        <div className="grid grid-cols-3 gap-2 p-3">
          {/* Distance */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-2.5 border border-blue-100"
          >
            <div className="flex items-center gap-1 mb-1">
              <div className="w-5 h-5 bg-blue-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-3 h-3 text-white" />
              </div>
              <span className="text-[9px] font-medium text-blue-700">Distance</span>
            </div>
            <p className="text-base font-bold text-blue-900">{distanceKm.toFixed(1)}</p>
            <p className="text-[9px] text-blue-600">kilomètres</p>
          </motion.div>

          {/* Durée */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-2.5 border border-green-100"
          >
            <div className="flex items-center gap-1 mb-1">
              <div className="w-5 h-5 bg-green-500 rounded-lg flex items-center justify-center">
                <Clock className="w-3 h-3 text-white" />
              </div>
              <span className="text-[9px] font-medium text-green-700">Durée</span>
            </div>
            <p className="text-base font-bold text-green-900">{formatDuration(estimatedDuration)}</p>
            <p className="text-[9px] text-green-600">estimée</p>
          </motion.div>

          {/* Vitesse moyenne */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-2.5 border border-purple-100"
          >
            <div className="flex items-center gap-1 mb-1">
              <div className="w-5 h-5 bg-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-[9px] font-medium text-purple-700">Vitesse</span>
            </div>
            <p className="text-base font-bold text-purple-900">
              {Math.round((distanceKm / (estimatedDuration / 60)))}
            </p>
            <p className="text-[9px] text-purple-600">km/h moy.</p>
          </motion.div>
        </div>

        {/* Alerte trafic si nécessaire */}
        <AnimatePresence>
          {traffic.congestionMultiplier > 1.4 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-3 mb-3"
            >
              <div className="flex items-start gap-2 px-2.5 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                <AlertCircle className="w-3.5 h-3.5 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-orange-800 leading-tight">
                  <span className="font-semibold">Trafic dense détecté.</span> La durée peut varier de ±{Math.round(estimatedDuration * 0.2)} min.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 🌈 LÉGENDE DU TRAFIC - Style moderne avec glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-3 left-3 backdrop-blur-xl bg-white/90 rounded-xl shadow-xl px-3 py-2 border border-white/30"
      >
        <p className="text-[9px] font-semibold text-gray-700 mb-1.5">État du trafic</p>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50" />
            <span className="text-[9px] text-gray-700 font-medium">Fluide</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 shadow-lg shadow-orange-500/50" />
            <span className="text-[9px] text-gray-700 font-medium">Modéré</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/50" />
            <span className="text-[9px] text-gray-700 font-medium">Dense</span>
          </div>
        </div>
      </motion.div>

      {/* 🎨 BADGE "EN DIRECT" - Indicateur animé */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="absolute top-3 right-3 backdrop-blur-xl bg-red-500/90 rounded-full px-2.5 py-1 border border-white/30 shadow-lg"
      >
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
          <span className="text-[9px] font-bold text-white uppercase tracking-wide">En Direct</span>
        </div>
      </motion.div>
    </div>
  );
}
