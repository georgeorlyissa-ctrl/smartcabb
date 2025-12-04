import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

/**
 * Hook personnalisé pour gérer le solde du conducteur de manière centralisée
 * Le solde est stocké dans le backend KV store (source de vérité unique)
 * Synchronisation automatique toutes les 3 secondes
 * 
 * IMPORTANT : Aucune donnée en mémoire locale
 * Toutes les modifications passent par le backend
 */

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52`;

export function useDriverBalance(driverId: string | undefined) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  /**
   * Récupérer le solde depuis le backend
   */
  const fetchBalance = async () => {
    if (!driverId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/drivers/${driverId}/balance`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setBalance(data.balance);
        setLastUpdate(new Date());
        setError(null);
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ Erreur récupération solde:', err);
      setError(err as Error);
      setLoading(false);
    }
  };

  /**
   * Mettre à jour le solde (ajouter ou soustraire)
   */
  const updateBalance = async (operation: 'add' | 'subtract', amount: number): Promise<boolean> => {
    if (!driverId) return false;

    try {
      const response = await fetch(`${SERVER_URL}/drivers/${driverId}/balance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation,
          amount
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setBalance(data.balance || 0);
        setLastUpdate(new Date());
        console.log(`✅ Solde mis à jour: ${(data.balance || 0).toLocaleString()} CDF`);
        return true;
      }

      return false;
    } catch (err) {
      console.error('❌ Erreur mise à jour solde:', err);
      setError(err as Error);
      return false;
    }
  };

  /**
   * Recharger le solde (alias pour add)
   */
  const rechargeBalance = async (amount: number): Promise<boolean> => {
    return await updateBalance('add', amount);
  };

  /**
   * Débiter le solde (alias pour subtract)
   */
  const debitBalance = async (amount: number): Promise<boolean> => {
    return await updateBalance('subtract', amount);
  };

  /**
   * Forcer une synchronisation immédiate
   */
  const refresh = () => {
    setLoading(true);
    fetchBalance();
  };

  /**
   * Synchronisation automatique toutes les 3 secondes
   */
  useEffect(() => {
    if (!driverId) return;

    // Charger immédiatement
    fetchBalance();

    // Polling toutes les 3 secondes
    const intervalId = setInterval(fetchBalance, 3000);

    // Nettoyer à la désinscription
    return () => {
      clearInterval(intervalId);
    };
  }, [driverId]);

  return {
    balance,
    loading,
    error,
    lastUpdate,
    updateBalance,
    rechargeBalance,
    debitBalance,
    refresh
  };
}