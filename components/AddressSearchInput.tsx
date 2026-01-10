import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, MapPin, X } from '../lib/icons';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { searchQuartiers, findNearbyQuartiers, QUARTIERS_KINSHASA, type Quartier } from '../lib/kinshasa-map-data';
import { searchLocationsByCommune, getLocationTypeLabel, type Location } from '../lib/kinshasa-locations-database';
import { searchAddress, type GeocodedAddress } from '../lib/geocoding-service'; // 🆕 GÉOCODAGE RÉEL

interface Address {
  id: string;
  name: string;
  description: string;
  coordinates: { lat: number; lng: number };
}

interface AddressSearchInputProps {
  placeholder?: string;
  onAddressSelect: (address: Address) => void;
  value?: string;
  onChange?: (value: string) => void;
  currentLocation?: { lat: number; lng: number; address: string }; // 🆕 Position actuelle pour filtrage contextuel
}

export function AddressSearchInput({ 
  placeholder = "Rechercher une adresse...", 
  onAddressSelect,
  value = "",
  onChange,
  currentLocation
}: AddressSearchInputProps) {
  // ✅ SOLUTION FINALE : State local avec synchronisation ONE-WAY (parent → enfant uniquement)
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Address[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // ✅ Synchroniser SEULEMENT quand le parent change explicitement la valeur
  // (par exemple après un clear ou une réinitialisation)
  const isUserTypingRef = useRef(false);
  
  useEffect(() => {
    // Ne synchroniser que si l'utilisateur ne tape PAS actuellement
    if (!isUserTypingRef.current && value !== inputValue) {
      console.log('🔄 Synchronisation parent → enfant:', value);
      setInputValue(value);
    }
  }, [value]);

  // Calculer la position du dropdown
  const updateDropdownPosition = () => {
    if (searchRef.current) {
      const rect = searchRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleSearch = (query: string) => {
    // ✅ ÉTAPE 1: Mettre à jour le state local IMMÉDIATEMENT
    setInputValue(query);
    isUserTypingRef.current = true;
    
    // ✅ ÉTAPE 2: Notifier le parent
    onChange?.(query);
    
    if (query.length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      isUserTypingRef.current = false;
      return;
    }

    setIsLoading(true);
    updateDropdownPosition();
    
    // 🌍 SYSTÈME HYBRIDE : Base locale + Nominatim (comme Yango)
    setTimeout(async () => {
      const queryLower = query.toLowerCase().trim();
      
      // 1️⃣ RECHERCHE LOCALE RAPIDE (base de données 544+ lieux)
      const localResults = searchLocationsByCommune(queryLower);
      
      console.log(`🔍 Recherche locale \"${query}\":`, {
        totalResults: localResults.length,
        locations: localResults.slice(0, 3).map(l => `${l.nom} (${l.commune})`)
      });
      
      // Convertir résultats locaux en format Address
      const localSuggestions: Address[] = localResults.slice(0, 5).map((location, index) => ({
        id: `local-${index}`,
        name: location.nom,
        description: `${getLocationTypeLabel(location.type)} • ${location.quartier || location.commune}, Kinshasa`,
        coordinates: { lat: location.lat, lng: location.lng }
      }));

      // 2️⃣ RECHERCHE NOMINATIM (comme Yango) - EN PARALLÈLE
      let nominatimSuggestions: Address[] = [];
      try {
        const geocodedResults = await searchAddress(query);
        nominatimSuggestions = geocodedResults.map((result, index) => ({
          id: result.id,
          name: result.name,
          description: result.description,
          coordinates: result.coordinates
        }));
        
        console.log(`🌍 Nominatim \"${query}\":`, {
          totalResults: nominatimSuggestions.length,
          locations: nominatimSuggestions.slice(0, 3).map(l => l.name)
        });
      } catch (error) {
        console.warn('⚠️ Nominatim non disponible, utilisation base locale uniquement');
      }

      // 3️⃣ FUSIONNER LES RÉSULTATS (Nominatim en priorité)
      const allSuggestions: Address[] = [];
      
      // D'abord les résultats Nominatim (plus précis)
      allSuggestions.push(...nominatimSuggestions);
      
      // Puis les résultats locaux qui ne sont pas déjà présents
      for (const local of localSuggestions) {
        const alreadyExists = allSuggestions.some(nom => 
          Math.abs(nom.coordinates.lat - local.coordinates.lat) < 0.001 &&
          Math.abs(nom.coordinates.lng - local.coordinates.lng) < 0.001
        );
        
        if (!alreadyExists) {
          allSuggestions.push(local);
        }
      }
      
      // Limiter à 10 résultats max
      const finalSuggestions = allSuggestions.slice(0, 10);
      
      console.log(`✅ Résultats finaux: ${finalSuggestions.length} (${nominatimSuggestions.length} Nominatim + ${localSuggestions.length} locaux)`);
      
      setSuggestions(finalSuggestions);
      setIsOpen(finalSuggestions.length > 0);
      setIsLoading(false);
      isUserTypingRef.current = false;
    }, 300); // Petit délai pour éviter trop de requêtes
  };

  const handleAddressSelect = (address: Address) => {
    console.log('==========================================');
    console.log('🔍 handleAddressSelect APPELÉ');
    console.log('📍 Adresse sélectionnée:', address.name);
    console.log('📊 inputValue AVANT:', inputValue);
    console.log('📊 isOpen AVANT:', isOpen);
    console.log('==========================================');
    
    // ✅ ÉTAPE 1: Mettre à jour inputValue IMMÉDIATEMENT
    setInputValue(address.name);
    console.log('✅ setInputValue appelé avec:', address.name);
    
    // ✅ ÉTAPE 2: Notifier le parent
    if (onChange) {
      onChange(address.name);
      console.log('✅ onChange(parent) appelé avec:', address.name);
    }
    
    // ✅ ÉTAPE 3: Appeler onAddressSelect
    onAddressSelect(address);
    console.log('✅ onAddressSelect appelé');
    
    // ✅ ÉTAPE 4: Fermer le dropdown SANS setTimeout
    setIsOpen(false);
    setSuggestions([]);
    console.log('✅ Dropdown fermé');
    
    console.log('==========================================');
    console.log('🎉 handleAddressSelect TERMINÉ');
    console.log('==========================================');
  };

  const clearSearch = () => {
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    onChange?.('');
  };

  // Rendu du dropdown
  const dropdownContent = (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 99999,
        pointerEvents: 'auto'
      }}
      className="bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto"
    >
      {isLoading ? (
        <div className="p-4 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Recherche...</p>
        </div>
      ) : (
        suggestions.map((address) => (
          <button
            key={address.id}
            onMouseDown={(e) => {
              e.preventDefault(); // ✅ CRUCIAL : Empêcher le blur de l'input
              handleAddressSelect(address);
            }}
            className="w-full px-4 py-4 text-left hover:bg-green-50 active:bg-green-100 transition-colors border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-green-50"
          >
            <div className="flex items-start space-x-3">
              <MapPin className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900 leading-snug">{address.name}</p>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">{address.description}</p>
              </div>
            </div>
          </button>
        ))
      )}
      
      {!isLoading && suggestions.length === 0 && value.length >= 2 && (
        <div className="p-6 text-center text-gray-600">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-base font-semibold text-gray-900 mb-1">Lieu introuvable</p>
          <p className="text-sm text-gray-600 mb-2">Ce lieu n'existe pas dans notre base de données</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p className="text-xs text-blue-800 font-medium mb-1">💡 Suggestions :</p>
            <p className="text-xs text-blue-700">• Vérifiez l'orthographe</p>
            <p className="text-xs text-blue-700">• Utilisez le nom d'un quartier ou lieu connu</p>
            <p className="text-xs text-blue-700">• Essayez un point de repère proche</p>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <>
      <div ref={searchRef} className="relative w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="pl-11 pr-10 h-12 bg-white border-gray-200 rounded-xl shadow-sm"
            onFocus={() => {
              updateDropdownPosition();
              if (suggestions.length > 0) {
                setIsOpen(true);
              }
            }}
          />
          {inputValue && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Portail pour afficher les suggestions au-dessus de tout */}
      {typeof document !== 'undefined' && isOpen && (suggestions.length > 0 || isLoading) && createPortal(
        <AnimatePresence>
          {dropdownContent}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
