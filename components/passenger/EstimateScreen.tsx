import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppState } from '../../hooks/useAppState';
import { PassengerCountSelector } from '../PassengerCountSelector';
import { PromoCodeInput } from '../PromoCodeInput';
import { BookForSomeoneElse } from './BookForSomeoneElse';
import { RouteMapPreview } from '../RouteMapPreview';
import { PromoCode } from '../../types';
import { VEHICLE_PRICING, VehicleCategory, convertUSDtoCDF, formatCDF, isDayTime } from '../../lib/pricing';
import { 
  calculateEstimatedDuration, 
  calculateDetailedDuration, 
  calculateDurationRange,
  formatDuration,
  getCurrentTrafficConditions
} from '../../lib/duration-calculator';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { ArrowLeft, Car, Users, Clock, MapPin, Info, Sun, Moon } from 'lucide-react';

// 🚗 CHEMINS DES IMAGES DE VÉHICULES (pour GitHub/Vercel)
// ⚠️ Ces chemins pointent vers /public/vehicles/
const standardVehicle1 = '/vehicles/smartcabb_standard/Standard_1.png';
const standardVehicle2 = '/vehicles/smartcabb_standard/Standard_2.png';
const standardVehicle3 = '/vehicles/smartcabb_standard/Standard_3.png';
const standardVehicle4 = '/vehicles/smartcabb_standard/Standard_4.png';
const standardVehicle5 = '/vehicles/smartcabb_standard/Stadard_5.png';
const standardVehicle5 = '/vehicles/smartcabb_standard/Standard_6.png';

const confortVehicle1 = '/vehicles/smartcabb_confort/confort 1.png';
const confortVehicle2 = '/vehicles/smartcabb_confort/Confort_2.png';
const confortVehicle3 = '/vehicles/smartcabb_confort/Confort_3.png';

const plusVehicle1 = '/vehicles/smartcabb_familiale/Familiale_1.png';
const plusVehicle2 = '/vehicles/smartcabb_familiale/Familiale_2.png';
const plusVehicle3 = '/vehicles/smartcabb_familiale/Familiale_3.png';
const plusVehicle4 = '/vehicles/smartcabb_familiale/Familiale_4.png';

const businessVehicle1 = '/vehicles/smartcabb_business/Bussiness_1.png';
const businessVehicle2 = '/vehicles/smartcabb_business/Bussiness_2.png';
const businessVehicle3 = '/vehicles/smartcabb_business/Bussiness_3.png';
const businessVehicle4 = '/vehicles/smartcabb_business/Bussiness_4.png';
const businessVehicle5 = '/vehicles/smartcabb_business/Bussiness_5.png';
const businessVehicle6 = '/vehicles/smartcabb_business/Business_6.png';

export function EstimateScreen() {
  const { t } = useTranslation();
  const { setCurrentScreen, createRide, state, calculateDistance } = useAppState();
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCategory>('smart_standard');
  const [passengerCount, setPassengerCount] = useState(1);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [basePrice, setBasePrice] = useState(12500);
  const [estimatedDuration, setEstimatedDuration] = useState(15);
  
  // État pour la réservation pour quelqu'un d'autre
  const [showBeneficiaryForm, setShowBeneficiaryForm] = useState(false);
  const [beneficiary, setBeneficiary] = useState<{ name: string; phone: string } | null>(null);
  
  // Utiliser les vraies données de l'état global (pickup et destination saisies par l'utilisateur)
  const pickup = state.pickup || { lat: -4.3276, lng: 15.3136, address: 'Boulevard du 30 Juin, Gombe, Kinshasa' };
  const destination = state.destination || { lat: -4.4050, lng: 15.2980, address: 'Université de Kinshasa (UNIKIN)' };
  const distanceKm = calculateDistance ? calculateDistance(pickup, destination) : 10.0;
  
  // Récupérer les instructions de prise en charge (point de repère)
  const pickupInstructions = state.pickupInstructions || '';
  
  console.log('📍 EstimateScreen - Pickup:', pickup.address, `(${pickup.lat}, ${pickup.lng})`);
  console.log('📍 EstimateScreen - Point de repère:', pickupInstructions || 'Aucun');
  console.log('🎯 EstimateScreen - Destination:', destination.address, `(${destination.lat}, ${destination.lng})`);
  console.log('📏 Distance calculée:', (distanceKm || 0).toFixed(2), 'km');

  const vehicles = [
    {
      id: 'smart_standard' as VehicleCategory,
      name: t('smart_standard'),
      description: `${VEHICLE_PRICING.smart_standard.capacity} places · ${VEHICLE_PRICING.smart_standard.features.join(', ')}`,
      capacity: VEHICLE_PRICING.smart_standard.capacity,
      icon: Car,
      color: 'bg-gray-100',
      hourlyRateUSD: VEHICLE_PRICING.smart_standard.pricing.course_heure.jour.usd,
      hourlyRateCDF: convertUSDtoCDF(VEHICLE_PRICING.smart_standard.pricing.course_heure.jour.usd),
      rateText: `${formatCDF(convertUSDtoCDF(VEHICLE_PRICING.smart_standard.pricing.course_heure.jour.usd))} par heure`,
      rateTextShort: `${VEHICLE_PRICING.smart_standard.pricing.course_heure.jour.usd}$/h`,
      images: [standardVehicle1, standardVehicle2, standardVehicle3]
    },
    {
      id: 'smart_confort' as VehicleCategory,
      name: t('smart_confort'),
      description: `${VEHICLE_PRICING.smart_confort.capacity} places · ${VEHICLE_PRICING.smart_confort.features.join(', ')}`,
      capacity: VEHICLE_PRICING.smart_confort.capacity,
      icon: Car,
      color: 'bg-blue-100',
      hourlyRateUSD: VEHICLE_PRICING.smart_confort.pricing.course_heure.jour.usd,
      hourlyRateCDF: convertUSDtoCDF(VEHICLE_PRICING.smart_confort.pricing.course_heure.jour.usd),
      rateText: `${formatCDF(convertUSDtoCDF(VEHICLE_PRICING.smart_confort.pricing.course_heure.jour.usd))} par heure`,
      rateTextShort: `${VEHICLE_PRICING.smart_confort.pricing.course_heure.jour.usd}$/h`,
      images: [confortVehicle1, confortVehicle2, confortVehicle3]
    },
    {
      id: 'smart_plus' as VehicleCategory,
      name: t('smart_plus'),
      description: `${VEHICLE_PRICING.smart_plus.capacity} places · ${VEHICLE_PRICING.smart_plus.features.join(', ')}`,
      capacity: VEHICLE_PRICING.smart_plus.capacity,
      icon: Users,
      color: 'bg-green-100',
      hourlyRateUSD: VEHICLE_PRICING.smart_plus.pricing.course_heure.jour.usd,
      hourlyRateCDF: convertUSDtoCDF(VEHICLE_PRICING.smart_plus.pricing.course_heure.jour.usd),
      rateText: `${formatCDF(convertUSDtoCDF(VEHICLE_PRICING.smart_plus.pricing.course_heure.jour.usd))} par heure`,
      rateTextShort: `${VEHICLE_PRICING.smart_plus.pricing.course_heure.jour.usd}$/h`,
      images: [plusVehicle1, plusVehicle2, plusVehicle3]
    },
    {
      id: 'smart_business' as VehicleCategory,
      name: t('smart_business'),
      description: `${VEHICLE_PRICING.smart_business.capacity} places · ${VEHICLE_PRICING.smart_business.features.join(', ')}`,
      capacity: VEHICLE_PRICING.smart_business.capacity,
      icon: Users,
      color: 'bg-amber-100',
      hourlyRateUSD: VEHICLE_PRICING.smart_business.pricing.location_jour.usd,
      hourlyRateCDF: convertUSDtoCDF(VEHICLE_PRICING.smart_business.pricing.location_jour.usd),
      rateText: `${formatCDF(convertUSDtoCDF(VEHICLE_PRICING.smart_business.pricing.location_jour.usd))} par jour`,
      rateTextShort: `${VEHICLE_PRICING.smart_business.pricing.location_jour.usd}$/jour`,
      images: [businessVehicle1, businessVehicle2, businessVehicle3]
    }
  ];
  
  // Calculate price based on estimated time and vehicle category WITH DAY/NIGHT RATES
  const calculatePrice = (vehicleType: string, durationMinutes: number) => {
    const pricing = VEHICLE_PRICING[vehicleType as VehicleCategory];
    if (!pricing) return 25000;
    
    const currentHour = new Date().getHours();
    const isDay = isDayTime(currentHour);
    
    if (vehicleType === 'smart_business') {
      const dailyRateUSD = pricing.pricing.location_jour.usd;
      let priceCDF = convertUSDtoCDF(dailyRateUSD);
      
      const walletBalance = state.currentUser?.walletBalance || 0;
      const hasWalletDiscount = walletBalance >= convertUSDtoCDF(20);
      if (hasWalletDiscount) {
        priceCDF = Math.round(priceCDF * 0.95);
      }
      
      return priceCDF;
    }
    
    const hours = Math.max(1, Math.ceil(durationMinutes / 60));
    const hourlyRateUSD = isDay 
      ? pricing.pricing.course_heure.jour.usd
      : pricing.pricing.course_heure.nuit.usd;
    
    const priceUSD = hours * hourlyRateUSD;
    let priceCDF = convertUSDtoCDF(priceUSD);
    
    const walletBalance = state.currentUser?.walletBalance || 0;
    const hasWalletDiscount = walletBalance >= convertUSDtoCDF(20);
    if (hasWalletDiscount) {
      priceCDF = Math.round(priceCDF * 0.95);
    }
    
    return priceCDF;
  };
  
  useEffect(() => {
    if (!pickup || !destination) {
      console.warn('⚠️ Pickup ou destination manquant');
      return;
    }
    
    const newDuration = calculateEstimatedDuration(pickup, destination);
    setEstimatedDuration(newDuration);
    
    const newPrice = calculatePrice(selectedVehicle, newDuration);
    setBasePrice(newPrice);
  }, [selectedVehicle, pickup, destination]);
  
  const finalPrice = appliedPromo 
    ? appliedPromo.type === 'percentage' 
      ? Math.round(basePrice * (1 - appliedPromo.discount / 100))
      : Math.max(0, basePrice - appliedPromo.discount)
    : basePrice;

  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);

  const handleBookRide = async () => {
    const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);
    if (!selectedVehicleData) {
      console.error('❌ Aucun véhicule sélectionné');
      return;
    }

    const rideData = {
      pickup,
      destination,
      vehicleType: selectedVehicle as 'smart_standard' | 'smart_confort' | 'smart_plus',
      estimatedPrice: finalPrice,
      estimatedDuration,
      passengerCount,
      distanceKm,
      promoCode: appliedPromo?.code,
      promoDiscount: appliedPromo ? (appliedPromo.type === 'percentage' 
        ? Math.round(basePrice * (appliedPromo.discount / 100))
        : appliedPromo.discount) : undefined
    };

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/rides/create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            passengerId: state.currentUser?.id || 'temp-user',
            passengerName: state.currentUser?.name || 'Passager',
            passengerPhone: state.currentUser?.phone || '',
            pickup: rideData.pickup,
            destination: rideData.destination,
            pickupInstructions: state.pickupInstructions,
            vehicleType: rideData.vehicleType,
            estimatedPrice: rideData.estimatedPrice,
            estimatedDuration: rideData.estimatedDuration,
            distance: rideData.distanceKm,
            passengerCount: rideData.passengerCount
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', response.status, errorText);
        toast.error(`Erreur ${response.status}`, {
          description: 'Impossible de créer la course.',
          duration: 5000
        });
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.rideId) {
        toast.error('Erreur création course', {
          description: result.error || 'Pas d\'ID de course',
          duration: 5000
        });
        throw new Error(result.error || 'Erreur création');
      }

      createRide({
        id: result.rideId,
        passengerId: state.currentUser?.id || 'temp-user',
        pickup: rideData.pickup,
        destination: rideData.destination,
        pickupInstructions: state.pickupInstructions,
        status: 'pending',
        estimatedPrice: rideData.estimatedPrice,
        estimatedDuration: rideData.estimatedDuration,
        vehicleType: rideData.vehicleType,
        passengerCount: rideData.passengerCount,
        distanceKm: rideData.distanceKm,
        promoCode: rideData.promoCode,
        promoDiscount: rideData.promoDiscount
      } as any);

      setTimeout(() => {
        setCurrentScreen('ride');
      }, 100);
    } catch (error) {
      console.error('❌ Erreur:', error);
      if (!toast) {
        alert('Erreur lors de la réservation.');
      }
    }
  };

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b border-border flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentScreen('map')}
          className="w-10 h-10 hover:bg-muted"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </Button>
        <h1 className="text-primary">Estimation du trajet</h1>
        <div className="w-10" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Map Preview */}
        <div className="p-6 bg-white/60 backdrop-blur-sm">
          <RouteMapPreview
            pickup={pickup}
            destination={destination}
            distanceKm={distanceKm}
            estimatedDuration={estimatedDuration}
            className="mb-6"
          />
        </div>

        {/* Route Info */}
        <div className="p-6 bg-white/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-border space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-secondary rounded-full mt-2 shadow-lg shadow-secondary/30" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t('pickup_location')}</p>
                <p className="text-foreground">{pickup.address}</p>
                {pickupInstructions && (
                  <div className="flex items-start gap-2 mt-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
                    <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-green-700 font-medium mb-1">Point de repère</p>
                      <p className="text-sm text-green-900">{pickupInstructions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="h-8 border-l-2 border-dashed border-border ml-1.5" />
            
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-accent rounded-full mt-2 shadow-lg shadow-accent/30" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t('destination')}</p>
                <p className="text-foreground">{destination.address}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">Distance estimée</span>
              <span className="font-medium text-primary">{distanceKm.toFixed(1)} {t('km')}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Durée estimée</span>
              </div>
              <div className="text-right">
                <span className="font-medium text-primary">{formatDuration(estimatedDuration)}</span>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {(() => {
                    if (!pickup || !destination) return '(calcul...)';
                    const range = calculateDurationRange(pickup, destination);
                    return `(${range.min}-${range.max} min)`;
                  })()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs text-blue-700">
                {(() => {
                  const traffic = getCurrentTrafficConditions();
                  const labels = {
                    morning_rush: 'Heure de pointe matinale - Trafic dense',
                    evening_rush: 'Heure de pointe du soir - Trafic très dense',
                    midday: 'Milieu de journée - Trafic modéré',
                    night: 'Circulation nocturne - Trafic fluide',
                    weekend: 'Weekend - Trafic léger'
                  };
                  return labels[traffic.timeOfDay];
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Options */}
        <div className="p-6 space-y-6">
          <h2 className="text-lg mb-4">{t('choose_vehicle')}</h2>
          
          {/* Wallet Discount */}
          {((state.currentUser?.walletBalance || 0) >= convertUSDtoCDF(20)) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  🎁
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-900 text-sm mb-1">
                    Réduction Portefeuille Active !
                  </p>
                  <p className="text-xs text-green-700">
                    Vous bénéficiez de <span className="font-semibold">5% de réduction</span> sur tous les prix grâce à votre solde de {formatCDF(state.currentUser?.walletBalance || 0)}.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="space-y-3">
            {vehicles.map((vehicle) => {
              const Icon = vehicle.icon;
              const isSelected = selectedVehicle === vehicle.id;
              const vehiclePrice = calculatePrice(vehicle.id, estimatedDuration);
              
              const currentHour = new Date().getHours();
              const isDay = isDayTime(currentHour);
              const isNight = !isDay;
              const pricing = VEHICLE_PRICING[vehicle.id];
              
              let dayPriceUSD, nightPriceUSD, dayPriceCDF, nightPriceCDF;
              
              if (vehicle.id === 'smart_business') {
                dayPriceUSD = pricing.pricing.location_jour.usd;
                dayPriceCDF = convertUSDtoCDF(dayPriceUSD);
                nightPriceUSD = null;
                nightPriceCDF = null;
              } else {
                const hours = Math.max(1, Math.ceil(estimatedDuration / 60));
                dayPriceUSD = (pricing.pricing.course_heure.jour.usd || 0) * hours;
                dayPriceCDF = convertUSDtoCDF(dayPriceUSD);
                nightPriceUSD = (pricing.pricing.course_heure.nuit.usd || 0) * hours;
                nightPriceCDF = convertUSDtoCDF(nightPriceUSD);
              }
              
              return (
                <motion.button
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 bg-white ${
                    isSelected 
                      ? 'border-secondary bg-secondary/5 shadow-lg shadow-secondary/20' 
                      : 'border-border hover:border-secondary/50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      {vehicle.images && vehicle.images.length > 0 ? (
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                          <img 
                            src={vehicle.images[0]} 
                            alt={vehicle.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          isSelected ? 'bg-secondary text-white' : 'bg-muted text-primary'
                        } transition-colors duration-300`}>
                          <Icon className="w-7 h-7" />
                        </div>
                      )}
                      <div className="text-left">
                        <h3 className="text-foreground">{vehicle.name}</h3>
                        <p className="text-sm text-muted-foreground">{vehicle.description}</p>
                        <div className="flex items-center space-x-3 mt-1.5">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{estimatedDuration} {t('minutes')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Prix */}
                    <div className="text-right space-y-2">
                      {vehicle.id === 'smart_business' ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`text-xl font-semibold ${isSelected ? 'text-secondary' : 'text-primary'}`}>
                              {dayPriceCDF.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">{t('cdf')}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ≈ {dayPriceUSD}$ USD/jour
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <div className="flex items-center justify-end gap-2">
                              <span className={`text-xl font-semibold ${isSelected ? 'text-secondary' : 'text-primary'}`}>
                                {vehiclePrice.toLocaleString()}
                              </span>
                              <span className="text-xs text-muted-foreground">{t('cdf')}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ≈ {isNight ? nightPriceUSD.toFixed(1) : dayPriceUSD.toFixed(1)}$ USD
                            </div>
                          </div>
                          
                          <div className="bg-muted/50 rounded-lg px-2 py-1.5 space-y-1">
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-1">
                                <Sun className="w-3 h-3 text-amber-500" />
                                <span className={isNight ? 'text-muted-foreground' : 'text-primary font-medium'}>
                                  Jour
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={isNight ? 'text-muted-foreground' : 'text-primary font-medium'}>
                                  {dayPriceCDF.toLocaleString()}
                                </span>
                                <span className="text-muted-foreground text-[10px]">
                                  ({dayPriceUSD.toFixed(1)}$)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-1">
                                <Moon className="w-3 h-3 text-blue-500" />
                                <span className={isNight ? 'text-primary font-medium' : 'text-muted-foreground'}>
                                  Nuit
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={isNight ? 'text-primary font-medium' : 'text-muted-foreground'}>
                                  {nightPriceCDF.toLocaleString()}
                                </span>
                                <span className="text-muted-foreground text-[10px]">
                                  ({nightPriceUSD.toFixed(1)}$)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center mx-auto"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Passenger Count */}
          <PassengerCountSelector
            value={passengerCount}
            onChange={setPassengerCount}
            maxPassengers={
              selectedVehicle === 'smart_plus' ? 7 : 
              selectedVehicle === 'smart_business' ? 7 : 
              3
            }
          />

          {/* Promo Code */}
          <PromoCodeInput
            rideAmount={basePrice}
            onPromoApplied={setAppliedPromo}
          />
          
          {/* Book for someone else */}
          <BookForSomeoneElse
            showForm={showBeneficiaryForm}
            onToggleForm={setShowBeneficiaryForm}
            onBeneficiaryChange={setBeneficiary}
          />
        </div>
      </div>

      {/* Book Button */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6 border-t border-border bg-white/80 backdrop-blur-sm"
      >
        <div className="space-y-4 mb-4">
          {/* Price breakdown */}
          <div className="bg-gradient-to-br from-muted/50 to-white rounded-2xl p-5 space-y-3 border border-border shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Prix de base</span>
              <span className="font-medium text-foreground">{basePrice.toLocaleString()} {t('cdf')}</span>
            </div>
            
            {appliedPromo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between text-secondary"
              >
                <span>Réduction ({appliedPromo.code})</span>
                <span className="font-medium">-{(basePrice - finalPrice).toLocaleString()} {t('cdf')}</span>
              </motion.div>
            )}
            
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="font-semibold text-foreground">Prix total</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                {finalPrice.toLocaleString()} {t('cdf')}
              </span>
            </div>
          </div>

          {/* Trip details */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border border-border shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">Temps estimé</p>
              <div className="flex items-center justify-center space-x-1">
                <Clock className="w-4 h-4 text-secondary" />
                <span className="font-semibold text-primary">{estimatedDuration} min</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-border shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">Distance</p>
              <span className="font-semibold text-primary">{distanceKm.toFixed(1)} {t('km')}</span>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-border shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">Passagers</p>
              <div className="flex items-center justify-center space-x-1">
                <Users className="w-4 h-4 text-secondary" />
                <span className="font-semibold text-primary">{passengerCount}</span>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleBookRide}
          className="w-full h-14 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-white rounded-xl shadow-lg shadow-secondary/30 transition-all duration-300 hover:shadow-xl"
        >
          {t('confirm_booking')}
        </Button>
      </motion.div>
    </motion.div>
  );
}
