
import { Tenant, Room, Payment, DashboardStats } from './types';

// Mock data for tenants
export const tenants: Tenant[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    address: '123 Main St',
    emergencyContact: '234-567-8901',
    dateJoined: '2023-01-15',
    roomId: '1'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '123-456-7891',
    address: '456 Oak St',
    emergencyContact: '234-567-8902',
    dateJoined: '2023-02-10',
    roomId: '2'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '123-456-7892',
    address: '789 Pine St',
    emergencyContact: '234-567-8903',
    dateJoined: '2023-03-05',
    roomId: '3'
  },
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    phone: '123-456-7893',
    address: '101 Elm St',
    emergencyContact: '234-567-8904',
    dateJoined: '2023-04-20',
    roomId: '4'
  },
  {
    id: '5',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    phone: '123-456-7894',
    address: '202 Maple St',
    emergencyContact: '234-567-8905',
    dateJoined: '2023-05-12',
    roomId: '5'
  }
];

// Mock data for rooms
export const rooms: Room[] = [
  {
    id: '1',
    number: '101',
    floor: '1',
    capacity: 1,
    price: 500,
    status: 'occupied',
    amenities: ['Air Conditioning', 'Private Bathroom', 'Desk'],
    tenantIds: ['1']
  },
  {
    id: '2',
    number: '102',
    floor: '1',
    capacity: 1,
    price: 550,
    status: 'occupied',
    amenities: ['Air Conditioning', 'Private Bathroom', 'Desk', 'Mini Fridge'],
    tenantIds: ['2']
  },
  {
    id: '3',
    number: '201',
    floor: '2',
    capacity: 2,
    price: 800,
    status: 'occupied',
    amenities: ['Air Conditioning', 'Shared Bathroom', 'Desk'],
    tenantIds: ['3']
  },
  {
    id: '4',
    number: '202',
    floor: '2',
    capacity: 2,
    price: 850,
    status: 'occupied',
    amenities: ['Air Conditioning', 'Shared Bathroom', 'Desk', 'Mini Fridge'],
    tenantIds: ['4']
  },
  {
    id: '5',
    number: '301',
    floor: '3',
    capacity: 3,
    price: 1200,
    status: 'occupied',
    amenities: ['Air Conditioning', 'Private Bathroom', 'Desk', 'Mini Fridge', 'Balcony'],
    tenantIds: ['5']
  },
  {
    id: '6',
    number: '302',
    floor: '3',
    capacity: 3,
    price: 1250,
    status: 'available',
    amenities: ['Air Conditioning', 'Private Bathroom', 'Desk', 'Mini Fridge', 'Balcony'],
    tenantIds: []
  },
  {
    id: '7',
    number: '401',
    floor: '4',
    capacity: 4,
    price: 1600,
    status: 'available',
    amenities: ['Air Conditioning', 'Private Bathroom', 'Desk', 'Mini Fridge', 'Balcony', 'Kitchenette'],
    tenantIds: []
  }
];

// Mock data for payments
export const payments: Payment[] = [
  {
    id: '1',
    tenantId: '1',
    roomId: '1',
    amount: 500,
    dueDate: '2023-10-01',
    paidDate: '2023-09-29',
    status: 'paid',
    description: 'October 2023 Rent'
  },
  {
    id: '2',
    tenantId: '2',
    roomId: '2',
    amount: 550,
    dueDate: '2023-10-01',
    paidDate: '2023-09-30',
    status: 'paid',
    description: 'October 2023 Rent'
  },
  {
    id: '3',
    tenantId: '3',
    roomId: '3',
    amount: 800,
    dueDate: '2023-10-01',
    status: 'pending',
    description: 'October 2023 Rent'
  },
  {
    id: '4',
    tenantId: '4',
    roomId: '4',
    amount: 850,
    dueDate: '2023-09-01',
    status: 'overdue',
    description: 'September 2023 Rent'
  },
  {
    id: '5',
    tenantId: '5',
    roomId: '5',
    amount: 1200,
    dueDate: '2023-10-01',
    paidDate: '2023-09-28',
    status: 'paid',
    description: 'October 2023 Rent'
  },
  {
    id: '6',
    tenantId: '1',
    roomId: '1',
    amount: 500,
    dueDate: '2023-09-01',
    paidDate: '2023-08-30',
    status: 'paid',
    description: 'September 2023 Rent'
  },
  {
    id: '7',
    tenantId: '2',
    roomId: '2',
    amount: 550,
    dueDate: '2023-09-01',
    paidDate: '2023-08-31',
    status: 'paid',
    description: 'September 2023 Rent'
  }
];

// Mock dashboard stats
export const dashboardStats: DashboardStats = {
  totalTenants: tenants.length,
  availableRooms: rooms.filter(r => r.status === 'available').length,
  occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
  pendingPayments: payments.filter(p => p.status === 'pending').length,
  overduePayments: payments.filter(p => p.status === 'overdue').length,
  totalRevenue: payments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0)
};
