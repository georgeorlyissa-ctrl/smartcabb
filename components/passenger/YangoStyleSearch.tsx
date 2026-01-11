/**
 * 🎯 RECHERCHE YANGO-STYLE - AVEC GOOGLE PLACES API
 * 
 * Exactement comme les vraies apps : Google Places Autocomplete + historique local
 */

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, Star, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface SearchResult {
  id: string;
  name: string;
  description: string;
  coordinates?: { lat: number; lng: number };
  placeId?: string; // Pour Google Places
  type: 'recent' | 'favorite' | 'place';
}

interface YangoStyleSearchProps {
  placeholder?: string;
  onSelect: (result: SearchResult) => void;
  currentLocation?: { lat: number; lng: number };
}

export function YangoStyleSearch({ 
  placeholder = "Où allez-vous ?", 
  onSelect,
  currentLocation 
}: YangoStyleSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [searchSource, setSearchSource] = useState<'google_places' | 'local' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger l'historique au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('smartcabb_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Erreur chargement historique:', e);
      }
    }
  }, []);

  // Recherche en temps réel avec Google Places
  useEffect(() => {
    if (query.length < 2) {
      // Afficher l'historique si le champ est vide ou < 2 caractères
      setResults(recentSearches.slice(0, 5));
      return;
    }

    setIsLoading(true);
    
    // Délai anti-spam (comme Uber/Yango)
    const timer = setTimeout(async () => {
      console.log('🔍 Recherche:', query);
      
      try {
        // 🎯 STRATÉGIE : Essayer Google Places, fallback vers recherche locale
        let searchResults: SearchResult[] = [];
        let usedSource = 'local';
        
        // Tenter Google Places d'abord
        try {
          const url = new URL(`https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/geocoding/autocomplete`);
          url.searchParams.set('q', query);
          
          if (currentLocation) {
            url.searchParams.set('lat', currentLocation.lat.toString());
            url.searchParams.set('lng', currentLocation.lng.toString());
          }
          
          const response = await fetch(url.toString(), {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
              searchResults = data.results.map((r: any) => ({
                id: r.placeId || r.id,
                name: r.name,
                description: r.description,
                placeId: r.placeId,
                type: 'place' as const
              }));
              usedSource = 'google_places';
              console.log(`✅ ${searchResults.length} résultats Google Places`);
            } else {
              throw new Error('Aucun résultat Google Places');
            }
          } else {
            const errorData = await response.json();
            console.warn('⚠️ Google Places non disponible:', errorData.error);
            throw new Error('Google Places unavailable');
          }
        } catch (googleError) {
          // Fallback silencieux vers recherche locale
          console.log('⏭️ Fallback vers recherche locale');
          searchResults = await searchLocalDatabase(query, currentLocation);
          usedSource = 'local';
        }
        
        console.log(`✅ ${searchResults.length} résultats (source: ${usedSource})`);
        setResults(searchResults);
        setSearchSource(usedSource);
        
      } catch (error) {
        console.error('❌ Erreur recherche:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, currentLocation, recentSearches]);

  const handleSelect = async (result: SearchResult) => {
    console.log('✅ Lieu sélectionné:', result.name);
    
    // Si c'est un résultat Google Places, récupérer les coordonnées
    if (result.placeId && !result.coordinates) {
      try {
        console.log('📍 Récupération des coordonnées pour:', result.placeId);
        
        const url = new URL(`https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/geocoding/place-details`);
        url.searchParams.set('place_id', result.placeId);
        
        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          result.coordinates = data.coordinates;
          console.log('✅ Coordonnées récupérées:', data.coordinates);
        } else {
          console.error('❌ Erreur récupération coordonnées');
          // Ne pas bloquer, utiliser un fallback si nécessaire
        }
      } catch (error) {
        console.error('❌ Erreur place details:', error);
      }
    }
    
    // Sauvegarder dans l'historique (sauf si déjà présent)
    if (result.type === 'place') {
      const newRecent = [
        { ...result, type: 'recent' as const },
        ...recentSearches.filter(r => r.id !== result.id)
      ].slice(0, 10); // Garder les 10 dernières
      
      setRecentSearches(newRecent);
      localStorage.setItem('smartcabb_recent_searches', JSON.stringify(newRecent));
    }
    
    // Notifier le parent
    onSelect(result);
    
    // Réinitialiser
    setQuery('');
    setResults([]);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('smartcabb_recent_searches');
    setResults([]);
  };

  return (
    <div className="relative w-full">
      {/* Input de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-11 pr-10 h-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-colors"
          autoComplete="off"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setQuery('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Liste de suggestions */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {/* En-tête si historique */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Recherches récentes</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRecent}
                className="text-xs text-blue-600 hover:text-blue-700 h-auto p-1"
              >
                Effacer
              </Button>
            </div>
          )}

          {/* Résultats */}
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3"
            >
              {/* Icône */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                result.type === 'recent' ? 'bg-gray-100' :
                result.type === 'favorite' ? 'bg-yellow-100' :
                'bg-blue-100'
              }`}>
                {result.type === 'recent' ? (
                  <Clock className="w-5 h-5 text-gray-600" />
                ) : result.type === 'favorite' ? (
                  <Star className="w-5 h-5 text-yellow-600" />
                ) : (
                  <MapPin className="w-5 h-5 text-blue-600" />
                )}
              </div>

              {/* Texte */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">
                  {result.name}
                </p>
                <p className="text-sm text-gray-600 truncate mt-0.5">
                  {result.description}
                </p>
              </div>
            </button>
          ))}

          {/* Loader */}
          {isLoading && (
            <div className="px-4 py-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Recherche...</p>
            </div>
          )}
        </div>
      )}

      {/* Message "Aucun résultat" */}
      {!isLoading && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 text-center z-50">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-900 mb-1">Aucun résultat</p>
          <p className="text-sm text-gray-600">Essayez un autre lieu ou quartier</p>
        </div>
      )}
    </div>
  );
}

/**
 * 🗄️ RECHERCHE DANS LA BASE LOCALE - FALLBACK
 * 
 * Utilisé uniquement si Google Places API échoue
 */
async function searchLocalDatabase(
  query: string,
  currentLocation?: { lat: number; lng: number }
): Promise<SearchResult[]> {
  // Import dynamique de la base de données
  const { QUARTIERS_KINSHASA } = await import('../../lib/kinshasa-map-data');
  
  const queryLower = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const results: SearchResult[] = [];
  
  // Rechercher dans tous les quartiers
  for (const quartier of QUARTIERS_KINSHASA) {
    const nameLower = quartier.nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const communeLower = quartier.commune.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Correspondance exacte ou partielle
    if (nameLower.includes(queryLower) || communeLower.includes(queryLower)) {
      results.push({
        id: `quartier-${quartier.nom}`,
        name: quartier.nom,
        description: `Quartier • ${quartier.commune}, Kinshasa`,
        coordinates: {
          lat: quartier.lat,
          lng: quartier.lng
        },
        type: 'place'
      });
    }
  }
  
  // Trier par pertinence (correspondance exacte en premier)
  results.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aStartsWith = aName.startsWith(queryLower);
    const bStartsWith = bName.startsWith(queryLower);
    
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    
    return aName.localeCompare(bName);
  });
  
  // Calculer les distances si position fournie
  if (currentLocation) {
    for (const result of results) {
      if (result.coordinates) {
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          result.coordinates.lat,
          result.coordinates.lng
        );
        result.description += ` • ${distance.toFixed(1)} km`;
      }
    }
  }
  
  // Limiter à 20 résultats (comme Yango)
  return results.slice(0, 20);
}

/**
 * 📍 CALCUL DE DISTANCE (Haversine)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
