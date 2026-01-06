import { useState } from 'react';
import { motion } from '../framer-motion';
import { Clock, DollarSign, Info } from 'lucide-react';

interface FreeWaitingToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  waitingTime?: number; // Current waiting time in seconds
  freeWaitingTime?: number; // Free waiting time limit in seconds (default 600 = 10 min)
}

export function FreeWaitingToggle({ 
  enabled, 
  onToggle, 
  waitingTime = 0,
  freeWaitingTime = 600 
}: FreeWaitingToggleProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleToggle = () => {
    if (enabled) {
      // Disabling free waiting - show confirmation
      setShowConfirmDialog(true);
    } else {
      // Enabling free waiting
      onToggle(true);
      toast.success('Attente gratuite réactivée');
    }
  };

  const confirmDisable = () => {
    onToggle(false);
    setShowConfirmDialog(false);
    toast.warning('Attente gratuite désactivée - La facturation commence immédiatement');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingFreeTime = Math.max(0, freeWaitingTime - waitingTime);
  const isFreeTimeExpired = waitingTime >= freeWaitingTime;

  return (
    <div className="space-y-4">
      {/* Main Toggle Card */}
      <Card className={`p-4 border-2 ${enabled ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              enabled ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Timer className={`w-5 h-5 ${enabled ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">Attente gratuite</h3>
                <Badge variant={enabled ? "default" : "destructive"}>
                  {enabled ? 'Activée' : 'Désactivée'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {enabled 
                  ? `${Math.floor(freeWaitingTime / 60)} minutes d'attente gratuite pour le passager`
                  : 'La facturation commence dès l\'arrivée'
                }
              </p>
            </div>
          </div>
          
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        </div>

        {/* Current Waiting Time Info */}
        {waitingTime > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Temps d'attente actuel:</span>
              </div>
              <span className="font-mono text-lg">{formatTime(waitingTime)}</span>
            </div>
            
            {enabled && !isFreeTimeExpired && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">Temps gratuit restant:</span>
                  <span className="font-mono text-green-600">{formatTime(remainingFreeTime)}</span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(remainingFreeTime / freeWaitingTime) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            {isFreeTimeExpired && (
              <div className="mt-2 p-2 bg-orange-100 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    Temps d'attente gratuite dépassé
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">
              À propos de l'attente gratuite
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Les premiers {Math.floor(freeWaitingTime / 60)} minutes d'attente sont offerts au passager</li>
              <li>• Vous pouvez désactiver cette fonction pour commencer la facturation immédiatement</li>
              <li>• Cette décision affecte uniquement la course en cours</li>
              <li>• La désactivation est irréversible pour cette course</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Désactiver l'attente gratuite ?
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Cette action commencera la facturation immédiatement. 
                  Le passager sera informé de ce changement.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Action irréversible pour cette course
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowConfirmDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={confirmDisable}
                  variant="destructive"
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmer
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}