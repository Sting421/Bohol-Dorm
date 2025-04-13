import { createClient } from '@supabase/supabase-js'
import type { Database, Room } from './types'

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

export const getRooms = async () => {
  const { data, error } = await supabase.from('rooms').select();
  if (error) throw error;
  return data;
};

export const updateRoom = async (id: string, updates: Partial<Room>) => {
  const { data, error } = await supabase.from('rooms').update(updates).eq('id', id).select();
  if (error) throw error;
  return data;
};

export const deleteRoom = async (id: string) => {
  const { data, error } = await supabase.from('rooms').delete().eq('id', id).select();
  if (error) throw error;
  return data;
};
