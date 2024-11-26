import supabase from '@terminus/supabase';

export async function getUserByEmail(email) {
  const { data: user, error } = await supabase
    .schema('auth')
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (error) {
    throw new Error(`Failed to fetch user by email "${email}": ${error.message}`);
  }

  if (!user) {
    throw new Error(`User with email "${email}" not found`);
  }

  return user.id;
} 