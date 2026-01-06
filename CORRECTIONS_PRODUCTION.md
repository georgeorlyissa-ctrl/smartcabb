# 🔧 CORRECTIONS POUR PRODUCTION - SmartCabb

## ✅ Fichiers déjà corrigés

### 1. DriverFoundScreen.tsx ✅
- ✅ Chargement des **vraies données** du chauffeur depuis le backend
- ✅ Photo du chauffeur (avec fallback sur icône User)
- ✅ Nombre de courses réel (pas simulé)
- ✅ Bouton WhatsApp ouvre directement la conversation
- ✅ Polling pour détecter la confirmation du code SMS par le conducteur

**Route backend requise** :
```
GET /make-server-2eb02e52/drivers/:driverId
```

### 2. LiveTrackingMap.tsx ✅
- ✅ Carte OpenStreetMap en temps réel
- ✅ Polling toutes les 3 secondes de la position du conducteur
- ✅ 3 marqueurs : Départ (vert), Destination (rouge), Chauffeur (bleu animé)
- ✅ Auto-centrage sur le conducteur pendant la course
- ✅ Boutons Téléphone + WhatsApp directement sur la carte

**Route backend requise** :
```
GET /make-server-2eb02e52/drivers/location/:driverId
Response: { location: { lat: number, lng: number } }
```

### 3. LiveTrackingScreen.tsx ✅
- ✅ Polling pour détecter quand le conducteur clôture la course
- ✅ Navigation automatique vers PaymentScreen quand `status === 'completed'`

**Route backend requise** :
```
GET /make-server-2eb02e52/rides/status/:rideId
Response: { ride: { status: 'completed', finalPrice: number, completedAt: string } }
```

### 4. PaymentScreen.tsx ✅
- ✅ Polling pour attendre la confirmation du conducteur
- ✅ Navigation vers RatingScreen (pas directement historique)
- ✅ Flux complet : Paiement → Attente confirmation → RatingScreen → Historique

**Routes backend requises** :
```
POST /make-server-2eb02e52/rides/:rideId/pay
GET /make-server-2eb02e52/rides/payment-status/:rideId
```

### 5. RatingScreen.tsx ✅
- ✅ Envoi de la note + commentaire au backend
- ✅ Backend recalcule la moyenne du chauffeur
- ✅ Backend incrémente total_rides

**Route backend requise** :
```
POST /make-server-2eb02e52/rides/:rideId/rate
```

---

## ⚠️ Fichiers à corriger

**AUCUN !** Tous les fichiers sont maintenant corrigés ✅

---

## 🚀 Routes backend à créer/vérifier

### Dans `/supabase/functions/server/index.tsx`

```typescript
// ========================================
// ROUTES CONDUCTEURS
// ========================================

// 1. Obtenir les détails d'un conducteur
app.get('/make-server-2eb02e52/drivers/:driverId', async (c) => {
  const driverId = c.req.param('driverId');
  const driver = await kv.get(`driver:${driverId}`);
  
  if (!driver) {
    return c.json({ error: 'Conducteur introuvable' }, 404);
  }
  
  return c.json({ driver });
});

// 2. Obtenir la position en temps réel d'un conducteur
app.get('/make-server-2eb02e52/drivers/location/:driverId', async (c) => {
  const driverId = c.req.param('driverId');
  const location = await kv.get(`driver:${driverId}:location`);
  
  return c.json({ location: location || null });
});

// ========================================
// ROUTES COURSES
// ========================================

// 3. Obtenir le statut d'une course
app.get('/make-server-2eb02e52/rides/status/:rideId', async (c) => {
  const rideId = c.req.param('rideId');
  const ride = await kv.get(`ride:${rideId}`);
  
  return c.json({ ride: ride || null });
});

// 4. Payer une course
app.post('/make-server-2eb02e52/rides/:rideId/pay', async (c) => {
  const rideId = c.req.param('rideId');
  const { method, amount } = await c.req.json();
  
  const ride = await kv.get(`ride:${rideId}`);
  if (!ride) {
    return c.json({ error: 'Course introuvable' }, 404);
  }
  
  // Traiter le paiement selon la méthode
  const paymentId = `pay_${Date.now()}`;
  
  await kv.set(`ride:${rideId}`, {
    ...ride,
    paymentId,
    paymentMethod: method,
    paymentAmount: amount,
    paymentStatus: 'pending_confirmation',
    paymentConfirmed: false,
    paidAt: new Date().toISOString()
  });
  
  return c.json({ success: true, paymentId });
});

// 5. Vérifier si le paiement est confirmé par le conducteur
app.get('/make-server-2eb02e52/rides/payment-status/:rideId', async (c) => {
  const rideId = c.req.param('rideId');
  const ride = await kv.get(`ride:${rideId}`);
  
  if (!ride) {
    return c.json({ error: 'Course introuvable' }, 404);
  }
  
  return c.json({ 
    confirmed: ride.paymentConfirmed || false,
    confirmedAt: ride.paymentConfirmedAt || null
  });
});

// 6. Conducteur confirme la réception du paiement
app.post('/make-server-2eb02e52/rides/:rideId/confirm-payment', async (c) => {
  const rideId = c.req.param('rideId');
  const ride = await kv.get(`ride:${rideId}`);
  
  if (!ride) {
    return c.json({ error: 'Course introuvable' }, 404);
  }
  
  await kv.set(`ride:${rideId}`, {
    ...ride,
    paymentConfirmed: true,
    paymentStatus: 'confirmed',
    paymentConfirmedAt: new Date().toISOString()
  });
  
  return c.json({ success: true });
});

// 7. Noter une course
app.post('/make-server-2eb02e52/rides/:rideId/rate', async (c) => {
  const rideId = c.req.param('rideId');
  const { rating, comment } = await c.req.json();
  
  const ride = await kv.get(`ride:${rideId}`);
  if (!ride) {
    return c.json({ error: 'Course introuvable' }, 404);
  }
  
  // Enregistrer la note
  await kv.set(`ride:${rideId}`, {
    ...ride,
    rating,
    comment: comment || null,
    ratedAt: new Date().toISOString()
  });
  
  // Mettre à jour les stats du conducteur
  const driverId = ride.driverId;
  const driver = await kv.get(`driver:${driverId}`);
  
  if (driver) {
    // Récupérer toutes les courses du conducteur pour recalculer la moyenne
    const allRidesKeys = await kv.getByPrefix(`ride:`);
    const driverRides = allRidesKeys.filter((r: any) => r.driverId === driverId && r.rating);
    
    const totalRating = driverRides.reduce((sum: number, r: any) => sum + r.rating, 0);
    const avgRating = totalRating / driverRides.length;
    
    await kv.set(`driver:${driverId}`, {
      ...driver,
      rating: avgRating,
      total_rides: driverRides.length
    });
  }
  
  return c.json({ success: true });
});
```

---

## 📋 Checklist finale

### Backend (serveur)
- [ ] Route GET `/drivers/:driverId` retourne photo_url, total_rides, rating
- [ ] Route GET `/drivers/location/:driverId` retourne position temps réel
- [ ] Route GET `/rides/status/:rideId` retourne statut + finalPrice
- [ ] Route POST `/rides/:rideId/pay` enregistre le paiement
- [ ] Route GET `/rides/payment-status/:rideId` retourne si confirmé
- [ ] Route POST `/rides/:rideId/confirm-payment` (pour conducteur)
- [ ] Route POST `/rides/:rideId/rate` enregistre note + recalcule moyenne

### Frontend (passager)
- [x] DriverFoundScreen charge données réelles
- [x] DriverFoundScreen affiche photo chauffeur
- [x] LiveTrackingMap polling position conducteur
- [x] PaymentScreen polling confirmation conducteur
- [x] PaymentScreen navigation automatique vers RatingScreen
- [x] RatingScreen envoie au backend

### Frontend (conducteur)
- [ ] Bouton "Confirmer réception paiement" appelle `/confirm-payment`
- [ ] Mise à jour position GPS temps réel vers `/drivers/location/:driverId`

---

## 🎯 Prochaines étapes

1. **Vérifier les routes backend** dans `/supabase/functions/server/index.tsx`
2. **Tester le flux complet** : Réservation → Code → Course → Paiement → Confirmation → Note