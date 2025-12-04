import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, MapPin, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

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
}

export function AddressSearchInput({ 
  placeholder = "Rechercher une adresse...", 
  onAddressSelect,
  value = "",
  onChange 
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

  // Addresses populaires de Kinshasa pour suggestions
  const kinshasaAddresses: Address[] = [
    // Communes centrales
    {
      id: '1',
      name: 'Boulevard du 30 Juin',
      description: 'Gombe, Kinshasa, RDC',
      coordinates: { lat: -4.3276, lng: 15.3136 }
    },
    {
      id: '2',
      name: 'Avenue Kasavubu',
      description: 'Kalamu, Kinshasa, RDC',
      coordinates: { lat: -4.3372, lng: 15.3168 }
    },
    {
      id: '3',
      name: 'Marché Central',
      description: 'Kalamu, Kinshasa, RDC',
      coordinates: { lat: -4.3300, lng: 15.3100 }
    },
    {
      id: '4',
      name: 'Avenue de la Libération',
      description: 'Gombe, Kinshasa, RDC',
      coordinates: { lat: -4.3180, lng: 15.3050 }
    },
    {
      id: '5',
      name: 'Avenue Colonel Mondjiba',
      description: 'Ngaliema, Kinshasa, RDC',
      coordinates: { lat: -4.3350, lng: 15.2720 }
    },
    
    // Communes périphériques
    {
      id: '6',
      name: 'Lemba',
      description: 'Commune de Lemba, Kinshasa, RDC',
      coordinates: { lat: -4.3890, lng: 15.2950 }
    },
    {
      id: '7',
      name: 'Université de Kinshasa (UNIKIN)',
      description: 'Lemba, Kinshasa, RDC',
      coordinates: { lat: -4.4050, lng: 15.2980 }
    },
    {
      id: '8',
      name: 'Kintambo',
      description: 'Commune de Kintambo, Kinshasa, RDC',
      coordinates: { lat: -4.3250, lng: 15.2900 }
    },
    {
      id: '9',
      name: 'Masina',
      description: 'Commune de Masina, Kinshasa, RDC',
      coordinates: { lat: -4.3850, lng: 15.3750 }
    },
    {
      id: '10',
      name: 'Ngaba',
      description: 'Commune de Ngaba, Kinshasa, RDC',
      coordinates: { lat: -4.3620, lng: 15.2920 }
    },
    {
      id: '11',
      name: 'Matete',
      description: 'Commune de Matete, Kinshasa, RDC',
      coordinates: { lat: -4.3720, lng: 15.2820 }
    },
    {
      id: '12',
      name: 'Bandalungwa',
      description: 'Commune de Bandalungwa, Kinshasa, RDC',
      coordinates: { lat: -4.3420, lng: 15.2950 }
    },
    {
      id: '13',
      name: 'Selembao',
      description: 'Commune de Selembao, Kinshasa, RDC',
      coordinates: { lat: -4.3980, lng: 15.2720 }
    },
    {
      id: '14',
      name: 'Limete',
      description: 'Commune de Limete, Kinshasa, RDC',
      coordinates: { lat: -4.3650, lng: 15.3250 }
    },
    
    // Lieux importants
    {
      id: '15',
      name: 'Aéroport de N\'djili',
      description: 'N\'djili, Kinshasa, RDC',
      coordinates: { lat: -4.3976, lng: 15.4447 }
    },
    {
      id: '16',
      name: 'Stade des Martyrs',
      description: 'Lingwala, Kinshasa, RDC',
      coordinates: { lat: -4.3205, lng: 15.3099 }
    },
    {
      id: '17',
      name: 'Marché de la Liberté',
      description: 'Kinshasa, RDC',
      coordinates: { lat: -4.3290, lng: 15.3120 }
    },
    {
      id: '18',
      name: 'Avenue Victoire',
      description: 'Ngaliema, Kinshasa, RDC',
      coordinates: { lat: -4.3420, lng: 15.2810 }
    },
    {
      id: '19',
      name: 'Avenue des Aviateurs',
      description: 'Gombe, Kinshasa, RDC',
      coordinates: { lat: -4.3230, lng: 15.3090 }
    },
    {
      id: '20',
      name: 'Avenue de l\'Equateur',
      description: 'Gombe, Kinshasa, RDC',
      coordinates: { lat: -4.3195, lng: 15.3145 }
    },
    {
      id: '21',
      name: 'Place de la Gare',
      description: 'Kinshasa, RDC',
      coordinates: { lat: -4.3310, lng: 15.3150 }
    },
    {
      id: '22',
      name: 'Boulevard Lumumba',
      description: 'Limete, Kinshasa, RDC',
      coordinates: { lat: -4.3680, lng: 15.3280 }
    },
    {
      id: '23',
      name: 'Commune de Ngaliema',
      description: 'Ngaliema, Kinshasa, RDC',
      coordinates: { lat: -4.3550, lng: 15.2650 }
    },
    {
      id: '24',
      name: 'Commune de Barumbu',
      description: 'Barumbu, Kinshasa, RDC',
      coordinates: { lat: -4.3165, lng: 15.3250 }
    },
    {
      id: '25',
      name: 'Kinshasa Centre',
      description: 'Centre-ville, Kinshasa, RDC',
      coordinates: { lat: -4.3276, lng: 15.3136 }
    }
  ];

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
    
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      isUserTypingRef.current = false;
      return;
    }

    setIsLoading(true);
    updateDropdownPosition();
    
    // Simulation d'une recherche avec délai
    setTimeout(() => {
      const filtered = kinshasaAddresses.filter(address =>
        address.name.toLowerCase().includes(query.toLowerCase()) ||
        address.description.toLowerCase().includes(query.toLowerCase())
      );
      
      // Si l'utilisateur tape une adresse qui n'existe pas dans les suggestions,
      // créer une suggestion personnalisée avec l'adresse exacte tapée
      if (filtered.length === 0 && query.trim().length >= 2) {
        // Générer des coordonnées approximatives autour de Kinshasa
        const baseLatKinshasa = -4.3276;
        const baseLngKinshasa = 15.3136;
        const randomOffset = () => (Math.random() - 0.5) * 0.1; // ±5km environ
        
        filtered.push({
          id: 'custom',
          name: query.trim(),
          description: 'Kinshasa, RDC',
          coordinates: { 
            lat: baseLatKinshasa + randomOffset(), 
            lng: baseLngKinshasa + randomOffset() 
          }
        });
      }
      
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setIsLoading(false);
      isUserTypingRef.current = false;
    }, 300);
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