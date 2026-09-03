import fs from 'node:fs';

const envText = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
const readEnv = (name) => envText.match(new RegExp(`^${name}=(.*)$`, 'm'))?.[1]?.replace(/^['"]|['"]$/g, '').trim();
const supabaseUrl = (readEnv('VITE_SUPABASE_URL') || '').replace(/\/$/, '');
const supabaseKey = readEnv('VITE_SUPABASE_PUBLISHABLE_KEY') || readEnv('VITE_SUPABASE_ANON_KEY');
const ollamaUrl = readEnv('OLLAMA_URL') || 'http://127.0.0.1:11434';
const report = {};

try {
  const response = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
  const payload = await response.json();
  const models = Array.isArray(payload.models) ? payload.models.map((model) => model.name) : [];
  report.ollama = { status: response.status, reachable: response.ok, models, embeddingModelAvailable: models.some((name) => name.split(':')[0] === 'nomic-embed-text') };
} catch (error) {
  report.ollama = { reachable: false, error: error instanceof Error ? error.message : 'request failed' };
}

try {
  const response = await fetch('http://127.0.0.1:8787/health', { signal: AbortSignal.timeout(3000) });
  report.recommendationApi = { status: response.status, body: await response.json() };
} catch (error) {
  report.recommendationApi = { reachable: false, error: error instanceof Error ? error.message : 'request failed' };
}

try {
  const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, signal: AbortSignal.timeout(5000) });
  report.storageBuckets = { status: response.status, body: (await response.text()).slice(0, 1000) };
} catch (error) {
  report.storageBuckets = { reachable: false, error: error instanceof Error ? error.message : 'request failed' };
}

console.log(JSON.stringify(report, null, 2));
