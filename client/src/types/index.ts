export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phoneNumber: string;
  status: "available" | "on_trip" | "inactive";
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  capacity: number;
  driverId?: string | null;
  status: "idle" | "on_trip" | "maintenance";
}

export interface Mill {
  id: string;
  name: string;
  location: { lat: number; lng: number } | string;
  contactPerson: string;
  phoneNumber: string;
  avgDailyProduction: number;
}

export interface Collection {
  id: string;
  tripId: string;
  millId: string;
  collected: number;
  mill?: Mill;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  scheduledDate: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  estimatedDuration: number;
  collections?: Collection[];
}

export interface TripWithDetails extends Trip {
  vehicle?: Vehicle;
  driver?: Driver;
}
