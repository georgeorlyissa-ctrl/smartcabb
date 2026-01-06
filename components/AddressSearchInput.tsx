import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, MapPin, X } from '../lib/icons';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { searchQuartiers, findNearbyQuartiers, QUARTIERS_KINSHASA, type Quartier } from '../lib/kinshasa-map-data';

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
    
    setTimeout(() => {
      const queryLower = query.toLowerCase().trim();
      
      // 🇨🇩 RECHERCHE CONTEXTUELLE : Quartiers de Kinshasa
      const matchedQuartiers = searchQuartiers(queryLower);
      
      // 🎯 FILTRAGE PAR PROXIMITÉ : Si position actuelle disponible
      let finalQuartiers: Quartier[] = matchedQuartiers;
      
      if (currentLocation && matchedQuartiers.length > 0) {
        // Trouver les quartiers proches (rayon de 10km)
        const nearbyQuartiers = findNearbyQuartiers(
          currentLocation.lat, 
          currentLocation.lng, 
          10 // rayon en km
        );
        
        // Filtrer les résultats pour ne garder que ceux proches
        // SI l'utilisateur cherche dans une commune proche
        const nearbyNames = new Set(nearbyQuartiers.map(q => q.nom.toLowerCase()));
        const nearbyCommunes = new Set(nearbyQuartiers.map(q => q.commune.toLowerCase()));
        
        finalQuartiers = matchedQuartiers.filter(q => {
          const isNearbyQuartier = nearbyNames.has(q.nom.toLowerCase());
          const isNearbyCommune = nearbyCommunes.has(q.commune.toLowerCase());
          
          // Garder si le quartier OU sa commune est proche
          return isNearbyQuartier || isNearbyCommune || q.populaire; // Toujours garder les lieux populaires
        });
        
        // Si aucun résultat proche, utiliser tous les matchs (éviter liste vide)
        if (finalQuartiers.length === 0) {
          finalQuartiers = matchedQuartiers;
        }
        
        console.log(`🔍 Recherche "${query}":`, {
          totalMatches: matchedQuartiers.length,
          nearby: nearbyQuartiers.length,
          filtered: finalQuartiers.length
        });
      }
      
      // Convertir en format Address
      const suggestions: Address[] = finalQuartiers.slice(0, 15).map((quartier, index) => ({
        id: `quartier-${index}`,
        name: quartier.nom,
        description: `${quartier.commune}, Kinshasa, RDC`,
        coordinates: { lat: quartier.lat, lng: quartier.lng }
      }));
      
      // Si aucune suggestion trouvée, créer une suggestion personnalisée
      if (suggestions.length === 0 && queryLower.length >= 2) {
        const baseLatKinshasa = -4.3276;
        const baseLngKinshasa = 15.3136;
        const randomOffset = () => (Math.random() - 0.5) * 0.05;
        
        suggestions.push({
          id: 'custom',
          name: query.trim(),
          description: 'Adresse personnalisée, Kinshasa, RDC',
          coordinates: { 
            lat: baseLatKinshasa + randomOffset(), 
            lng: baseLngKinshasa + randomOffset() 
          }
        });
      }
      
      setSuggestions(suggestions);
      setIsOpen(suggestions.length > 0);
      setIsLoading(false);
      isUserTypingRef.current = false;
    }, 200);
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
        <div className="p-4 text-center text-gray-600">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm">Aucune adresse trouvée</p>
          <p className="text-xs">Essayez avec un autre terme de recherche</p>
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