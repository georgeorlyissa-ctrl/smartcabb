import { Card } from '../ui/card';
import { toast } from 'sonner';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

/**
 * 🔄 Outil de migration des courses entre deux passengerIds
 * Permet de corriger les courses qui ont été créées avec un mauvais ID
 */
export function RideMigrationTool() {
  const [oldId, setOldId] = useState('');
  const [newId, setNewId] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigrate = async () => {
    if (!oldId.trim() || !newId.trim()) {
      toast.error('Veuillez remplir les deux IDs');
      return;
    }

    if (oldId === newId) {
      toast.error('Les deux IDs doivent être différents');
      return;
    }

    setIsMigrating(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/passengers/${newId}/migrate-rides/${oldId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(`✅ ${data.migrated} courses migrées avec succès !`);
        setOldId('');
        setNewId('');
      } else {
        toast.error(`❌ Erreur: ${data.error || 'Migration échouée'}`);
      }
    } catch (error: any) {
      console.error('❌ Erreur migration:', error);
      toast.error('Erreur lors de la migration');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">🔄 Migration de courses</h3>
          <p className="text-sm text-muted-foreground">
            Transférer toutes les courses d'un ancien ID passager vers un nouvel ID
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="oldId">Ancien ID passager (source)</Label>
            <Input
              id="oldId"
              value={oldId}
              onChange={(e) => setOldId(e.target.value)}
              placeholder="uuid-ancien-id"
              className="mt-1 font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
          </div>

          <div>
            <Label htmlFor="newId">Nouvel ID passager (destination)</Label>
            <Input
              id="newId"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="uuid-nouveau-id"
              className="mt-1 font-mono text-sm"
            />
          </div>

          <Button
            onClick={handleMigrate}
            disabled={isMigrating || !oldId.trim() || !newId.trim()}
            className="w-full"
          >
            {isMigrating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Migration en cours...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Migrer les courses
              </>
            )}
          </Button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Attention :</strong> Cette opération est irréversible. 
            Assurez-vous que les IDs sont corrects avant de lancer la migration.
          </p>
        </div>
      </div>
    </Card>
  );
}