/**
 * 🎯 RECHERCHE YANGO-STYLE - AVEC MOTEUR INTELLIGENT
 * 
 * Exactement comme Yango : recherche riche avec lieux, marchés, hôtels, etc.
 */

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { smartSearch, type SearchResult } from '../../lib/smart-search';
import { PLACE_TYPE_ICONS } from '../../lib/kinshasa-places';

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
  const [searchSource, setSearchSource] = useState<'mapbox' | 'nominatim' | 'smart_search' | 'local' | null>(null);
  const [showSourceInfo, setShowSourceInfo] = useState(false);
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

  // Recherche en temps réel avec système CASCADE multi-niveaux (comme Uber/Yango)
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
        let foundResults = false;
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🥇 NIVEAU 1: MAPBOX (Priorité maximale - API professionnelle)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        try {
          console.log('🥇 Tentative Mapbox...');
          const mapboxUrl = new URL(`https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/geocoding/mapbox/search`);
          mapboxUrl.searchParams.set('query', query);
          
          if (currentLocation) {
            mapboxUrl.searchParams.set('lat', currentLocation.lat.toString());
            mapboxUrl.searchParams.set('lng', currentLocation.lng.toString());
          }
          
          const mapboxResponse = await fetch(mapboxUrl.toString(), {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          });
          
          if (mapboxResponse.ok) {
            const data = await mapboxResponse.json();
            if (data.results && data.results.length > 0) {
              console.log(`✅ Mapbox: ${data.results.length} résultats`);
              setResults(data.results);
              setSearchSource('mapbox');
              foundResults = true;
            }
          }
        } catch (error) {
          console.warn('⚠️ Mapbox non disponible:', error);
        }
        
        // Si Mapbox a trouvé, on arrête là
        if (foundResults) {
          setIsLoading(false);
          return;
        }
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🥈 NIVEAU 2: NOMINATIM/OpenStreetMap (Base de données MONDIALE)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        try {
          console.log('🥈 Tentative Nominatim (OpenStreetMap)...');
          const nominatimUrl = new URL(`https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/geocoding/nominatim/search`);
          nominatimUrl.searchParams.set('query', query);
          
          if (currentLocation) {
            nominatimUrl.searchParams.set('lat', currentLocation.lat.toString());
            nominatimUrl.searchParams.set('lng', currentLocation.lng.toString());
          }
          
          const nominatimResponse = await fetch(nominatimUrl.toString(), {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          });
          
          if (nominatimResponse.ok) {
            const data = await nominatimResponse.json();
            if (data.results && data.results.length > 0) {
              console.log(`✅ Nominatim: ${data.results.length} résultats`);
              setResults(data.results);
              setSearchSource('nominatim');
              foundResults = true;
            }
          }
        } catch (error) {
          console.warn('⚠️ Nominatim non disponible:', error);
        }
        
        // Si Nominatim a trouvé, on arrête là
        if (foundResults) {
          setIsLoading(false);
          return;
        }
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🥉 NIVEAU 3: RECHERCHE LOCALE (40+ lieux de Kinshasa)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        console.log('🥉 Tentative recherche locale...');
        const localResults = await smartSearch(query, currentLocation);
        
        if (localResults.length > 0) {
          console.log(`✅ Recherche locale: ${localResults.length} résultats`);
          setResults(localResults);
          setSearchSource('local');
          foundResults = true;
        }
        
        // Si recherche locale a trouvé, on arrête là
        if (foundResults) {
          setIsLoading(false);
          return;
        }
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🏅 NIVEAU 4: RÉSULTATS GÉNÉRIQUES (TOUJOURS quelque chose)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        console.log('🏅 Génération de résultats génériques...');
        
        // Créer des suggestions basées sur la requête
        const genericResults: SearchResult[] = [];
        
        // Suggestion 1: Adresse exacte saisie
        genericResults.push({
          id: `generic-exact-${Date.now()}`,
          name: query,
          description: '📍 Adresse personnalisée • Kinshasa, RDC',
          coordinates: currentLocation || { lat: -4.3276, lng: 15.3136 },
          type: 'place',
          placeType: 'address'
        });
        
        // Suggestion 2: Variations communes
        const variations = [
          `Avenue ${query}`,
          `Rue ${query}`,
          `Quartier ${query}`,
          `${query}, Kinshasa`
        ];
        
        variations.forEach((variation, idx) => {
          if (!variation.toLowerCase().includes(query.toLowerCase())) return;
          
          genericResults.push({
            id: `generic-variation-${idx}-${Date.now()}`,
            name: variation,
            description: '📍 Suggestion • Kinshasa, RDC',
            coordinates: currentLocation || { lat: -4.3276, lng: 15.3136 },
            type: 'place',
            placeType: 'address'
          });
        });
        
        console.log(`✅ Résultats génériques: ${genericResults.length} suggestions`);
        setResults(genericResults.slice(0, 5));
        setSearchSource('local');
        
      } catch (error) {
        console.error('❌ Erreur recherche:', error);
        
        // DERNIER FALLBACK: Au moins 1 résultat avec la saisie exacte
        setResults([{
          id: `fallback-${Date.now()}`,
          name: query,
          description: '📍 Utiliser cette adresse • Kinshasa, RDC',
          coordinates: currentLocation || { lat: -4.3276, lng: 15.3136 },
          type: 'place',
          placeType: 'address'
        }]);
        setSearchSource('local');
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
          {results.map((result) => {
            // Déterminer l'icône selon le type de lieu
            const getIconElement = () => {
              if (result.type === 'recent') {
                return <Clock className="w-5 h-5 text-gray-600" />;
              }
              
              // Icônes spécifiques selon placeType
              switch (result.placeType) {
                case 'terminal':
                  return <span className="text-xl">🚌</span>;
                case 'market':
                  return <span className="text-xl">🛒</span>;
                case 'mall':
                  return <span className="text-xl">🏬</span>;
                case 'hotel':
                  return <span className="text-xl">🏨</span>;
                case 'restaurant':
                  return <span className="text-xl">🍽️</span>;
                case 'hospital':
                  return <span className="text-xl">🏥</span>;
                case 'church':
                  return <span className="text-xl">⛪</span>;
                case 'school':
                  return <span className="text-xl">🎓</span>;
                case 'bank':
                  return <span className="text-xl">🏦</span>;
                case 'station':
                  return <span className="text-xl">🚉</span>;
                case 'office':
                  return <span className="text-xl">🏢</span>;
                case 'park':
                  return <span className="text-xl">🌳</span>;
                default:
                  return <MapPin className="w-5 h-5 text-blue-600" />;
              }
            };
            
            const bgColor = result.type === 'recent' ? 'bg-gray-100' : 
                           result.placeType ? 'bg-blue-50' : 'bg-blue-100';
            
            return (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className="w-full px-4 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3"
              >
                {/* Icône */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${bgColor}`}>
                  {getIconElement()}
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
                
                {/* Distance si disponible */}
                {result.distance !== undefined && (
                  <div className="flex-shrink-0 text-sm text-gray-500">
                    {result.distance.toFixed(1)} km
                  </div>
                )}
              </button>
            );
          })}

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
