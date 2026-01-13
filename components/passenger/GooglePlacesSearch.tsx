import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from '../../lib/icons';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface GooglePlacesSearchProps {
  onSelectPlace: (place: {
    description: string;
    lat: number;
    lng: number;
  }) => void;
  placeholder?: string;
  value?: string;
  className?: string;
}

interface Prediction {
  description: string;
  place_id: string;
}

export function GooglePlacesSearch({ 
  onSelectPlace, 
  placeholder = "Rechercher une adresse...",
  value = "",
  className = ""
}: GooglePlacesSearchProps) {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Fonction pour obtenir les suggestions d'adresses
  const fetchPredictions = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Utilisation de l'API Google Places Autocomplete
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchQuery)}&components=country:cd&language=fr&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY || 'YOUR_API_KEY'}`
      );
      
      const data = await response.json();
      
      if (data.predictions) {
        setPredictions(data.predictions);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      // Fallback : suggestions locales pour Kinshasa
      const localSuggestions: Prediction[] = [
        { description: `${searchQuery} - Gombe, Kinshasa`, place_id: 'local_1' },
        { description: `${searchQuery} - Ngaliema, Kinshasa`, place_id: 'local_2' },
        { description: `${searchQuery} - Limete, Kinshasa`, place_id: 'local_3' },
        { description: `${searchQuery} - Bandalungwa, Kinshasa`, place_id: 'local_4' },
        { description: `${searchQuery} - Kalamu, Kinshasa`, place_id: 'local_5' },
      ];
      setPredictions(localSuggestions);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour obtenir les coordonnées d'un lieu
  const getPlaceDetails = async (placeId: string, description: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY || 'YOUR_API_KEY'}`
      );
      
      const data = await response.json();
      
      if (data.result?.geometry?.location) {
        return {
          description,
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
    }

    // Fallback : coordonnées par défaut pour Kinshasa
    return {
      description,
      lat: -4.3276 + (Math.random() - 0.5) * 0.1,
      lng: 15.3136 + (Math.random() - 0.5) * 0.1
    };
  };

  // Effet pour la recherche avec debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchPredictions(query);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const handleSelectPrediction = async (prediction: Prediction) => {
    setQuery(prediction.description);
    setShowSuggestions(false);
    setPredictions([]);

    const placeDetails = await getPlaceDetails(prediction.place_id, prediction.description);
    onSelectPlace(placeDetails);
  };

  const handleClear = () => {
    setQuery('');
    setPredictions([]);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12 text-base"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
        )}
        {!isLoading && query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Liste des suggestions */}
      {showSuggestions && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
          {predictions.map((prediction, index) => (
            <button
              key={prediction.place_id}
              onClick={() => handleSelectPrediction(prediction)}
              className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b last:border-b-0"
            >
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900">{prediction.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Message si aucun résultat */}
      {showSuggestions && !isLoading && query.length >= 3 && predictions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <p className="text-sm text-gray-500 text-center">
            Aucune adresse trouvée pour "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
