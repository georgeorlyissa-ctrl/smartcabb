import { motion } from '../framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
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