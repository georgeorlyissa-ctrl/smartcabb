package cd.smartcabb.app.data.remote

/**
 * Configuration Supabase pour SmartCabb Android
 * 
 * IMPORTANT : Remplacez ces valeurs avec vos vraies clés Supabase
 * Elles doivent correspondre à celles utilisées dans votre app web
 */
object SupabaseConfig {
    
    // ============================================================================
    // CONFIGURATION SUPABASE (À REMPLACER)
    // ============================================================================
    
    /**
     * URL de votre projet Supabase
     * Format : https://xxxxx.supabase.co
     */
    const val SUPABASE_URL = "https://votre-project-id.supabase.co"
    
    /**
     * Clé anonyme publique Supabase
     * Visible dans : Settings → API → anon public
     */
    const val SUPABASE_ANON_KEY = "votre-anon-key-ici"
    
    /**
     * URL du serveur Edge Function
     * Format : https://xxxxx.supabase.co/functions/v1/make-server-2eb02e52
     */
    const val SERVER_BASE_URL = "https://votre-project-id.supabase.co/functions/v1/make-server-2eb02e52"
    
    // ============================================================================
    // ENDPOINTS API (correspondent à votre backend web)
    // ============================================================================
    
    object Endpoints {
        // Auth
        const val LOGIN = "/auth/login"
        const val REGISTER = "/auth/register"
        const val LOGOUT = "/auth/logout"
        
        // Passenger
        const val CREATE_RIDE = "/passenger/create-ride"
        const val CANCEL_RIDE = "/passenger/cancel-ride"
        const val RATE_DRIVER = "/passenger/rate-driver"
        const val GET_RIDE_HISTORY = "/passenger/ride-history"
        
        // Driver
        const val ACCEPT_RIDE = "/driver/accept-ride"
        const val START_RIDE = "/driver/start-ride"
        const val COMPLETE_RIDE = "/driver/complete-ride"
        const val UPDATE_LOCATION = "/driver/update-location"
        const val GET_EARNINGS = "/driver/earnings"
        
        // Wallet
        const val GET_BALANCE = "/wallet/balance"
        const val RECHARGE = "/wallet/recharge"
        const val GET_TRANSACTIONS = "/wallet/transactions"
        
        // Rides
        const val GET_RIDE_DETAILS = "/rides/details"
        const val GET_ACTIVE_RIDES = "/rides/active"
        
        // Settings
        const val GET_SETTINGS = "/settings/get"
        const val UPDATE_PROFILE = "/settings/update-profile"
    }
    
    // ============================================================================
    // CONFIGURATION RÉSEAUX
    // ============================================================================
    
    const val NETWORK_TIMEOUT = 30L // secondes
    const val CONNECT_TIMEOUT = 15L // secondes
    const val READ_TIMEOUT = 30L // secondes
    
    // ============================================================================
    // CLÉS LOCALES (SharedPreferences / DataStore)
    // ============================================================================
    
    object Keys {
        const val PREF_NAME = "smartcabb_prefs"
        const val USER_ID = "user_id"
        const val USER_TYPE = "user_type" // "passenger" | "driver" | "admin"
        const val ACCESS_TOKEN = "access_token"
        const val USER_EMAIL = "user_email"
        const val USER_NAME = "user_name"
        const val USER_PHONE = "user_phone"
        const val IS_LOGGED_IN = "is_logged_in"
    }
    
    // ============================================================================
    // TYPES D'UTILISATEURS
    // ============================================================================
    
    object UserTypes {
        const val PASSENGER = "passenger"
        const val DRIVER = "driver"
        const val ADMIN = "admin"
    }
    
    // ============================================================================
    // CATÉGORIES DE VÉHICULES (correspondent au backend)
    // ============================================================================
    
    object VehicleCategories {
        const val SMART_STANDARD = "smart_standard"
        const val SMART_CONFORT = "smart_confort"
        const val SMART_XL = "smart_xl"
        const val SMART_VAN = "smart_van"
        const val SMART_PREMIUM = "smart_premium"
    }
    
    // ============================================================================
    // STATUTS DE COURSE (correspondent au backend)
    // ============================================================================
    
    object RideStatus {
        const val PENDING = "pending"          // En attente de conducteur
        const val ACCEPTED = "accepted"        // Conducteur accepté
        const val IN_PROGRESS = "in_progress"  // Course en cours
        const val COMPLETED = "completed"      // Terminée
        const val CANCELLED = "cancelled"      // Annulée
    }
    
    // ============================================================================
    // MÉTHODES DE PAIEMENT (correspondent au backend)
    // ============================================================================
    
    object PaymentMethods {
        const val CASH = "cash"
        const val WALLET = "wallet"
        const val MOBILE_MONEY = "mobile_money"
        const val MIXED = "mixed" // Combinaison wallet + cash
    }
    
    // ============================================================================
    // CONFIGURATION GPS
    // ============================================================================
    
    object GPS {
        const val UPDATE_INTERVAL = 5000L // 5 secondes
        const val FASTEST_INTERVAL = 3000L // 3 secondes
        const val DISPLACEMENT = 10f // 10 mètres
    }
    
    // ============================================================================
    // CONFIGURATION NOTIFICATIONS
    // ============================================================================
    
    object Notifications {
        const val CHANNEL_ID = "smartcabb_channel"
        const val CHANNEL_NAME = "SmartCabb Notifications"
        const val RIDE_REQUEST_ID = 1001
        const val RIDE_UPDATE_ID = 1002
        const val LOCATION_SERVICE_ID = 2001
    }
    
    // ============================================================================
    // RDC SPECIFIQUE
    // ============================================================================
    
    object RDC {
        const val CURRENCY = "CDF"
        const val CURRENCY_SYMBOL = "FC"
        const val PHONE_PREFIX = "+243"
        
        // Kinshasa coordinates (centre ville)
        const val DEFAULT_LATITUDE = -4.3276
        const val DEFAULT_LONGITUDE = 15.3136
        const val DEFAULT_ZOOM = 12f
    }
}

/**
 * Headers HTTP pour toutes les requêtes
 */
object ApiHeaders {
    const val AUTHORIZATION = "Authorization"
    const val CONTENT_TYPE = "Content-Type"
    const val CONTENT_TYPE_JSON = "application/json"
    
    fun authHeader(token: String) = "Bearer $token"
}
