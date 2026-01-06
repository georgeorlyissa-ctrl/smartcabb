package cd.smartcabb.app.data.local

import android.content.Context
import android.content.SharedPreferences
import cd.smartcabb.app.data.remote.SupabaseConfig

/**
 * Gestionnaire de préférences locales
 * Stocke les données utilisateur de manière sécurisée
 */
class PreferencesManager(context: Context) {
    
    private val prefs: SharedPreferences = context.getSharedPreferences(
        SupabaseConfig.Keys.PREF_NAME,
        Context.MODE_PRIVATE
    )
    
    // ============================================================================
    // AUTHENTICATION
    // ============================================================================
    
    fun saveLoginData(
        userId: String,
        accessToken: String,
        email: String,
        name: String,
        phone: String,
        userType: String
    ) {
        prefs.edit().apply {
            putString(SupabaseConfig.Keys.USER_ID, userId)
            putString(SupabaseConfig.Keys.ACCESS_TOKEN, accessToken)
            putString(SupabaseConfig.Keys.USER_EMAIL, email)
            putString(SupabaseConfig.Keys.USER_NAME, name)
            putString(SupabaseConfig.Keys.USER_PHONE, phone)
            putString(SupabaseConfig.Keys.USER_TYPE, userType)
            putBoolean(SupabaseConfig.Keys.IS_LOGGED_IN, true)
            apply()
        }
    }
    
    fun logout() {
        prefs.edit().clear().apply()
    }
    
    fun isLoggedIn(): Boolean {
        return prefs.getBoolean(SupabaseConfig.Keys.IS_LOGGED_IN, false)
    }
    
    // ============================================================================
    // GETTERS
    // ============================================================================
    
    fun getUserId(): String? {
        return prefs.getString(SupabaseConfig.Keys.USER_ID, null)
    }
    
    fun getAccessToken(): String? {
        return prefs.getString(SupabaseConfig.Keys.ACCESS_TOKEN, null)
    }
    
    fun getAuthHeader(): String {
        val token = getAccessToken() ?: ""
        return "Bearer $token"
    }
    
    fun getUserEmail(): String? {
        return prefs.getString(SupabaseConfig.Keys.USER_EMAIL, null)
    }
    
    fun getUserName(): String? {
        return prefs.getString(SupabaseConfig.Keys.USER_NAME, null)
    }
    
    fun getUserPhone(): String? {
        return prefs.getString(SupabaseConfig.Keys.USER_PHONE, null)
    }
    
    fun getUserType(): String? {
        return prefs.getString(SupabaseConfig.Keys.USER_TYPE, null)
    }
    
    // ============================================================================
    // HELPERS
    // ============================================================================
    
    fun isPassenger(): Boolean {
        return getUserType() == SupabaseConfig.UserTypes.PASSENGER
    }
    
    fun isDriver(): Boolean {
        return getUserType() == SupabaseConfig.UserTypes.DRIVER
    }
    
    fun isAdmin(): Boolean {
        return getUserType() == SupabaseConfig.UserTypes.ADMIN
    }
}
