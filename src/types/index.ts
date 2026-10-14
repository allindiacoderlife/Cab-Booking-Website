export type UserRole = "RIDER" | "DRIVER" | "ADMIN";

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface PaymentMethodItem {
  id: string;
  type: "card" | "paypal" | "apple_pay" | "cash";
  last4?: string;
  brand?: string;
  expiry?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  avatarUrl: string;
  createdAt: string;
  emergencyContact?: EmergencyContact;
  paymentMethods: PaymentMethodItem[];
  rating: number;
  totalRides: number;
}

export type VehicleCategory = "Standard" | "Comfort" | "XL" | "Black";

export interface DriverVehicle {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  category: VehicleCategory;
}

export interface DriverProfile {
  id: string;
  userId: string;
  vehicle: DriverVehicle;
  isOnline: boolean;
  currentLat: number;
  currentLng: number;
  acceptanceRate: number; // e.g. 96%
  rating: number; // e.g. 4.92
  totalEarningsToday: number;
  completedTripsToday: number;
  onlineHoursToday: number;
}

export type RideStatus =
  | "IDLE"
  | "REQUESTED"
  | "ACCEPTED"
  | "ARRIVING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface RideLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  pickup: RideLocation;
  dropoff: RideLocation;
  stops?: RideLocation[];
  status: RideStatus;
  fare: number;
  distanceKm: number;
  estimatedMinutes: number;
  createdAt: string;
  vehicleCategory: VehicleCategory;
  promoCode?: string;
  discountAmount?: number;
}
