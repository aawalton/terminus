import supabase from '@terminus/supabase';

const USER_ID = 'f5f446d8-95c7-469d-ab38-ce379926ff26';

export async function getTotalXp() {
  const { data, error } = await supabase
    .schema('status')
    .from('experience')
    .select('amount')
    .eq('user_id', USER_ID)
    .is('deleted_at', null);

  if (error) {
    throw new Error(`Failed to fetch total XP: ${error.message}`);
  }

  return data.reduce((total, exp) => total + exp.amount, 0);
} 