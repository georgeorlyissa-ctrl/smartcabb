# 📱 SmartCabb Android - Guide d'Installation

## 🎯 RÉSUMÉ

Vous avez maintenant les **fichiers de base** pour créer l'application Android SmartCabb !

---

## 📋 CHECKLIST AVANT DE COMMENCER

- [ ] Android Studio téléchargé et installé
- [ ] Samsung A14 disponible
- [ ] Câble USB pour connecter le téléphone
- [ ] Clés Supabase (URL, ANON_KEY) prêtes

---

## 🚀 ÉTAPE 1 : CRÉER LE PROJET DANS ANDROID STUDIO

### **1.1 Lancer Android Studio**

```
1. Ouvrez Android Studio
2. Cliquez sur "New Project"
3. Sélectionnez "Empty Activity"
4. Cliquez "Next"
```

### **1.2 Configuration du projet**

```
Name: SmartCabb
Package name: cd.smartcabb.app
Save location: C:\Users\VotreNom\AndroidStudioProjects\SmartCabb
Language: Kotlin
Minimum SDK: API 24 (Android 7.0)
Build configuration language: Kotlin DSL (build.gradle.kts)
```

### **1.3 Cliquez sur "Finish"**

Android Studio va créer le projet (2-3 minutes).

---

## 📂 ÉTAPE 2 : COPIER LES FICHIERS

### **2.1 Structure du projet Android Studio**

Votre projet aura cette structure :

```
SmartCabb/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/cd/smartcabb/app/     ← COPIEZ LES .kt ICI
│   │   │   ├── res/                       ← Layouts XML
│   │   │   └── AndroidManifest.xml        ← REMPLACEZ
│   │   └── test/
│   └── build.gradle.kts                   ← REMPLACEZ
├── gradle/
└── build.gradle.kts (Project)
```

### **2.2 Copier les fichiers depuis Figma Make**

#### **a) build.gradle.kts (Module: app)**

```
1. Ouvrez le fichier dans Android Studio :
   app/build.gradle.kts

2. Remplacez TOUT le contenu par le fichier :
   /android-project/build.gradle.kts

3. Cliquez sur "Sync Now" en haut
   (Gradle va télécharger les dépendances - 5-10 min)
```

#### **b) AndroidManifest.xml**

```
1. Ouvrez le fichier :
   app/src/main/AndroidManifest.xml

2. Remplacez TOUT le contenu par :
   /android-project/AndroidManifest.xml
```

#### **c) Fichiers Kotlin**

Créez les dossiers et copiez les fichiers :

```
app/src/main/java/cd/smartcabb/app/
├── data/
│   ├── local/
│   │   └── PreferencesManager.kt       ← /android-project/PreferencesManager.kt
│   └── remote/
│       ├── SupabaseConfig.kt           ← /android-project/SupabaseConfig.kt
│       └── ApiService.kt               ← /android-project/ApiService.kt
└── ui/
    └── main/
        └── MainActivity.kt              ← /android-project/MainActivity.kt
```

**IMPORTANT :** Vérifiez que les `package` en haut de chaque fichier correspondent :

```kotlin
package cd.smartcabb.app.data.remote  // Doit correspondre au dossier
```

---

## 🔑 ÉTAPE 3 : CONFIGURER SUPABASE

### **3.1 Ouvrir SupabaseConfig.kt**

```kotlin
// Remplacez ces valeurs par vos vraies clés :

const val SUPABASE_URL = "https://VOTRE-PROJECT-ID.supabase.co"
const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
const val SERVER_BASE_URL = "https://VOTRE-PROJECT-ID.supabase.co/functions/v1/make-server-2eb02e52"
```

### **3.2 Où trouver ces valeurs ?**

**Option A : Depuis votre app web**

Ouvrez `/utils/supabase/info.tsx` dans votre projet web :

```typescript
export const projectId = 'xxxxx';
export const publicAnonKey = 'eyJhbGci...';
```

**Option B : Depuis Supabase Dashboard**

```
1. Allez sur https://supabase.com
2. Sélectionnez votre projet
3. Settings → API
4. Copiez "Project URL" et "anon public"
```

---

## 📲 ÉTAPE 4 : CONFIGURER VOTRE SAMSUNG A14

### **4.1 Activer le mode développeur**

```
1. Ouvrez "Paramètres" sur votre Samsung A14
2. Allez dans "À propos du téléphone"
3. Tapotez 7 fois sur "Numéro de build"
4. Message : "Vous êtes maintenant développeur"
```

### **4.2 Activer le débogage USB**

```
1. Revenez dans "Paramètres"
2. Allez dans "Options de développeur"
3. Activez "Débogage USB"
4. Activez "Installer via USB" (si disponible)
```

### **4.3 Connecter le téléphone**

```
1. Branchez votre Samsung A14 en USB
2. Sur le téléphone : popup "Autoriser débogage USB ?"
3. Cochez "Toujours autoriser depuis cet ordinateur"
4. Tapez "OK"
```

### **4.4 Vérifier dans Android Studio**

```
1. Dans Android Studio, cliquez sur le menu déroulant en haut
2. Vous devriez voir "Samsung SM-A145F" (ou similaire)
3. Si vous ne le voyez pas :
   - Débranchez et rebranchez le câble
   - Changez le mode USB en "Transfert de fichiers"
```

---

## 🎨 ÉTAPE 5 : CRÉER LES LAYOUTS XML

### **5.1 Layout principal (activity_main.xml)**

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#F5F5F5"
    android:padding="24dp">

    <ImageView
        android:id="@+id/logo"
        android:layout_width="120dp"
        android:layout_height="120dp"
        android:src="@mipmap/ic_launcher"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginTop="80dp" />

    <TextView
        android:id="@+id/title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="SmartCabb"
        android:textSize="32sp"
        android:textStyle="bold"
        android:textColor="#000000"
        app:layout_constraintTop_toBottomOf="@id/logo"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginTop="24dp" />

    <TextView
        android:id="@+id/subtitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Transport intelligent en RDC"
        android:textSize="16sp"
        android:textColor="#666666"
        app:layout_constraintTop_toBottomOf="@id/title"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginTop="8dp" />

    <Button
        android:id="@+id/btnPassenger"
        android:layout_width="0dp"
        android:layout_height="60dp"
        android:text="Je suis Passager"
        android:textSize="18sp"
        android:textAllCaps="false"
        app:layout_constraintTop_toBottomOf="@id/subtitle"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginTop="80dp" />

    <Button
        android:id="@+id/btnDriver"
        android:layout_width="0dp"
        android:layout_height="60dp"
        android:text="Je suis Conducteur"
        android:textSize="18sp"
        android:textAllCaps="false"
        app:layout_constraintTop_toBottomOf="@id/btnPassenger"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginTop="16dp" />

    <Button
        android:id="@+id/btnAdmin"
        android:layout_width="0dp"
        android:layout_height="60dp"
        android:text="Administration"
        android:textSize="18sp"
        android:textAllCaps="false"
        style="@style/Widget.Material3.Button.OutlinedButton"
        app:layout_constraintTop_toBottomOf="@id/btnDriver"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginTop="16dp" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

**SAUVEGARDEZ** dans `app/src/main/res/layout/activity_main.xml`

---

## ▶️ ÉTAPE 6 : TESTER L'APPLICATION

### **6.1 Build & Run**

```
1. Vérifiez que votre Samsung A14 est sélectionné en haut
2. Cliquez sur le bouton ▶️ "Run" (ou Shift+F10)
3. Attendez la compilation (2-3 min la première fois)
4. L'app s'installe automatiquement sur votre téléphone
5. L'app se lance !
```

### **6.2 Ce que vous devriez voir**

```
╔══════════════════════════════════╗
║         [Logo SmartCabb]         ║
║                                  ║
║          SmartCabb               ║
║  Transport intelligent en RDC    ║
║                                  ║
║   [Je suis Passager]            ║
║   [Je suis Conducteur]          ║
║   [Administration]              ║
║                                  ║
╚══════════════════════════════════╝
```

---

## 🎉 BRAVO ! VOUS AVEZ LA BASE !

### **📊 Ce qui fonctionne déjà :**

- ✅ Projet Android configuré
- ✅ Connexion API Supabase prête
- ✅ Structure de données (models)
- ✅ Écran principal
- ✅ Navigation entre écrans
- ✅ Stockage local (SharedPreferences)

### **📝 Ce qu'il reste à faire (prochaines étapes) :**

- [ ] Écrans Login/Register
- [ ] Interface Passager (carte, réservation)
- [ ] Interface Conducteur (accepter courses, GPS)
- [ ] Google Maps intégration
- [ ] Notifications push
- [ ] Paiements
- [ ] Tests complets

---

## 🚀 PROCHAINE SESSION

**JOUR 2 : Authentification**
- Créer LoginActivity
- Créer RegisterActivity
- Intégrer Supabase Auth
- Tester login/logout

---

## 📞 BESOIN D'AIDE ?

Si vous avez des erreurs :

1. **Gradle sync failed** : Vérifiez votre connexion Internet
2. **Package name mismatch** : Vérifiez les `package` en haut des fichiers
3. **Téléphone non détecté** : Vérifiez le câble USB et le mode de connexion
4. **Build failed** : Partagez l'erreur exacte

---

## 🎯 TIMING

| Étape | Durée estimée |
|-------|---------------|
| Créer projet | 5 min |
| Copier fichiers | 10 min |
| Gradle sync | 10 min |
| Configurer Samsung A14 | 5 min |
| Créer layouts | 10 min |
| Premier build & test | 10 min |
| **TOTAL** | **~50 min** |

**Il vous reste ~4h pour continuer ! On peut faire toute l'authentification aujourd'hui ! 🚀**
