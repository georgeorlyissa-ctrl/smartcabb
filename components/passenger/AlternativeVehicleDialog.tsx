import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Car, X, Clock, DollarSign } from 'lucide-react';
import { VEHICLE_PRICING, VehicleCategory, formatCDF, convertUSDtoCDF } from '../../lib/pricing';

interface AlternativeVehicleDialogProps {
  isOpen: boolean;
  originalCategory: VehicleCategory;
  alternativeCategory: VehicleCategory;
  availableDriversCount: number;
  estimatedDuration: number;
  onAccept: (newPrice: number) => void;
  onDecline: () => void;
}

export function AlternativeVehicleDialog({
  isOpen,
  originalCategory,
  alternativeCategory,
  availableDriversCount,
  estimatedDuration,
  onAccept,
  onDecline
}: AlternativeVehicleDialogProps) {
  
  // Calculer le nouveau prix pour la catégorie alternative
  const calculateAlternativePrice = () => {
    const hours = Math.max(1, Math.ceil(estimatedDuration / 60));
    const pricing = VEHICLE_PRICING[alternativeCategory];
    
    if (alternativeCategory === 'smart_business') {
      return convertUSDtoCDF(pricing.dailyRate);
    }
    
    const hourlyRateUSD = pricing.hourlyRateDay || 0;
    return convertUSDtoCDF(hourlyRateUSD * hours);
  };

  const alternativePrice = calculateAlternativePrice();

  const categoryNames: Record<VehicleCategory, string> = {
    'smart_standard': 'SmartCabb Standard',
    'smart_confort': 'SmartCabb Confort',
    'smart_plus': 'SmartCabb Plus',
    'smart_business': 'SmartCabb Business'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onDecline}
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Véhicule alternatif disponible</h3>
                      <p className="text-xs text-white/80">Pas de {categoryNames[originalCategory]} disponible</p>
                    </div>
                  </div>
                  <button
                    onClick={onDecline}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Message */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-900">
                    <span className="font-medium">Aucun conducteur disponible</span> pour la catégorie <span className="font-semibold">{categoryNames[originalCategory]}</span>.
                  </p>
                  <p className="text-sm text-amber-800 mt-2">
                    Nous avons <span className="font-semibold">{availableDriversCount} conducteur{availableDriversCount > 1 ? 's' : ''}</span> en <span className="font-semibold">{categoryNames[alternativeCategory]}</span> disponible{availableDriversCount > 1 ? 's' : ''} pour vous !
                  </p>
                </div>

                {/* Alternative Vehicle Card */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-blue-900">{categoryNames[alternativeCategory]}</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        {VEHICLE_PRICING[alternativeCategory].capacity} places • {VEHICLE_PRICING[alternativeCategory].features.join(' • ')}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center">
                      <Car className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-blue-200">
                    <div className="flex items-center gap-2 text-blue-700">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Prix estimé</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-blue-900">
                        {formatCDF(alternativePrice)}
                      </span>
                      <p className="text-xs text-blue-600 mt-0.5">
                        ~{estimatedDuration} minutes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Cette offre est valable pour <span className="font-medium">les 2 prochaines minutes</span>. Les conducteurs de {categoryNames[originalCategory]} pourront toujours accepter votre demande.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={onDecline}
                  className="flex-1 h-12 border-2"
                >
                  Refuser
                </Button>
                <Button
                  onClick={() => onAccept(alternativePrice)}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                >
                  Accepter ({categoryNames[alternativeCategory]})
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
