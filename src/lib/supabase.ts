import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Direct values (temporarily for testing)
const supabaseUrl = 'https://rfbngcyvdzrrebyudawo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmYm5nY3l2ZHpycmVieXVkYXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzI4NjgsImV4cCI6MjA4MDE0ODg2OH0.0CeeJt_9UD_R96vy2rhI-uhWH7dGa2IesSaB1YbiLmU';

// Validate
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing!');
  throw new Error('Supabase credentials are required');
}

console.log('✅ Supabase URL:', supabaseUrl.substring(0, 30) + '...');
console.log('✅ Supabase Key:', supabaseAnonKey.substring(0, 10) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to get current user with profile
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // Get user profile from our users table
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};