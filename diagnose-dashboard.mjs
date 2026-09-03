/**
 * Dashboard Diagnostic Script
 * Checks:
 * 1. Supabase connectivity
 * 2. Table existence and record counts
 * 3. Query success/failure  
 * 4. Sample records from each catalog
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

console.log('=== NAVPRARAMBH Dashboard Diagnostic ===\n');
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Supabase Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT FOUND'}\n`);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

async function queryTable(tableName, filters = '') {
  try {
    const url = `${supabaseUrl}/rest/v1/${tableName}?select=count()${filters}`;
    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { status: response.status, statusText: response.statusText, error: true, count: null, message: `HTTP ${response.status}` };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      const count = Array.isArray(data) ? data[0]?.count : 0;
      return { status: response.status, count, error: false };
    } else {
      const text = await response.text();
      return { status: response.status, error: true, message: `Non-JSON response: ${text.substring(0, 50)}` };
    }
  } catch (err) {
    return { error: true, message: err.message };
  }
}

async function fetchSamples(tableName, limit = 1) {
  try {
    const url = `${supabaseUrl}/rest/v1/${tableName}?select=*&limit=${limit}`;
    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return { error: true, message: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { error: false, data };
  } catch (err) {
    return { error: true, message: err.message };
  }
}

async function diagnose() {
  console.log('Checking table connectivity and record counts...\n');

  const tables = [
    { name: 'jobs', filters: '&status=eq.active', description: 'Published Jobs' },
    { name: 'internships', filters: '&status=eq.active', description: 'Published Internships' },
    { name: 'courses', filters: '', description: 'Courses Catalog' },
    { name: 'certification_catalog', filters: '', description: 'Certifications Catalog' },
    { name: 'pm_internships', filters: '&status=eq.active', description: 'PM Internships' },
    { name: 'profiles', filters: '', description: 'Student Profiles' },
    { name: 'enrollments', filters: '', description: 'Course Enrollments' },
    { name: 'applications', filters: '', description: 'Student Applications' },
  ];

  const results = {};

  for (const table of tables) {
    process.stdout.write(`Checking ${table.name}... `);
    const result = await queryTable(table.name, table.filters);
    
    if (result.error) {
      console.log(`❌ Error (${result.message})`);
      results[table.name] = { ...result, label: table.description };
    } else {
      console.log(`✓ Count: ${result.count}`);
      results[table.name] = { ...result, label: table.description };
    }
  }

  console.log('\n=== Detailed Report ===\n');

  for (const [tableName, result] of Object.entries(results)) {
    console.log(`📋 ${result.label || tableName}`);
    if (result.error) {
      console.log(`   Status: ❌ Error - ${result.message}`);
    } else {
      console.log(`   Status: ✓ OK`);
      console.log(`   Record Count: ${result.count}`);
      
      // Fetch a sample if there are records
      if (result.count > 0) {
        process.stdout.write('   Fetching sample... ');
        const sample = await fetchSamples(tableName, 1);
        if (!sample.error && sample.data && sample.data.length > 0) {
          console.log('✓');
          const record = sample.data[0];
          console.log(`   Sample Keys: ${Object.keys(record).slice(0, 5).join(', ')}...`);
          
          // Show useful fields for debugging
          if (tableName === 'jobs' || tableName === 'internships') {
            console.log(`   - title: ${record.title || 'N/A'}`);
            console.log(`   - status: ${record.status || 'N/A'}`);
            console.log(`   - apply_url: ${record.apply_url ? '✓ Present' : '❌ Missing'}`);
          } else if (tableName === 'courses') {
            console.log(`   - title: ${record.title || 'N/A'}`);
          } else if (tableName === 'profiles') {
            console.log(`   - full_name: ${record.full_name || 'N/A'}`);
            console.log(`   - email: ${record.email || 'N/A'}`);
          }
        } else {
          console.log('❌ Could not fetch sample');
        }
      }
    }
    console.log('');
  }

  // Final summary
  console.log('=== Summary ===\n');
  const catalogTables = ['jobs', 'internships', 'courses', 'certification_catalog'];
  const emptyCatalogs = catalogTables.filter(t => results[t] && !results[t].error && results[t].count === 0);
  
  if (emptyCatalogs.length > 0) {
    console.log(`⚠️  Empty Catalogs Found: ${emptyCatalogs.join(', ')}`);
    console.log('\nThese tables contain no records. The dashboard will show "No [items] available yet." messages.\n');
    console.log('Next Steps:');
    console.log('1. Check if Supabase has been seeded with test data');
    console.log('2. Check if RLS policies prevent reading public data');
    console.log('3. Manually add sample records via Supabase dashboard');
    console.log('4. Verify that the frontend is using correct table names');
  } else {
    console.log('✓ All catalog tables contain records');
    console.log('✓ Dashboard should display opportunities');
  }
}

diagnose().catch(err => {
  console.error('Diagnosis failed:', err);
  process.exit(1);
});
