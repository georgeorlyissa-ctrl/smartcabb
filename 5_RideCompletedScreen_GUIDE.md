# GUIDE RideCompletedScreen.tsx - Paiements fonctionnels

## Emplacement: `/components/passenger/RideCompletedScreen.tsx`

## PROBLÈMES À RÉSOUDRE :

1. **Option "Paiement mixte" pas visible**
2. **Boutons ne déclenchent pas de paiement**

---

## SOLUTION 1 : Ajouter "Paiement mixte" dans la liste

### Rechercher la liste des modes de paiement :

```typescript
// Chercher un code similaire à :
const paymentMethods = [
  { id: 'flutterwave', label: 'Mobile Money', icon: Phone },
  { id: 'cash', label: 'Espèces', icon: Wallet },
  { id: 'wallet', label: 'Portefeuille', icon: CreditCard }
];
```

### Ajouter l'option mixte :

```typescript
const paymentMethods = [
  { id: 'flutterwave', label: 'Mobile Money (Flutterwave)', icon: Phone },
  { id: 'cash', label: 'Espèces', icon: Wallet },
  { id: 'mixed', label: 'Paiement mixte', icon: DollarSign }, // ✅ AJOUTER
  { id: 'wallet', label: 'Mon portefeuille', icon: CreditCard }
];
```

---

## SOLUTION 2 : Créer les handlers de paiement

### Handler 1 : Paiement Flutterwave

```typescript
const handlePayWithFlutterwave = async () => {
  try {
    toast.info('Redirection vers Flutterwave...');
    
    // Appeler le backend pour initier le paiement
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/payments/flutterwave/initiate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: finalCost,
          rideId: state.currentRide?.id,
          passengerId: state.currentUser?.id,
          passengerEmail: state.currentUser?.email,
          passengerPhone: state.currentUser?.phone,
          passengerName: state.currentUser?.name
        })
      }
    );
    
    if (!response.ok) {
      throw new Error('Erreur initiation paiement');
    }
    
    const data = await response.json();
    
    if (data.success && data.paymentUrl) {
      // Rediriger vers Flutterwave
      window.location.href = data.paymentUrl;
    } else {
      throw new Error(data.error || 'URL de paiement non reçue');
    }
  } catch (error) {
    console.error('❌ Erreur paiement Flutterwave:', error);
    toast.error('Impossible d\'initier le paiement');
  }
};
```

---

### Handler 2 : Paiement en espèces

```typescript
const handlePayWithCash = async () => {
  try {
    toast.success('Paiement en espèces confirmé');
    
    // Marquer la course comme payée
    if (updateRide && state.currentRide?.id) {
      updateRide(state.currentRide.id, {
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        paidAt: new Date().toISOString()
      });
    }
    
    // Sauvegarder dans le backend
    await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/rides/${state.currentRide?.id}/complete`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethod: 'cash',
          amount: finalCost
        })
      }
    );
    
    // Passer à l'écran d'évaluation
    setCurrentScreen('rating');
  } catch (error) {
    console.error('❌ Erreur paiement cash:', error);
    toast.error('Erreur lors de la confirmation');
  }
};
```

---

### Handler 3 : Paiement mixte

```typescript
const [showMixedModal, setShowMixedModal] = useState(false);
const [cashAmount, setCashAmount] = useState(0);
const [mobileAmount, setMobileAmount] = useState(0);

const handlePayWithMixed = () => {
  // Ouvrir modal pour saisir la répartition
  setShowMixedModal(true);
};

const handleConfirmMixedPayment = async () => {
  if (cashAmount + mobileAmount !== finalCost) {
    toast.error(`Le total doit être égal à ${finalCost.toLocaleString()} CDF`);
    return;
  }
  
  try {
    // 1. Confirmer la partie en espèces
    toast.success(`${cashAmount.toLocaleString()} CDF en espèces confirmé`);
    
    // 2. Initier le paiement Flutterwave pour le reste
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/payments/flutterwave/initiate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: mobileAmount,
          rideId: state.currentRide?.id,
          passengerId: state.currentUser?.id,
          isMixed: true,
          cashPart: cashAmount
        })
      }
    );
    
    if (!response.ok) {
      throw new Error('Erreur paiement mixte');
    }
    
    const data = await response.json();
    
    if (data.success && data.paymentUrl) {
      window.location.href = data.paymentUrl;
    }
  } catch (error) {
    console.error('❌ Erreur paiement mixte:', error);
    toast.error('Erreur lors du paiement mixte');
  }
};

// ✅ MODAL PAIEMENT MIXTE
{showMixedModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <Card className="max-w-md w-full p-6">
      <h3 className="text-lg font-semibold mb-4">Paiement mixte</h3>
      <p className="text-sm text-gray-600 mb-4">
        Total à payer : {finalCost.toLocaleString()} CDF
      </p>
      
      <div className="space-y-4">
        <div>
          <Label>Montant en espèces (CDF)</Label>
          <Input
            type="number"
            value={cashAmount}
            onChange={(e) => {
              const cash = Number(e.target.value);
              setCashAmount(cash);
              setMobileAmount(finalCost - cash);
            }}
            max={finalCost}
            min={0}
          />
        </div>
        
        <div>
          <Label>Montant par Mobile Money (CDF)</Label>
          <Input
            type="number"
            value={mobileAmount}
            disabled
          />
        </div>
      </div>
      
      <div className="flex space-x-3 mt-6">
        <Button
          variant="outline"
          onClick={() => setShowMixedModal(false)}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button
          onClick={handleConfirmMixedPayment}
          className="flex-1"
        >
          Confirmer
        </Button>
      </div>
    </Card>
  </div>
)}
```

---

### Handler 4 : Paiement par portefeuille

```typescript
const handlePayWithWallet = async () => {
  const userBalance = state.currentUser?.balance || 0;
  
  if (userBalance < finalCost) {
    toast.error(
      `Solde insuffisant: ${userBalance.toLocaleString()} CDF (manque ${(finalCost - userBalance).toLocaleString()} CDF)`
    );
    return;
  }
  
  try {
    toast.info('Déduction du solde...');
    
    // Appeler API pour déduire du solde
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/passengers/${state.currentUser?.id}/balance/deduct`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: finalCost,
          rideId: state.currentRide?.id
        })
      }
    );
    
    if (!response.ok) {
      throw new Error('Erreur déduction solde');
    }
    
    const data = await response.json();
    
    if (data.success) {
      toast.success('✅ Paiement réussi !');
      
      // Mettre à jour le solde local
      if (updateUser && state.currentUser) {
        updateUser({
          ...state.currentUser,
          balance: userBalance - finalCost
        });
      }
      
      // Marquer course comme payée
      if (updateRide && state.currentRide?.id) {
        updateRide(state.currentRide.id, {
          paymentStatus: 'paid',
          paymentMethod: 'wallet',
          paidAt: new Date().toISOString()
        });
      }
      
      setCurrentScreen('rating');
    } else {
      throw new Error(data.error || 'Erreur paiement');
    }
  } catch (error) {
    console.error('❌ Erreur paiement portefeuille:', error);
    toast.error('Erreur lors du paiement');
  }
};
```

---

## SOLUTION 3 : Associer les handlers aux boutons

### Rechercher les boutons existants :

```typescript
// Chercher un code similaire :
<Button onClick={() => { /* rien */ }}>
  Payer avec Flutterwave
</Button>
```

### Remplacer par :

```typescript
{paymentMethods.map((method) => (
  <Button
    key={method.id}
    onClick={() => {
      switch (method.id) {
        case 'flutterwave':
          handlePayWithFlutterwave();
          break;
        case 'cash':
          handlePayWithCash();
          break;
        case 'mixed':
          handlePayWithMixed();
          break;
        case 'wallet':
          handlePayWithWallet();
          break;
      }
    }}
    className="w-full h-14"
  >
    <method.icon className="w-5 h-5 mr-2" />
    {method.label}
  </Button>
))}
```

---

## ROUTE BACKEND NÉCESSAIRE

### Créer `/supabase/functions/server/payment-routes.tsx`

```typescript
import { Hono } from 'npm:hono';

const app = new Hono();

// Initier paiement Flutterwave
app.post('/payments/flutterwave/initiate', async (c) => {
  const { amount, rideId, passengerId, passengerEmail, passengerPhone } = await c.req.json();
  
  // Appeler API Flutterwave
  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('FLUTTERWAVE_SECRET_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tx_ref: `ride_${rideId}_${Date.now()}`,
      amount: amount,
      currency: 'CDF',
      redirect_url: `https://smartcabb.com/payment/success`,
      customer: {
        email: passengerEmail,
        phone_number: passengerPhone
      },
      customizations: {
        title: 'SmartCabb',
        description: `Paiement course #${rideId}`
      }
    })
  });
  
  const data = await response.json();
  
  return c.json({
    success: true,
    paymentUrl: data.data.link
  });
});

// Déduire du portefeuille
app.post('/passengers/:id/balance/deduct', async (c) => {
  const passengerId = c.req.param('id');
  const { amount, rideId } = await c.req.json();
  
  // Récupérer solde actuel
  const balance = await kv.get(`passenger_balance_${passengerId}`) || 0;
  
  if (balance < amount) {
    return c.json({ success: false, error: 'Solde insuffisant' }, 400);
  }
  
  // Déduire
  const newBalance = balance - amount;
  await kv.set(`passenger_balance_${passengerId}`, newBalance);
  
  return c.json({
    success: true,
    newBalance
  });
});

export default app;
```

---

## TEST FINAL :

1. **Flutterwave** :
   - Cliquer → Redirection vers page Flutterwave ✅
   
2. **Espèces** :
   - Cliquer → Confirmation + Passage à rating ✅
   
3. **Paiement mixte** :
   - Cliquer → Modal s'ouvre ✅
   - Saisir 5000 cash + 9000 mobile ✅
   - Confirmer → Redirection Flutterwave pour 9000 ✅
   
4. **Portefeuille** :
   - Solde suffisant → Déduction + Passage à rating ✅
   - Solde insuffisant → Erreur affichée ✅

---

## COMMIT MESSAGE :
```
feat(payment): handlers fonctionnels + paiement mixte

- Ajout option "Paiement mixte" dans la liste
- Handler Flutterwave avec redirection
- Handler Cash avec confirmation
- Handler Mixte avec modal de répartition
- Handler Wallet avec déduction solde
- Tous les boutons déclenchent maintenant une action
- Route backend /payments/flutterwave/initiate
```
