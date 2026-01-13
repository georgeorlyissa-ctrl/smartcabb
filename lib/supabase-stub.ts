/**
 * 🎯 SUPABASE STUB - Client Supabase minimal pour environnement standalone
 * 
 * Ce stub permet au code de fonctionner sans dépendances externes
 * Toutes les opérations retournent des erreurs gracieuses
 */

export interface SupabaseClient {
  auth: any;
  from: (table: string) => any;
  storage: any;
  rpc: (fn: string, params?: any) => Promise<any>;
}

export function createClient(supabaseUrl: string, supabaseKey: string, options?: any): SupabaseClient {
  const mockResponse = {
    data: null,
    error: { message: 'Supabase client stub - backend requis pour fonctionnalités complètes' }
  };

  return {
    auth: {
      getSession: async () => mockResponse,
      getUser: async () => mockResponse,
      signInWithPassword: async () => mockResponse,
      signInWithOAuth: async () => mockResponse,
      signUp: async () => mockResponse,
      signOut: async () => mockResponse,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => mockResponse,
          limit: () => ({ data: [], error: null }),
        }),
        limit: () => ({ data: [], error: null }),
        data: [],
        error: null,
      }),
      insert: async () => mockResponse,
      update: async () => mockResponse,
      delete: async () => mockResponse,
      upsert: async () => mockResponse,
    }),
    storage: {
      from: () => ({
        upload: async () => mockResponse,
        download: async () => mockResponse,
        list: async () => ({ data: [], error: null }),
        createSignedUrl: async () => mockResponse,
      }),
      listBuckets: async () => ({ data: [], error: null }),
      createBucket: async () => mockResponse,
    },
    rpc: async () => mockResponse,
  };
}
