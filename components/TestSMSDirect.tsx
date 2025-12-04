import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function TestSMSDirect() {
  const [phoneNumber, setPhoneNumber] = useState('+243840317442');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [healthCheck, setHealthCheck] = useState<any>(null);

  // Test de santé au chargement
  useEffect(() => {
    testHealth();
  }, []);

  const testHealth = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setHealthCheck({ status: 'ok', data });
      } else {
        setHealthCheck({ status: 'error', code: response.status });
      }
    } catch (error: any) {
      setHealthCheck({ status: 'failed', error: error.message });
    }
  };

  const testSMS = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('📤 Test envoi SMS direct...');
      
      // Générer un message de test avec code aléatoire
      const testCode = Math.floor(100000 + Math.random() * 900000);
      const testMessage = `SmartCabb - Code de test : ${testCode}`;
      
      console.log('📤 Envoi vers /sms/send...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/sms/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ 
            phoneNumber,
            message: testMessage,
            type: 'test'
          })
        }
      );

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur réponse:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Résultat:', data);
      setResult(data);

      if (data.success) {
        if (data.provider === 'simulation') {
          toast.success('SMS simulé (mode développement)');
        } else {
          toast.success('✅ SMS envoyé avec succès ! Vérifiez votre téléphone.');
        }
      } else {
        toast.error(data.error || 'Erreur inconnue');
      }

    } catch (error: any) {
      console.error('❌ Erreur:', error);
      setResult({ error: error.message });
      
      if (error.message.includes('Failed to fetch')) {
        toast.error('Edge Function non accessible - Vérifiez le déploiement');
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <h1 className="text-2xl mb-6">🧪 Test SMS Direct</h1>
        
        {/* Health Check Status */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-sm font-semibold mb-2">État du serveur :</h3>
          {!healthCheck && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Vérification...</span>
            </div>
          )}
          {healthCheck?.status === 'ok' && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-green-700">✅ Serveur actif et fonctionnel</span>
            </div>
          )}
          {healthCheck?.status === 'error' && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-sm text-orange-700">⚠️ Serveur répond (code {healthCheck.code})</span>
            </div>
          )}
          {healthCheck?.status === 'failed' && (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm text-red-700">❌ Serveur non accessible</span>
              </div>
              <p className="text-xs text-red-600 ml-5">{healthCheck.error}</p>
              <Button
                variant="link"
                onClick={testHealth}
                className="text-xs p-0 h-auto ml-5"
              >
                Réessayer
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Numéro de téléphone</label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+243840317442"
            />
          </div>

          <Button
            onClick={testSMS}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Test en cours...' : 'Tester l\'envoi SMS'}
          </Button>

          {result && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Résultat :</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>

              {result.debugOtpCode && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-800">⚠️ Mode DEBUG activé</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Code OTP : <span className="font-mono font-bold">{result.debugOtpCode}</span>
                  </p>
                  <p className="text-xs text-yellow-600 mt-2">
                    Les credentials Africa's Talking ne sont pas configurées dans Supabase.
                  </p>
                </div>
              )}

              {result.error && result.error.includes('Failed to fetch') && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-semibold text-red-800">❌ Edge Function non accessible</p>
                  <p className="text-xs text-red-600 mt-2">
                    Vérifiez que l'Edge Function est déployée sur Supabase.
                  </p>
                  <a 
                    href="https://supabase.com/dashboard/project/chief-mess-97839970/functions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 underline mt-2 inline-block"
                  >
                    Ouvrir le dashboard Supabase →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Instructions :</strong>
          </p>
          <ol className="text-xs text-blue-700 mt-2 space-y-1 list-decimal list-inside">
            <li>Cliquez sur "Tester l'envoi SMS"</li>
            <li>Si erreur "Failed to fetch" → Edge Function non déployée</li>
            <li>Si "Mode DEBUG" → Credentials manquantes dans Supabase</li>
            <li>Si succès → SMS doit arriver sur le téléphone</li>
          </ol>
        </div>
      </Card>
    </div>
  );
}