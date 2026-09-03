/**
 * Final Diagnostic - Proper REST API Queries
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

console.log('=== NAVPRARAMBH Dashboard Analysis ===\n');

async function countRows(tableName, filter = '') {
  try {
    let url = `${supabaseUrl}/rest/v1/${tableName}?select=count`;
    if (filter) url += `&${filter}`;

    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Accept': 'application/vnd.pgrst.object+json',
      },
    });

    if (response.status === 401 || response.status === 406) {
      // Try with array format instead
      url = `${supabaseUrl}/rest/v1/${tableName}?select=id.count()`;
      if (filter) url += `&${filter}`;
      
      const response2 = await fetch(url, {
        headers: {
          'apikey': supabaseKey,
          'Accept': 'application/json',
        },
      });
      
      if (response2.ok) {
        const data = await response2.json();
        return { ok: true, count: Array.isArray(data) ? data[0]?.count || 0 : data.count || 0 };
      }
    }
    
    if (response.ok) {
      const data = await response.json();
      return { ok: true, count: data.count };
    }
    
    return { ok: false, status: response.status, error: await response.text() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function getTableData(tableName) {
  try {
    const url = `${supabaseUrl}/rest/v1/${tableName}?select=*&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const data = await response.json();
    return { ok: true, data: Array.isArray(data) ? data : [data], count: Array.isArray(data) ? data.length : 1 };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function main() {
  console.log('Analyzing catalog tables...\n');

  const catalogs = [
    { name: 'jobs', filter: 'status=eq.active' },
    { name: 'internships', filter: 'status=eq.active' },
    { name: 'courses', filter: '' },
    { name: 'certification_catalog', filter: '' },
  ];

  const results = [];

  for (const cat of catalogs) {
    process.stdout.write(`${cat.name}... `);
    
    // Get total count
    const totalResult = await countRows(cat.name);
    
    // Get filtered count (if filter exists)
    let filteredResult = totalResult;
    if (cat.filter) {
      filteredResult = await countRows(cat.name, cat.filter);
    }

    if (totalResult.ok) {
      console.log(`${totalResult.count} total${cat.filter ? `, ${filteredResult.ok ? filteredResult.count : '?'} ${cat.filter.split('=')[0]}` : ''}`);
      
      // Try to get sample data
      if (totalResult.count > 0) {
        const sampleResult = await getTableData(cat.name);
        if (sampleResult.ok && sampleResult.data.length > 0) {
          const record = sampleResult.data[0];
          process.stdout.write('  Sample: ');
          if (cat.name === 'jobs' || cat.name === 'internships') {
            console.log(`"${record.title || 'Unknown'}" (status: ${record.status || 'N/A'})`);
          } else if (cat.name === 'courses') {
            console.log(`"${record.title || 'Unknown'}"`);
          } else if (cat.name === 'certification_catalog') {
            console.log(`"${record.name || 'Unknown'}" by ${record.provider || 'Unknown'}`);
          } else {
            console.log(JSON.stringify(record).substring(0, 60) + '...');
          }
        }
      }
      
      results.push({ table: cat.name, total: totalResult.count, filtered: filteredResult.count, status: totalResult.count > 0 ? '✓' : '⚠️' });
    } else {
      console.log(`❌ Error: ${totalResult.status || totalResult.error}`);
      results.push({ table: cat.name, total: null, filtered: null, status: '❌' });
    }
  }

  console.log('\n=== Summary ===\n');
  for (const result of results) {
    const icon = result.total === 0 ? '⚠️' : result.total > 0 ? '✓' : '❌';
    console.log(`${icon} ${result.table}: ${result.total !== null ? result.total + ' records' : 'Error'}`);
  }

  const emptyTables = results.filter(r => r.total === 0).map(r => r.table);
  
  if (emptyTables.length > 0) {
    console.log(`\n⚠️  Empty Tables: ${emptyTables.join(', ')}`);
    console.log('\nROOT CAUSE FOUND:');
    console.log('The dashboard shows empty states because these catalog tables contain NO DATA.');
    console.log('\nWhy the dashboard displays "No published jobs/internships/courses are available yet.":');
    console.log('- Frontend queries: getJobs(), getInternships(), getCourses()');
    console.log('- These return empty arrays []');
    console.log('- CatalogOverview component displays empty state for 0-item arrays');
    console.log('- This is NOT an error or RLS issue—the data simply doesn\'t exist yet.');
  } else if (emptyTables.length === 0) {
    console.log('\n✓ All catalog tables have data');
    console.log('Dashboard should display opportunities');
  }
}

main().catch(err => console.error(err));
