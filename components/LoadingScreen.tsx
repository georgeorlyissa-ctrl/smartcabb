import { Loader2 } from '../lib/icons';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Chargement...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-green-50 flex flex-col items-center justify-center p-6">
      <div className="text-center">
        {/* Logo simplifié inline sans import lourd */}
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-3xl font-black text-white">SC</span>
        </div>
        <Loader2 className="w-8 h-8 mx-auto mb-4 text-cyan-500 animate-spin" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}