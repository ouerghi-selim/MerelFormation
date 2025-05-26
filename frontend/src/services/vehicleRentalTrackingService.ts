import api from './api';

export interface VehicleRentalTracking {
  id: number;
  trackingToken: string;
  vehicle: {
    model: string;
    plate: string;
    category: string;
  };
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isExamRental: boolean;
  examDate?: string;
  notes?: string;
  adminNotes?: string;
  statusHistory: StatusHistoryItem[];
}

export interface StatusHistoryItem {
  status: string;
  label: string;
  date: string;
  description: string;
}

export const trackRental = async (trackingToken: string): Promise<VehicleRentalTracking> => {
  const response = await api.get(`/vehicle-rental-tracking/${trackingToken}`);
  return response.data;
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusText = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending': return 'En attente';
    case 'confirmed': return 'Confirmée';
    case 'cancelled': return 'Annulée';
    case 'completed': return 'Terminée';
    default: return status;
  }
};

export const getStatusIcon = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending': return '⏳';
    case 'confirmed': return '✅';
    case 'cancelled': return '❌';
    case 'completed': return '🏁';
    default: return '📋';
  }
};

export const generateTrackingUrl = (trackingToken: string): string => {
  return `${window.location.origin}/track/${trackingToken}`;
};