package cd.smartcabb.app.data.remote

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

/**
 * Service API Retrofit pour SmartCabb
 * Communique avec le backend Supabase Edge Functions
 */
interface ApiService {
    
    // ============================================================================
    // AUTHENTICATION
    // ============================================================================
    
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): ApiResponse<LoginResponse>
    
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): ApiResponse<RegisterResponse>
    
    @POST("auth/logout")
    suspend fun logout(@Header("Authorization") token: String): ApiResponse<Unit>
    
    // ============================================================================
    // PASSENGER - RIDES
    // ============================================================================
    
    @POST("passenger/create-ride")
    suspend fun createRide(
        @Header("Authorization") token: String,
        @Body request: CreateRideRequest
    ): ApiResponse<RideResponse>
    
    @POST("passenger/cancel-ride")
    suspend fun cancelRide(
        @Header("Authorization") token: String,
        @Body request: CancelRideRequest
    ): ApiResponse<Unit>
    
    @POST("passenger/rate-driver")
    suspend fun rateDriver(
        @Header("Authorization") token: String,
        @Body request: RateDriverRequest
    ): ApiResponse<Unit>
    
    @GET("passenger/ride-history")
    suspend fun getRideHistory(
        @Header("Authorization") token: String,
        @Query("limit") limit: Int = 50
    ): ApiResponse<List<RideResponse>>
    
    // ============================================================================
    // DRIVER - RIDES
    // ============================================================================
    
    @POST("driver/accept-ride")
    suspend fun acceptRide(
        @Header("Authorization") token: String,
        @Body request: AcceptRideRequest
    ): ApiResponse<RideResponse>
    
    @POST("driver/start-ride")
    suspend fun startRide(
        @Header("Authorization") token: String,
        @Body request: StartRideRequest
    ): ApiResponse<RideResponse>
    
    @POST("driver/complete-ride")
    suspend fun completeRide(
        @Header("Authorization") token: String,
        @Body request: CompleteRideRequest
    ): ApiResponse<RideResponse>
    
    @POST("driver/update-location")
    suspend fun updateLocation(
        @Header("Authorization") token: String,
        @Body request: UpdateLocationRequest
    ): ApiResponse<Unit>
    
    @GET("driver/earnings")
    suspend fun getEarnings(
        @Header("Authorization") token: String,
        @Query("period") period: String = "today"
    ): ApiResponse<EarningsResponse>
    
    // ============================================================================
    // WALLET
    // ============================================================================
    
    @GET("wallet/balance")
    suspend fun getWalletBalance(
        @Header("Authorization") token: String
    ): ApiResponse<WalletBalanceResponse>
    
    @POST("wallet/recharge")
    suspend fun rechargeWallet(
        @Header("Authorization") token: String,
        @Body request: RechargeRequest
    ): ApiResponse<RechargeResponse>
    
    @GET("wallet/transactions")
    suspend fun getTransactions(
        @Header("Authorization") token: String,
        @Query("limit") limit: Int = 50
    ): ApiResponse<List<TransactionResponse>>
    
    // ============================================================================
    // RIDES
    // ============================================================================
    
    @GET("rides/details/{rideId}")
    suspend fun getRideDetails(
        @Header("Authorization") token: String,
        @Path("rideId") rideId: String
    ): ApiResponse<RideResponse>
    
    @GET("rides/active")
    suspend fun getActiveRides(
        @Header("Authorization") token: String
    ): ApiResponse<List<RideResponse>>
    
    // ============================================================================
    // SETTINGS
    // ============================================================================
    
    @GET("settings/get")
    suspend fun getSettings(): ApiResponse<SettingsResponse>
    
    @POST("settings/update-profile")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @Body request: UpdateProfileRequest
    ): ApiResponse<ProfileResponse>
}

// ============================================================================
// RETROFIT CLIENT SINGLETON
// ============================================================================

object RetrofitClient {
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val client = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .addInterceptor { chain ->
            val request = chain.request().newBuilder()
                .addHeader("Content-Type", "application/json")
                .build()
            chain.proceed(request)
        }
        .connectTimeout(SupabaseConfig.CONNECT_TIMEOUT, TimeUnit.SECONDS)
        .readTimeout(SupabaseConfig.READ_TIMEOUT, TimeUnit.SECONDS)
        .writeTimeout(SupabaseConfig.NETWORK_TIMEOUT, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(SupabaseConfig.SERVER_BASE_URL)
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val apiService: ApiService = retrofit.create(ApiService::class.java)
}

// ============================================================================
// DATA MODELS (Request & Response)
// ============================================================================

// Generic API Response
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val error: String? = null,
    val message: String? = null
)

// Auth
data class LoginRequest(
    val email: String,
    val password: String,
    val userType: String // "passenger" | "driver" | "admin"
)

data class LoginResponse(
    val userId: String,
    val accessToken: String,
    val email: String,
    val name: String,
    val userType: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val name: String,
    val phone: String,
    val userType: String
)

data class RegisterResponse(
    val userId: String,
    val accessToken: String,
    val email: String,
    val name: String
)

// Rides
data class CreateRideRequest(
    val pickupAddress: String,
    val pickupLat: Double,
    val pickupLng: Double,
    val dropoffAddress: String,
    val dropoffLat: Double,
    val dropoffLng: Double,
    val category: String,
    val paymentMethod: String,
    val passengers: Int = 1
)

data class CancelRideRequest(
    val rideId: String,
    val reason: String
)

data class AcceptRideRequest(
    val rideId: String
)

data class StartRideRequest(
    val rideId: String,
    val confirmationCode: String
)

data class CompleteRideRequest(
    val rideId: String,
    val endLat: Double,
    val endLng: Double
)

data class RateDriverRequest(
    val rideId: String,
    val rating: Int,
    val comment: String?
)

data class UpdateLocationRequest(
    val lat: Double,
    val lng: Double,
    val heading: Float? = null,
    val speed: Float? = null
)

data class RideResponse(
    val id: String,
    val status: String,
    val pickupAddress: String,
    val pickupLat: Double,
    val pickupLng: Double,
    val dropoffAddress: String,
    val dropoffLat: Double,
    val dropoffLng: Double,
    val estimatedPrice: Double,
    val finalPrice: Double?,
    val distance: Double,
    val duration: Int,
    val category: String,
    val passengerId: String,
    val passengerName: String,
    val passengerPhone: String,
    val driverId: String?,
    val driverName: String?,
    val driverPhone: String?,
    val driverLat: Double?,
    val driverLng: Double?,
    val vehicleModel: String?,
    val vehiclePlate: String?,
    val confirmationCode: String?,
    val createdAt: String,
    val startedAt: String?,
    val completedAt: String?
)

// Wallet
data class WalletBalanceResponse(
    val balance: Double,
    val currency: String = "CDF"
)

data class RechargeRequest(
    val amount: Double,
    val method: String,
    val phoneNumber: String?
)

data class RechargeResponse(
    val transactionId: String,
    val status: String,
    val newBalance: Double
)

data class TransactionResponse(
    val id: String,
    val type: String,
    val amount: Double,
    val status: String,
    val description: String,
    val createdAt: String
)

// Earnings
data class EarningsResponse(
    val today: Double,
    val week: Double,
    val month: Double,
    val total: Double,
    val ridesCount: Int,
    val currency: String = "CDF"
)

// Settings
data class SettingsResponse(
    val baseFare: Double,
    val pricePerKm: Double,
    val pricePerMinute: Double,
    val commission: Double
)

data class UpdateProfileRequest(
    val name: String?,
    val phone: String?,
    val email: String?
)

data class ProfileResponse(
    val id: String,
    val name: String,
    val email: String,
    val phone: String,
    val userType: String,
    val walletBalance: Double
)
