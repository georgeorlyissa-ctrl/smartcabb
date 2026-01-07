import { useAppState } from '../../hooks/useAppState';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
// Import des icônes Lucide React
import { Home, Briefcase, Heart, Star, Plus, Trash2, Edit2, MapPin, Save, X, Navigation } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface FavoriteLocation {
  id?: string;
  user_id?: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  icon: 'home' | 'work' | 'heart' | 'star';
  created_at?: string;
}

interface FavoriteLocationsProps {
  onSelectLocation: (location: { address: string; lat: number; lng: number }) => void;
  currentLocation?: { lat: number; lng: number; address: string } | null;
  className?: string;
}

const iconOptions = [
  { value: 'home' as const, icon: Home, label: 'Domicile', color: 'text-blue-600' },
  { value: 'work' as const, icon: Briefcase, label: 'Travail', color: 'text-purple-600' },
  { value: 'heart' as const, icon: Heart, label: 'Favori', color: 'text-red-600' },
  { value: 'star' as const, icon: Star, label: 'Important', color: 'text-yellow-600' },
];

export function FavoriteLocations({ onSelectLocation, currentLocation, className = "" }: FavoriteLocationsProps) {
  const { state } = useAppState();
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<FavoriteLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🆕 VERSION 2.0 - Log de version pour vérifier le chargement
  useEffect(() => {
    console.log('🚀 FavoriteLocations v2.0 chargé avec succès !');
  }, []);

  const [newFavorite, setNewFavorite] = useState<FavoriteLocation>({
    name: '',
    address: '',
    lat: currentLocation?.lat || -4.3276,
    lng: currentLocation?.lng || 15.3136,
    icon: 'home'
  });

  // 🆕 Charger les favoris depuis le backend KV store
  useEffect(() => {
    loadFavorites();
  }, [state.currentUser]);

  const loadFavorites = async () => {
    if (!state.currentUser?.id) {
      console.log('⚠️ Pas d\'utilisateur connecté, impossible de charger les favoris');
      return;
    }

    try {
      console.log('🔍 Chargement des favoris pour:', state.currentUser.id);
      console.log('🔍 URL:', `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/passengers/${state.currentUser.id}/favorites`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/passengers/${state.currentUser.id}/favorites`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📡 Réponse status:', response.status);
      const data = await response.json();
      console.log('📡 Réponse data:', data);

      if (response.ok) {
        console.log('✅ Favoris chargés:', data);
        
        if (data.success && data.favorites) {
          console.log('✅ Nombre de favoris:', data.favorites.length);
          setFavorites(data.favorites);
        } else {
          console.log('⚠️ Pas de favoris dans la réponse');
          setFavorites([]);
        }
      } else {
        console.error('❌ Erreur chargement favoris:', response.status, data);
        setFavorites([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des favoris:', error);
      setFavorites([]);
    }
  };

  const handleAddFavorite = async () => {
    if (!state.currentUser?.id) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (!newFavorite.name.trim() || !newFavorite.address.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);

    try {
      if (editingFavorite?.id) {
        // 🆕 Mise à jour via API
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/passengers/${state.currentUser.id}/favorites/${editingFavorite.id}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: newFavorite.name,
              address: newFavorite.address,
              lat: newFavorite.lat,
              lng: newFavorite.lng,
              icon: newFavorite.icon
            })
          }
        );

        if (!response.ok) throw new Error('Erreur mise à jour');
        toast.success('Favori mis à jour');
      } else {
        // 🆕 Création via API
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/passengers/${state.currentUser.id}/favorites`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: newFavorite.name,
              address: newFavorite.address,
              lat: newFavorite.lat,
              lng: newFavorite.lng,
              icon: newFavorite.icon
            })
          }
        );

        if (!response.ok) throw new Error('Erreur création');
        toast.success('Favori ajouté');
      }

      await loadFavorites();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFavorite = async (id: string) => {
    if (!confirm('Supprimer ce lieu favori ?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/passengers/${state.currentUser?.id}/favorites/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Erreur suppression');

      toast.success('Favori supprimé');
      await loadFavorites();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEditFavorite = (favorite: FavoriteLocation) => {
    setEditingFavorite(favorite);
    setNewFavorite({
      name: favorite.name,
      address: favorite.address,
      lat: favorite.lat,
      lng: favorite.lng,
      icon: favorite.icon
    });
    setShowAddDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingFavorite(null);
    setNewFavorite({
      name: '',
      address: '',
      lat: currentLocation?.lat || -4.3276,
      lng: currentLocation?.lng || 15.3136,
      icon: 'home'
    });
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      setNewFavorite({
        ...newFavorite,
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        address: currentLocation.address || newFavorite.address
      });
      toast.success('Position actuelle utilisée');
    } else {
      toast.error('Position actuelle non disponible');
    }
  };

  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case 'home':
        return { icon: Home, label: 'Domicile', color: 'text-blue-600' };
      case 'work':
        return { icon: Briefcase, label: 'Travail', color: 'text-purple-600' };
      case 'heart':
        return { icon: Heart, label: 'Favori', color: 'text-red-600' };
      case 'star':
        return { icon: Star, label: 'Important', color: 'text-yellow-600' };
      default:
        // Par défaut, utiliser l'icône Home
        return { icon: Home, label: 'Domicile', color: 'text-blue-600' };
    }
  };

  return (
    <div className={className}>
      {/* Liste des favoris */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm text-gray-600">
            Lieux favoris {favorites.length > 0 && `(${favorites.length})`}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadFavorites}
              className="text-gray-600 hover:text-gray-700"
              title="Recharger les favoris"
            >
              <Navigation className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Aucun lieu favori</p>
            <p className="text-xs mt-1">Ajoutez vos lieux fréquents</p>
          </div>
        ) : (
          <AnimatePresence>
            {favorites.filter(Boolean).map((favorite, index) => {
              // Log pour déboguer
              console.log(`🔍 Rendu favori ${index}:`, favorite);
              
              // Protection: s'assurer que favorite existe
              if (!favorite) {
                console.error('❌ Favori undefined/null:', favorite);
                return null;
              }

              // Utiliser des valeurs par défaut si les propriétés manquent
              const name = favorite.name || 'Sans nom';
              const address = favorite.address || 'Adresse non définie';
              const icon = favorite.icon || 'home';
              const lat = favorite.lat || -4.3276;
              const lng = favorite.lng || 15.3136;

              console.log(`✅ Favori ${index} valide:`, { name, address, icon, lat, lng });

              try {
                const iconData = getIconComponent(icon);
                const IconComponent = iconData.icon;

                return (
                  <motion.button
                    key={favorite.id || `fav-${index}-${Math.random()}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    onClick={() => {
                      console.log('🎯 Favori cliqué:', { address, lat, lng });
                      onSelectLocation({
                        address: address,
                        lat: lat,
                        lng: lng
                      });
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                  >
                    <div className={`p-2 rounded-full bg-gray-100 ${iconData.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-gray-900">{name}</p>
                      <p className="text-xs text-gray-500">{address}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFavorite(favorite);
                        }}
                        className="w-8 h-8"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (favorite.id) handleDeleteFavorite(favorite.id);
                        }}
                        className="w-8 h-8 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.button>
                );
              } catch (error) {
                console.error('❌ Erreur lors du rendu du favori:', error, favorite);
                return null;
              }
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Dialog d'ajout/modification */}
      <Dialog open={showAddDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFavorite ? 'Modifier' : 'Ajouter'} un lieu favori
            </DialogTitle>
            <DialogDescription>
              Enregistrez vos lieux fréquents pour y accéder rapidement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nom du lieu */}
            <div>
              <Label htmlFor="name">Nom du lieu</Label>
              <Input
                id="name"
                placeholder="Ex: Maison, Bureau..."
                value={newFavorite.name}
                onChange={(e) => setNewFavorite({ ...newFavorite, name: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Adresse */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="address">Adresse complète</Label>
                {currentLocation && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleUseCurrentLocation}
                    className="text-xs text-blue-600 hover:text-blue-700 h-6"
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    Position actuelle
                  </Button>
                )}
              </div>
              <Input
                id="address"
                placeholder="Ex: Avenue de la Libération, Gombe"
                value={newFavorite.address}
                onChange={(e) => setNewFavorite({ ...newFavorite, address: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Choix de l'icône */}
            <div>
              <Label>Icône</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {iconOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = newFavorite.icon === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setNewFavorite({ ...newFavorite, icon: option.value })}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className={`w-6 h-6 ${option.color}`} />
                      <span className="text-xs text-gray-600">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddFavorite}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Enregistrement...' : editingFavorite ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
