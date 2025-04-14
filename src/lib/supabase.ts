import { createClient } from '@supabase/supabase-js'
import type { Database, Room, GoogleUser } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)

export default supabase

export const getDormsForCurrentUser = async () => {
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.session?.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('dorm')
    .select('*')
    .eq('owner_id', session.session.user.id);

  if (error) {
    console.error('Error fetching dorms:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

// CRUD operations for rooms
export const createRoom = async (room: Omit<Room, 'id'>) => {
  const { data, error } = await supabase.from('rooms').insert(room).select();
  if (error) throw error;
  return data;
};

export const getRoomsWithTenants = async () => {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) throw new Error('User not authenticated');

  const userId = session.session.user.id;

  // Get dorm for current user
  const { data: dorms } = await supabase
    .from('dorm')
    .select('id')
    .eq('owner_id', userId)
    .single();

  if (!dorms?.id) throw new Error('No dorm found');

  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      tenants (
        id,
        full_name,
        email,
        move_in_date
      )
    `)
    .eq('dorm_id', dorms.id)
    .order('room_number');

  if (error) throw error;
  return data;
};

export const getRooms = async () => {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) throw new Error('User not authenticated');

  const userId = session.session.user.id;

  // Get dorm for current user
  const { data: dorms } = await supabase
    .from('dorm')
    .select('id')
    .eq('owner_id', userId)
    .single();

  if (!dorms?.id) throw new Error('No dorm found');

  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      tenants (
        id,
        full_name,
        email,
        move_in_date
      )
    `)
    .eq('dorm_id', dorms.id)
    .order('room_number');

  if (error) throw error;
  return data;
};

export const updateRoom = async (id: string, updates: Partial<Room>) => {
  const { data, error } = await supabase
    .from('rooms')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      tenants (
        id,
        full_name,
        email,
        move_in_date
      )
    `);
  if (error) throw error;
  return data;
};

export const deleteRoom = async (id: string) => {
  const { data, error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id)
    .select(`
      *,
      tenants (
        id,
        full_name,
        email,
        move_in_date
      )
    `);
  if (error) throw error;
  return data;
};

export const getDashboardStats = async () => {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) throw new Error('User not authenticated');

  const userId = session.session.user.id;

  // Get dorm for current user
  const { data: dorms } = await supabase
    .from('dorm')
    .select('id')
    .eq('owner_id', userId)
    .single();

  if (!dorms?.id) throw new Error('No dorm found');

  // Get rooms with tenants for the dorm
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select(`
      *,
      tenants(*)
    `)
    .eq('dorm_id', dorms.id);

  if (roomsError) throw roomsError;

  // Get all payments
  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*');

  if (paymentsError) throw paymentsError;

  const totalTenants = rooms?.reduce((sum, room) => sum + (room.tenants?.length || 0), 0) || 0;
  const occupiedRooms = rooms?.filter(room => room.tenants && room.tenants.length > 0).length || 0;
  const totalRevenue = payments
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return {
    totalTenants,
    availableRooms: (rooms?.length || 0) - occupiedRooms,
    occupiedRooms,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    overduePayments: payments.filter(p => p.status === 'failed').length,
    totalRevenue: payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0)
  };
};

export const getRecentPayments = async () => {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) throw new Error('User not authenticated');

  const userId = session.session.user.id;

  // Get dorm for current user
  const { data: dorms } = await supabase
    .from('dorm')
    .select('id')
    .eq('owner_id', userId)
    .single();

  if (!dorms?.id) throw new Error('No dorm found');

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      tenant!tenant_id (
        id,
        full_name,
        room:room_id (
          room_number
        )
      )
    `)
    .order('payment_date', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data;
};

export const getAvailableTenants = async (): Promise<GoogleUser[]> => {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) throw new Error('User not authenticated');

  const userId = session.session.user.id;

  // Get dorm for current user
  const { data: dorms } = await supabase
    .from('dorm')
    .select('id')
    .eq('owner_id', userId)
    .single();

  if (!dorms?.id) throw new Error('No dorm found');

  // Get users who authenticated with Google and don't have room assignments
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      created_at,
      provider
    `)
    .eq('provider', 'google')
    .not('id', 'in', (
      supabase
        .from('tenants')
        .select('user_id')
    ));

  if (error) throw error;
  return data;
};

export const assignTenantToRoom = async (userId: string, roomId: string) => {
  // First create a tenant record for the Google user
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      user_id: userId,
      room_id: roomId,
      full_name: (await supabase.from('users').select('full_name').eq('id', userId).single()).data?.full_name,
      email: (await supabase.from('users').select('email').eq('id', userId).single()).data?.email,
      move_in_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (tenantError) throw tenantError;
  return tenant;
};

export const removeTenantFromRoom = async (tenantId: string) => {
  const { data, error } = await supabase
    .from('tenants')
    .update({ room_id: null })
    .eq('id', tenantId)
    .select();

  if (error) throw error;
  return data;
};

export const getUpcomingPayments = async () => {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) throw new Error('User not authenticated');

  const userId = session.session.user.id;

  // Get dorm for current user
  const { data: dorms } = await supabase
    .from('dorm')
    .select('id')
    .eq('owner_id', userId)
    .single();

  if (!dorms?.id) throw new Error('No dorm found');

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      tenant!tenant_id (
        id,
        full_name,
        room:room_id (
          room_number
        )
      )
    `)
    .neq('status', 'completed')
    .order('payment_date', { ascending: true })
    .limit(5);

  if (error) throw error;
  return data;
};
