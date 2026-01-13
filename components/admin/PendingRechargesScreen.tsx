import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, User, DollarSign, Phone } from '../../lib/icons';

export function PendingRechargesScreen() {
  const { setCurrentScreen, state, updateUser } = useAppState();
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction & { user: UserType } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Pour forcer le re-render
}