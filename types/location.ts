/**
 * Types géographiques partagés pour SmartCabb
 */
/**
 * Types géographiques partagés pour SmartCabb
 */

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  accuracy?: number;
}

export interface Driver {
  id: string;
  name: string;
  location: Location;
  vehicleInfo?: {
    make: string;
    color: string;
  };
  rating?: number;
}

export interface Position {
  lat: number;
  lng: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
}

export interface NavigationStep {
  instruction: string;
  distance: string;
  duration: string;
}
