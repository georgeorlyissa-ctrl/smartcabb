import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useAppState } from '../hooks/useAppState';
import { 
  CheckCircle, 
  Star, 
  Clock, 
  MapPin, 
  DollarSign,
  Receipt,
  Route,
  CreditCard,
  Banknote
} from 'lucide-react';

interface RideCompletionSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rideData: {
    duration: number; // en secondes
    distance: number; // en km
    baseCost: number; // coût de base en CDF
    waitingTime: number; // temps d'attente en secondes
    waitingCost: number; // coût d'attente en CDF
    totalCost: number; // coût total en CDF
    freeWaitingDisabled?: boolean; // si l'attente gratuite a été désactivée
    billingElapsedTime?: number; // NOUVEAU : temps de facturation figé (en secondes)
    driverName?: string;
    passengerName?: string;
    vehicleType: 'Smart Standard' | 'Smart Confort' | 'Smart Plus';
    startLocation: string;
    endLocation: string;
    tip?: number; // pourboire en CDF
  };
  userType: 'passenger' | 'driver';
  onRateRide?: (rating: number) => void;
  onTip?: (amount: number) => void;
}

export function RideCompletionSummaryDialog({ 
  isOpen, 
  onClose, 
  rideData,
  userType,
  onRateRide,
  onTip
}: RideCompletionSummaryDialogProps) {
  const { state } = useAppState();
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedTip, setSelectedTip] = useState(0);
  const [showInDollars, setShowInDollars] = useState(false);

  // Taux de change depuis les paramètres admin ou valeur par défaut
  const exchangeRate = state.adminSettings?.exchangeRate || 2500;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}min ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}min ${secs}s`;
    }
    return `${secs}s`;
  };

  const convertToUSD = (amountCDF: number) => {
    if (!amountCDF || isNaN(amountCDF)) return '0.00';
    return (amountCDF / exchangeRate).toFixed(2);
  };

  const formatPrice = (amountCDF: number) => {
    if (showInDollars) {
      return `$${convertToUSD(amountCDF)} USD`;
    }
    return `${amountCDF.toLocaleString()} CDF`;
  };

  const handleRating = (rating: number) => {
    setSelectedRating(rating);
    if (onRateRide) {
      onRateRide(rating);
    }
  };

  const handleTipSelection = (amount: number) => {
    setSelectedTip(amount);
    if (onTip) {
      onTip(amount);
    }
  };

  const tipOptions = [0, 1000, 2000, 5000, 10000]; // Options de pourboire en CDF

  const totalWithTip = rideData.totalCost + selectedTip;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          Résumé de la course terminée
        </DialogTitle>
        <DialogDescription className="sr-only">
          Détails complets de votre course avec durée, distance et coûts
        </DialogDescription>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 py-4"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Course terminée !
              </h2>
              <p className="text-sm text-gray-600">
                {userType === 'passenger' 
                  ? `Conducteur: ${rideData.driverName || 'Pierre Kabamba'}`
                  : `Passager: ${rideData.passengerName || 'Grace-Divine Kambamba'}`
                }
              </p>
            </div>
          </div>

          {/* Trip Route */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Route className="w-4 h-4 text-gray-600" />
              <span className="font-medium">Itinéraire</span>
              <Badge variant="outline" className="ml-auto">
                {rideData.vehicleType}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm text-gray-600">Départ</p>
                  <p className="font-medium">{rideData.startLocation}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm text-gray-600">Arrivée</p>
                  <p className="font-medium">{rideData.endLocation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Durée totale</p>
              <p className="font-semibold">{formatDuration(rideData.duration)}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <MapPin className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Distance</p>
              <p className="font-semibold">{(rideData?.distance || 0).toFixed(1)} km</p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium flex items-center">
                <Receipt className="w-4 h-4 mr-2" />
                Détail des coûts
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInDollars(!showInDollars)}
                className="text-xs"
              >
                {showInDollars ? <Banknote className="w-3 h-3 mr-1" /> : <DollarSign className="w-3 h-3 mr-1" />}
                {showInDollars ? 'CDF' : 'USD'}
              </Button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Frais de prise en charge</span>
                <span>{formatPrice(rideData.baseCost)}</span>
              </div>
              
              {/* Afficher le temps de facturation si attente gratuite désactivée OU temps > 10min */}
              {(rideData.freeWaitingDisabled || rideData.waitingTime > 600) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {rideData.freeWaitingDisabled ? (
                      // Si attente désactivée, afficher le chrono de facturation
                      <>
                        Facturation ({Math.floor((rideData.billingElapsedTime || 0) / 60)}min {(rideData.billingElapsedTime || 0) % 60}s)
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Attente gratuite désactivée
                        </Badge>
                      </>
                    ) : (
                      // Sinon afficher le temps d'attente dépassant les 10min
                      `Temps d'attente (${Math.floor((rideData.waitingTime - 600) / 60)}min)`
                    )}
                  </span>
                  <span>{formatPrice(rideData.waitingCost)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Catégorie : {rideData.vehicleType}</span>
              </div>
              
              {selectedTip > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pourboire</span>
                  <span>{formatPrice(selectedTip)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-green-600">{formatPrice(totalWithTip)}</span>
              </div>
              
              {showInDollars && (
                <div className="text-xs text-gray-500 text-right">
                  ≈ {totalWithTip.toLocaleString()} CDF (1 USD = {exchangeRate} CDF)
                </div>
              )}
            </div>
          </div>

          {/* Tip Section (for passengers only) */}
          {userType === 'passenger' && (
            <div className="space-y-3">
              <h4 className="font-medium">Pourboire (optionnel)</h4>
              <div className="grid grid-cols-5 gap-2">
                {tipOptions.map((tip) => (
                  <Button
                    key={tip}
                    variant={selectedTip === tip ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTipSelection(tip)}
                    className="text-xs"
                  >
                    {tip === 0 ? 'Aucun' : `${tip.toLocaleString()}`}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Rating Section (for passengers only) */}
          {userType === 'passenger' && onRateRide && (
            <div className="space-y-3">
              <h4 className="font-medium text-center">
                Comment évaluez-vous cette course ?
              </h4>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRating(rating)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        rating <= selectedRating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      } hover:text-yellow-500`} 
                    />
                  </button>
                ))}
              </div>
              {selectedRating > 0 && (
                <p className="text-sm text-gray-600 text-center">
                  Merci pour votre évaluation !
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onClose}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Terminer
            </Button>
            
            {userType === 'passenger' && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  // Logic for new ride - this could navigate to map screen
                }}
                className="w-full"
              >
                Nouvelle course
              </Button>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}