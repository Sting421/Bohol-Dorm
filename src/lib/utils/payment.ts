import { DatabasePaymentStatus, FrontendPaymentStatus, PaymentFromDatabase, PaymentBase } from '../types'
import { supabase } from '../supabase'

// Database interaction functions
export async function getPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('payment_date', { ascending: false })

  if (error) throw error
  return data
}

export async function getPayment(id: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createPayment(payment: Omit<PaymentBase, 'id'>) {
  const { data, error } = await supabase
    .from('payments')
    .insert([
      {
        tenant_id: payment.tenantId,
        amount: payment.amount,
        payment_date: payment.payment_date,
        status: mapFrontendStatusToDatabase(payment.status),
        description: payment.description
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePaymentStatus(id: string, status: FrontendPaymentStatus) {
  const { data, error } = await supabase
    .from('payments')
    .update({ status: mapFrontendStatusToDatabase(status) })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Status mapping functions

export function mapDatabaseStatusToFrontend(status: DatabasePaymentStatus): FrontendPaymentStatus {
  switch (status) {
    case 'completed':
      return 'paid'
    case 'failed':
      return 'failed'
    case 'pending':
      return 'pending'
    default:
      return 'pending'
  }
}

export function mapFrontendStatusToDatabase(status: FrontendPaymentStatus): DatabasePaymentStatus {
  switch (status) {
    case 'paid':
      return 'completed'
    case 'failed':
      return 'failed'
    case 'overdue':
      return 'pending'
    case 'pending':
      return 'pending'
    default:
      return 'pending'
  }
}
