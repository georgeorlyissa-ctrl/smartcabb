// Utiliser notre stub local au lieu de @supabase/supabase-js pour éviter les erreurs CDN
import { createClient } from './supabase-stub';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Ré-exporter createClient pour compatibilité
export { createClient };

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

// Lazy initialization pour éviter les appels automatiques au chargement
let supabaseClient: any = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    try {
      // Initialisation silencieuse - pas de logs en mode normal
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        },
        global: {
          fetch: async (url: RequestInfo | URL, options?: RequestInit) => {
            try {
              // PAS DE TIMEOUT - Laisser le fetch natif gérer
              const response = await window.fetch(url, {
                ...options
              });
              
              return response;
            } catch (error: any) {
              // Si c'est une erreur de réseau, la gérer silencieusement
              if (error.message === 'Failed to fetch' || error.message?.includes('network')) {
                // Retourner une réponse vide pour éviter de casser l'app
                return new Response(JSON.stringify({ data: null, error: { message: 'Network error' } }), {
                  status: 500,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              
              // Pour les autres erreurs, logger en debug uniquement
              console.debug('Supabase fetch error:', error.message);
              throw error;
            }
          }
        }
      });
    } catch (error) {
      console.debug('Supabase client initialization failed:', error);
      supabaseClient = null;
    }
  }
  return supabaseClient;
}

export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      // Retourner un objet qui simule l'API Supabase mais ne fait rien
      // Silencieux - pas de warning si le client n'est pas disponible
      return () => ({
        data: null,
        error: { message: 'Supabase non configuré' }
      });
    }
    return client[prop];
  }
});

// ============================================
// TYPES DE BASE DE DONNÉES
// ============================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  wallet_balance?: number;
  role: 'passenger' | 'driver' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  user_id: string;
  license_number?: string;
  status: 'pending' | 'approved' | 'rejected';
  rating: number;
  total_rides: number;
  total_earnings?: number;
  is_available: boolean;
  current_lat?: number;
  current_lng?: number;
  vehicle_id?: string;
  created_at: string;
  updated_at?: string;
  // Champs ajoutés par le KV store
  full_name?: string;
  email?: string;
  phone?: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
    category: string;
    seats: number;
  };
}

export interface Vehicle {
  id: string;
  driver_id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  category: 'standard' | 'comfort' | 'luxury';
  seats: number;
  created_at: string;
  updated_at?: string;
}

export interface Ride {
  id: string;
  passenger_id: string;
  driver_id?: string;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  status: 'pending' | 'accepted' | 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  duration_minutes: number;
  distance_km?: number;
  vehicle_category?: string;
  payment_method?: string;
  payment_status?: string;
  created_at: string;
  updated_at?: string;
}

export interface Document {
  id: string;
  driver_id: string;
  document_type: string;
  document_url: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

export interface Rating {
  id: string;
  ride_id: string;
  driver_id: string;
  passenger_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_active: boolean;
  expiry_date?: string;
  max_uses?: number;
  current_uses: number;
  created_at: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  ride_id?: string;
  amount: number;
  type: 'payment' | 'refund' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  payment_method?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at?: string;
}