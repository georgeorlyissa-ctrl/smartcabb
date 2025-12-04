import { useAppState } from '../../hooks/useAppState';
import { Star, User } from 'lucide-react';
import { toast } from 'sonner';

export function RatingScreen() {
  const { state, setCurrentScreen, updateRide, drivers } = useAppState();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const assignedDriver = drivers.find(d => d.id === state.currentRide?.driverId);

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error('Veuillez donner une note');
      return;
    }

    updateRide(state.currentRide?.id || '', { 
      rating,
      comment: comment.trim() || undefined
    });

    toast.success('Merci pour votre évaluation !');
    
    // 📱 Envoyer SMS de remerciement au conducteur et au passager
    if (assignedDriver?.phone && state.currentUser?.phone) {
      try {
        await notifyRatingRequest(
          state.currentUser.phone,
          assignedDriver.phone,
          state.currentUser.name || 'Passager',
          assignedDriver.name
        );
        console.log('✅ SMS de notation envoyé avec succès');
      } catch (error) {
        console.error('❌ Erreur envoi SMS de notation:', error);
      }
    }
    
    // Attendre un peu avant de rediriger
    setTimeout(() => {
      setCurrentScreen('ride-history');
    }, 1500);
  };

  const handleSkip = () => {
    setCurrentScreen('map');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="min-h-screen bg-white flex flex-col"
    >
      {/* Header */}
      <div className="p-6 text-center border-b">
        <h1 className="text-2xl mb-2">Course terminée !</h1>
        <p className="text-gray-600">Comment s'est passé votre trajet ?</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col items-center">
        {/* Driver Info */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-xl mb-1">{assignedDriver?.name}</h2>
          <p className="text-gray-600">
            {assignedDriver?.vehicleInfo.color} {assignedDriver?.vehicleInfo.make} {assignedDriver?.vehicleInfo.model}
          </p>
          <p className="text-sm text-gray-500 font-mono mt-1">
            {assignedDriver?.vehicleInfo.plate}
          </p>
        </motion.div>

        {/* Rating */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-center mb-4">Notez votre chauffeur</p>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 flex items-center justify-center"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </motion.button>
            ))}
          </div>
          {rating > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-2 text-gray-600"
            >
              {rating === 1 && 'Très insatisfait'}
              {rating === 2 && 'Insatisfait'}
              {rating === 3 && 'Correct'}
              {rating === 4 && 'Satisfait'}
              {rating === 5 && 'Excellent'}
            </motion.p>
          )}
        </motion.div>

        {/* Comment - toujours visible maintenant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm mb-8"
        >
          <label className="block text-sm mb-2">
            Commentaire sur votre expérience
          </label>
          <Textarea
            placeholder="Dites-nous comment s'est passé votre trajet avec ce chauffeur..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-28 resize-none bg-gray-50 border-0 rounded-xl"
            maxLength={300}
          />
          <p className="text-xs text-gray-500 text-right mt-1">
            {comment.length}/300
          </p>
        </motion.div>

        {/* Trip Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-sm bg-gray-50 rounded-xl p-4 mb-8"
        >
          <h3 className="font-semibold mb-3">Résumé du trajet</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Distance</span>
              <span>4.2 km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Durée</span>
              <span>12 min</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{state.currentRide?.actualPrice?.toLocaleString()} CDF</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="p-6 space-y-3"
      >
        <Button
          onClick={handleSubmitRating}
          disabled={rating === 0}
          className="w-full h-14 bg-green-500 hover:bg-green-600 text-white rounded-xl"
        >
          {rating === 0 ? 'Veuillez donner une note' : 'Envoyer l\'évaluation'}
        </Button>
        
        <div className="flex space-x-3">
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="flex-1 h-12 text-gray-600"
          >
            Passer
          </Button>
          
          <Button
            onClick={() => setCurrentScreen('ride-history')}
            variant="outline"
            className="flex-1 h-12"
          >
            Voir l'historique
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}