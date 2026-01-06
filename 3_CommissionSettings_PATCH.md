# PATCH CommissionSettings.tsx - Auto-refresh

## Emplacement: `/components/CommissionSettings.tsx`

## Ligne à modifier: 42-50

### AVANT :
```typescript
  useEffect(() => {
    // Charger les paramètres depuis le backend au démarrage
    loadSettings();
    
    // ✅ NOUVEAU : Charger les commissions réelles pour le conducteur
    if (userType === 'driver' && driverId) {
      loadDriverCommissions();
    }
  }, [userType, driverId]);
```

### APRÈS (✅ AVEC AUTO-REFRESH) :
```typescript
  useEffect(() => {
    // Charger les paramètres depuis le backend au démarrage
    loadSettings();
    
    // ✅ CORRECTION : Charger les commissions réelles pour le conducteur avec auto-refresh
    if (userType === 'driver' && driverId) {
      loadDriverCommissions();
      
      // ✅ NOUVEAU : Rafraîchir toutes les 10 secondes
      const intervalId = setInterval(loadDriverCommissions, 10000);
      
      return () => clearInterval(intervalId);
    }
  }, [userType, driverId]);
```

## Résultat :
- ✅ Les commissions se rafraîchissent automatiquement toutes les 10 secondes
- ✅ Plus besoin de rafraîchir manuellement la page
- ✅ Les valeurs "Aujourd'hui" et "Cette semaine" sont toujours à jour

## Test :
1. Conducteur termine une course
2. Attendre 10 secondes
3. Cliquer sur "Commissions" dans le Dashboard
4. ✅ Les nouvelles valeurs apparaissent automatiquement
