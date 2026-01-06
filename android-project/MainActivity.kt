package cd.smartcabb.app.ui.main

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import cd.smartcabb.app.R
import cd.smartcabb.app.data.local.PreferencesManager
import cd.smartcabb.app.ui.auth.LoginActivity
import cd.smartcabb.app.ui.passenger.PassengerMainActivity
import cd.smartcabb.app.ui.driver.DriverMainActivity
import cd.smartcabb.app.ui.admin.AdminDashboardActivity

/**
 * MainActivity - Écran de choix Passager/Conducteur/Admin
 * 
 * Premier écran après le splash si l'utilisateur n'est pas connecté
 */
class MainActivity : AppCompatActivity() {
    
    private lateinit var prefsManager: PreferencesManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        prefsManager = PreferencesManager(this)
        
        // Vérifier si l'utilisateur est déjà connecté
        if (prefsManager.isLoggedIn()) {
            // Rediriger vers l'interface appropriée
            navigateToUserInterface()
            finish()
            return
        }
        
        setContentView(R.layout.activity_main)
        
        setupUI()
    }
    
    private fun setupUI() {
        findViewById<Button>(R.id.btnPassenger).setOnClickListener {
            navigateToLogin("passenger")
        }
        
        findViewById<Button>(R.id.btnDriver).setOnClickListener {
            navigateToLogin("driver")
        }
        
        findViewById<Button>(R.id.btnAdmin).setOnClickListener {
            navigateToLogin("admin")
        }
    }
    
    private fun navigateToLogin(userType: String) {
        val intent = Intent(this, LoginActivity::class.java).apply {
            putExtra("USER_TYPE", userType)
        }
        startActivity(intent)
    }
    
    private fun navigateToUserInterface() {
        val userType = prefsManager.getUserType()
        val intent = when (userType) {
            "passenger" -> Intent(this, PassengerMainActivity::class.java)
            "driver" -> Intent(this, DriverMainActivity::class.java)
            "admin" -> Intent(this, AdminDashboardActivity::class.java)
            else -> {
                // Type inconnu, déconnecter
                prefsManager.logout()
                return
            }
        }
        startActivity(intent)
    }
}
