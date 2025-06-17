export type BikeStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';

export interface Bike {
  id: string;
  bikeNumber: string;
  model: string;
  status: BikeStatus;
  currentLocation: {
    lat: number;
    lng: number;
  } | null;
}

export interface Rental {
  id: string;
  startTime: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  bike: Bike;
  distance: number | null;
  carbonSaved: number | null;
  pdfUrl: string | null;
}

export interface MapProps {
  bikes: Bike[];
  selectedBike: Bike | null;
  onBikeSelect: (bike: Bike | null) => void;
} 