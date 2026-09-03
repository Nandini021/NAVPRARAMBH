import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Explicitly load .env.demo.local
dotenv.config({ path: '.env.demo.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DEMO_EMAIL = 'navprarambh.team@gmail.com';
const DEMO_USER_ID = 'd857322d-58ae-4848-82a3-880cf175f5a7';

console.log('========================================');
console.log('NAVPRARAMBH DEMO PUBLISHER SETUP');
console.log('========================================');

if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL was not loaded from .env.demo.local');
}

if (!SERVICE_ROLE_KEY) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY was not loaded from .env.demo.local'
  );
}

console.log('✓ Environment variables loaded');
console.log(`✓ Supabase URL: ${SUPABASE_URL}`);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('');
console.log('Checking demo Auth user...');

const { data: authData, error: authError } =
  await supabase.auth.admin.getUserById(DEMO_USER_ID);

if (authError) {
  throw new Error(`Auth lookup failed: ${authError.message}`);
}

if (!authData?.user) {
  throw new Error('Demo Auth user was not found.');
}

if (authData.user.email !== DEMO_EMAIL) {
  throw new Error(
    `SAFETY CHECK FAILED: Expected ${DEMO_EMAIL}, but found ${authData.user.email}`
  );
}

console.log(`✓ Auth user verified: ${DEMO_EMAIL}`);
console.log(`✓ User ID verified: ${DEMO_USER_ID}`);

console.log('');
console.log('Checking public profile...');

const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('id, role')
  .eq('id', DEMO_USER_ID)
  .single();

if (profileError) {
  throw new Error(`Profile lookup failed: ${profileError.message}`);
}

if (!profile) {
  throw new Error('No public.profiles row exists for the demo user.');
}

console.log('✓ Profile found');
console.log(`Current role: ${profile.role}`);

if (profile.role === 'admin') {
  console.log('');
  console.log('✓ Demo account is already an admin.');
  console.log('✓ No database change was necessary.');
  console.log('========================================');
  process.exit(0);
}

console.log('');
console.log('Promoting ONLY the demo publisher account to admin...');

const { data: updatedProfile, error: updateError } = await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('id', DEMO_USER_ID)
  .select('id, role')
  .single();

if (updateError) {
  throw new Error(`Role update failed: ${updateError.message}`);
}

if (!updatedProfile) {
  throw new Error('Role update returned no profile.');
}

if (updatedProfile.role !== 'admin') {
  throw new Error(
    `Verification failed. Expected role=admin, got ${updatedProfile.role}`
  );
}

console.log('');
console.log('========================================');
console.log('SUCCESS');
console.log('========================================');
console.log(`Email: ${DEMO_EMAIL}`);
console.log(`User ID: ${DEMO_USER_ID}`);
console.log(`Previous role: ${profile.role}`);
console.log(`New role: ${updatedProfile.role}`);
console.log('');
console.log('Only this demo profile was modified.');
console.log('No RLS policies were changed.');
console.log('No migrations were changed.');
console.log('No triggers were changed.');
console.log('No schema was changed.');
console.log('========================================');