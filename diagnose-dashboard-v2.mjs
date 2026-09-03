/**
 * Improved Dashboard Diagnostic
 * Better error handling and multiple query attempts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const env = {};
  for (const fileName of ['.env.local', '.env']) {
    const filePath = path.join(__dirname, fileName);
    if (!fs.existsSync(filePath)) continue;
    for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*["']?([^"']*)["']?\s*$/);
      if (match && !env[match[1]]) env[match[1]] = match[2].trim();
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== NAVPRARAMBH Dashboard Diagnostic (v2) ===\n');
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Supabase Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT FOUND'}\n`);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

async function testSimpleQuery(tableName) {
  try {
    const url = `${supabaseUrl}/rest/v1/${tableName}?select=id`;
    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Accept': 'application/vnd.pgrst.object+json',
      },
    });

    const body = await response.text();
    return { status: response.status, body };
  } catch (err) {
    return { error: err.message };
  }
}

async function testWithAuth() {
  try {
    const url = `${supabaseUrl}/auth/v1/user`;
    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    const body = await response.text();
    return { status: response.status, authenticated: response.ok, body: body.substring(0, 100) };
  } catch (err) {
    return { error: err.message };
  }
}

async function diagnose() {
  console.log('Step 1: Test Authentication\n');
  const authTest = await testWithAuth();
  console.log(`Auth endpoint: HTTP ${authTest.status} - ${authTest.authenticated ? 'Authenticated' : 'Not authenticated'}`);
  if (authTest.error) console.log(`Error: ${authTest.error}`);
  console.log(`Response preview: ${authTest.body}\n`);

  console.log('Step 2: Test Simple Table Queries\n');
  
  const tables = ['jobs', 'internships', 'courses', 'certification_catalog'];
  
  for (const table of tables) {
    console.log(`Table: ${table}`);
    const result = await testSimpleQuery(table);
    console.log(`  Status: HTTP ${result.status}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    } else {
      const preview = result.body.substring(0, 100);
      console.log(`  Response: ${preview}${result.body.length > 100 ? '...' : ''}`);
    }
    console.log('');
  }

  console.log('\nStep 3: Diagnosis\n');
  console.log('HTTP 400 errors typically mean:');
  console.log('1. Malformed query parameters');
  console.log('2. RLS policies are blocking access');
  console.log('3. Table structure mismatch');
  console.log('4. Invalid filter syntax\n');

  console.log('Next: Check Supabase dashboard at:');
  console.log(`${supabaseUrl.replace('//', '//app.')}/project/default/editor`);
  console.log('\nVerify:');
  console.log('- Tables exist (jobs, internships, courses, certification_catalog)');
  console.log('- Tables have records (SELECT COUNT(*) FROM each_table)');
  console.log('- RLS policies allow authenticated/public read access');
  console.log('- Status column values for jobs/internships (check for "active")');
}

diagnose().catch(err => {
  console.error('Diagnosis failed:', err);
  process.exit(1);
});
