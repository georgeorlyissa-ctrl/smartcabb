import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card } from './ui/card';
import { Shield, X } from '../lib/icons';
import { UnifiedPolicyModal } from './shared/UnifiedPolicyModal';
import { memo } from 'react';

interface PolicyModalProps {
  isOpen: boolean;
  onAccept: () => void;
  showCloseButton?: boolean;
  userType?: 'passenger' | 'driver';
}

/**
 * @deprecated Utilisez UnifiedPolicyModal à la place
 * Ce composant est conservé pour compatibilité descendante
 */
export const PolicyModal = memo(function PolicyModal({ 
  isOpen, 
  onAccept, 
  showCloseButton = false,
  userType = 'passenger'
}: PolicyModalProps) {
  return (
    <UnifiedPolicyModal
      isOpen={isOpen}
      onAccept={onAccept}
      showCloseButton={showCloseButton}
      mode="both"
      userType={userType}
    />
  );
});