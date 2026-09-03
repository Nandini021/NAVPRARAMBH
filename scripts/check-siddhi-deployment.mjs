import fs from 'node:fs';

const envText = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
const readEnv = (name) => envText.match(new RegExp(`^${name}=(.*)$`, 'm'))?.[1]?.replace(/^['"]|['"]$/g, '');
const url = (readEnv('VITE_SUPABASE_URL') || '').replace(/\/$/, '');
const key = readEnv('VITE_SUPABASE_PUBLISHABLE_KEY') || readEnv('VITE_SUPABASE_ANON_KEY');
if (!url || !key) throw new Error('Supabase public configuration not found');

const response = await fetch(`${url}/functions/v1/siddhi-chat`, {
  method: 'POST',
  headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'What skills should I learn to become a Data Analyst?' }),
});
const body = await response.text();
console.log(JSON.stringify({
  status: response.status,
  deployed: response.status !== 404,
  protectedWithoutSession: response.status === 401,
  body: body.slice(0, 240),
}, null, 2));
