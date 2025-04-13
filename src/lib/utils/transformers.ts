import type { Room, RoomFromDatabase, Tenant, TenantFromDatabase, Payment, PaymentFromDatabase } from '../types'
import { mapDatabaseStatusToFrontend, mapFrontendStatusToDatabase } from './payment'

export function transformRoomFromDatabase(room: RoomFromDatabase): Room {
  return {
    ...room,
    number: room.room_number,
    price: room.rent_amount,
    status: 'available', // This should be computed based on tenants
  }
}

export function transformRoomToDatabase(room: Room): Partial<RoomFromDatabase> {
  return {
    id: room.id,
    dorm_id: room.dorm_id,
    room_number: room.number,
    rent_amount: room.price,
    capacity: room.capacity,
    images: room.images || [],
  }
}

export function transformTenantFromDatabase(tenant: TenantFromDatabase): Tenant {
  return {
    ...tenant,
    name: tenant.full_name,
    roomId: tenant.room_id,
    dateJoined: tenant.move_in_date,
  }
}

export function transformTenantToDatabase(tenant: Tenant): Partial<TenantFromDatabase> {
  return {
    id: tenant.id,
    user_id: tenant.user_id,
    room_id: tenant.roomId,
    full_name: tenant.name,
    email: tenant.email,
    move_in_date: tenant.dateJoined,
  }
}

export function transformPaymentFromDatabase(payment: PaymentFromDatabase): Payment {
  return {
    ...payment,
    tenantId: payment.tenant_id,
    status: mapDatabaseStatusToFrontend(payment.status),
  }
}

export function transformPaymentToDatabase(payment: Payment): Partial<PaymentFromDatabase> {
  return {
    id: payment.id,
    tenant_id: payment.tenantId,
    amount: payment.amount,
    payment_date: payment.payment_date,
    status: mapFrontendStatusToDatabase(payment.status),
    description: payment.description || null,
  }
}
