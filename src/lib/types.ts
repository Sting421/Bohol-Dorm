
export type Database = {
  rooms: Room;
  tenants: Tenant;
  payments: Payment;
  dorm: Dorm;
};

export type Dorm = {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  longitude: string;
  latitude: string;
  contacts: string;
  created_at: string;
  updated_at: string;
};

export type Room = {
  id: string;
  dorm_id: string;
  room_number: string;
  capacity: number;
  rent_amount: number;
  images: string[];
  created_at: string;
  updated_at: string;
  tenants?: Tenant[];
};

export type Tenant = {
  id: string;
  user_id: string;
  room_id: string;
  full_name: string;
  email: string;
  move_in_date: string;
  created_at: string;
  updated_at: string;
  room?: Room;
};

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface GoogleUser {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  provider: string;
}

export type Payment = {
  id: string;
  tenant_id: string;
  amount: number;
  payment_date: string;
  status: PaymentStatus;
  description?: string;
  created_at: string;
  updated_at: string;
  tenant?: {
    id: string;
    full_name: string;
    room?: {
      room_number: string;
    };
  };
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
