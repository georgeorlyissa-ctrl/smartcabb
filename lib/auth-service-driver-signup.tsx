/**
 * 🚗 SERVICE D'INSCRIPTION CONDUCTEUR
 * 
 * Service pour l'inscription des conducteurs avec documents
 * 
 * @version 1.0.0
 * @date 2026-02-05
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52`;

export interface DriverSignUpData {
  // Informations personnelles
  fullName: string;
  email: string;
  phone: string;
  password: string;
  
  // Informations du véhicule
  vehicleType: 'economique' | 'confort' | 'premium' | 'van';
  licensePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  
  // Documents (optionnels selon l'implémentation)
  driverLicense?: string;
  vehicleRegistration?: string;
  insurance?: string;
  profilePhoto?: string;
}

/**
 * Inscription d'un nouveau conducteur
 */
export async function signUpDriver(driverData: DriverSignUpData) {
  try {
    console.log('🚗 Inscription conducteur...', driverData.email);
    
    // 1. Créer le compte utilisateur
    const registerResponse = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: driverData.email,
        password: driverData.password,
        full_name: driverData.fullName,
        phone: driverData.phone,
        role: 'driver'
      })
    });

    const registerResult = await registerResponse.json();

    if (!registerResult.success) {
      console.error('❌ Erreur création compte:', registerResult.error);
      return registerResult;
    }

    console.log('✅ Compte créé:', registerResult.profile.id);

    // 2. Créer le profil conducteur avec véhicule
    const driverProfileResponse = await fetch(`${API_BASE}/drivers/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: registerResult.profile.id,
        vehicleType: driverData.vehicleType,
        licensePlate: driverData.licensePlate,
        vehicleBrand: driverData.vehicleBrand,
        vehicleModel: driverData.vehicleModel,
        vehicleYear: driverData.vehicleYear,
        vehicleColor: driverData.vehicleColor,
        // Documents optionnels
        documents: {
          driverLicense: driverData.driverLicense,
          vehicleRegistration: driverData.vehicleRegistration,
          insurance: driverData.insurance,
          profilePhoto: driverData.profilePhoto
        }
      })
    });

    const driverProfileResult = await driverProfileResponse.json();

    if (!driverProfileResult.success) {
      console.error('❌ Erreur création profil conducteur:', driverProfileResult.error);
      return {
        success: false,
        error: driverProfileResult.error || 'Erreur lors de la création du profil conducteur'
      };
    }

    console.log('✅ Profil conducteur créé');

    return {
      success: true,
      profile: registerResult.profile,
      driver: driverProfileResult.driver,
      message: 'Inscription réussie ! Votre compte est en attente de validation.'
    };

  } catch (error) {
    console.error('❌ Erreur signUpDriver:', error);
    return {
      success: false,
      error: 'Erreur lors de l\'inscription. Vérifiez votre connexion Internet.'
    };
  }
}

export default signUpDriver;
