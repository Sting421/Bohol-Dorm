
// Tenant types
export type Tenant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  dateJoined: string;
  roomId?: string;
};

// Room types
export type RoomStatus = 'available' | 'occupied';

export type Room = {
  id: string;
  number: string;
  floor: string;
  capacity: number;
  price: number;
  status: RoomStatus;
  amenities: string[];
  tenantIds: string[];
};

// Payment types
export type PaymentStatus = 'pending' | 'paid' | 'overdue';

export type Payment = {
  id: string;
  tenantId: string;
  roomId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  description: string;
};

// Dashboard types
export type DashboardStats = {
  totalTenants: number;
  availableRooms: number;
  occupiedRooms: number;
  pendingPayments: number;
  overduePayments: number;
  totalRevenue: number;
};
