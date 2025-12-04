import { Hono } from 'npm:hono';

const testRoutes = new Hono();

// ============================================
// ENDPOINT DE TEST - Envoyer un SMS réel
// ============================================
testRoutes.post('/send', async (c) => {
  try {
    const { phoneNumber } = await c.req.json();
    
    if (!phoneNumber) {
      return c.json({ 
        success: false, 
        error: 'Numéro de téléphone requis' 
      }, 400);
    }

    console.log('🧪 TEST ENVOI SMS à:', phoneNumber);

    // Récupérer les credentials
    const username = Deno.env.get('AFRICAS_TALKING_USERNAME') ?? '';
    const apiKey = Deno.env.get('AFRICAS_TALKING_API_KEY') ?? '';

    console.log('🔑 Username présent:', !!username);
    console.log('🔑 Username value:', username || 'VIDE');
    console.log('🔑 API Key présente:', !!apiKey);
    console.log('🔑 API Key length:', apiKey?.length || 0);

    // Si credentials manquantes, mode DEBUG
    if (!username || !apiKey) {
      const testCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('⚠️ MODE DEBUG - Code généré:', testCode);
      
      return c.json({
        success: false,
        debugMode: true,
        debugOtpCode: testCode,
        error: 'Credentials Africa\'s Talking manquantes',
        config: {
          username_present: !!username,
          api_key_present: !!apiKey,
          username_value: username || 'EMPTY',
          api_key_length: apiKey?.length || 0
        }
      });
    }

    // Envoyer le SMS réel
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    const message = `SmartCabb - Votre code de test est : ${testCode}`;

    console.log('📤 Envoi du SMS via Africa\'s Talking...');
    console.log('📱 Numéro:', phoneNumber);
    console.log('📝 Message:', message);

    try {
      const smsResponse = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': apiKey
        },
        body: new URLSearchParams({
          username: username,
          to: phoneNumber,
          message: message
        }).toString()
      });

      const smsResult = await smsResponse.json();
      
      console.log('📊 Réponse Africa\'s Talking:', JSON.stringify(smsResult, null, 2));

      // Vérifier le statut de la réponse
      const recipients = smsResult.SMSMessageData?.Recipients || [];
      const status = recipients[0]?.status || 'Unknown';
      const messageId = recipients[0]?.messageId || null;

      if (status === 'Success' || smsResult.SMSMessageData?.Message === 'Sent') {
        console.log('✅ SMS envoyé avec succès !');
        return c.json({
          success: true,
          smsResult: {
            status: status,
            messageId: messageId,
            phoneNumber: phoneNumber,
            testCode: testCode
          },
          rawResponse: smsResult
        });
      } else {
        console.error('❌ Échec envoi SMS:', status);
        return c.json({ 
          success: false, 
          error: 'Échec de l\'envoi du SMS',
          testCode: testCode,
          smsDetails: {
            status: status || 'Unknown',
            messageId: messageId,
            phoneNumber: phoneNumber
          },
          rawResponse: smsResult
        }, 500);
      }

    } catch (smsError) {
      console.error('❌ Erreur lors de l\'appel API:', smsError);
      return c.json({ 
        success: false, 
        error: 'Erreur lors de l\'appel à Africa\'s Talking: ' + String(smsError),
        testCode: testCode
      }, 500);
    }

  } catch (error) {
    console.error('❌ Erreur test-sms-send:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur: ' + String(error) 
    }, 500);
  }
});

export { testRoutes };
