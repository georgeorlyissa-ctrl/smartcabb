/**
 * Hook React pour gérer les paiements
 * Simplifie l'utilisation du service de paiement dans les composants
 */

import { useState, useCallback, useEffect } from 'react';
import type { PaymentInitData, PaymentResult, PaymentMethod } from '../lib/payment-providers/base-provider';
import { toast } from 'sonner';

export function usePayment() {
}