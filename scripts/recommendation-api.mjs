import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

function loadLocalEnv() {
  for (const fileName of ['.env.local', '.env']) {
    const filePath = path.join(projectRoot, fileName);
    if (!fs.existsSync(filePath)) continue;
    for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*["']?([^"']*)["']?\s*$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
    }
  }
}

loadLocalEnv();

// Production hosts inject these variables. The VITE_* fallbacks preserve the
// existing local development setup without exposing server-only credentials.
const PORT = Number(process.env.PORT || process.env.RECOMMENDATION_PORT || 8787);
const HOST = process.env.HOST || process.env.RECOMMENDATION_HOST || '127.0.0.1';
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const EMBEDDING_MODEL = process.env.OLLAMA_MODEL || 'nomic-embed-text:latest';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || process.env.RECOMMENDATION_ALLOWED_ORIGIN || 'http://localhost:5173';
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const embeddingCache = new Map();

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': ALLOWED_ORIGIN,
    'access-control-allow-headers': 'Authorization, Content-Type',
    'access-control-allow-methods': 'GET, OPTIONS',
  });
  response.end(JSON.stringify(payload));
}

function getBearer(request) {
  const header = request.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

async function supabaseRequest(resource, accessToken) {
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase environment variables are not configured.');
  const url = `${supabaseUrl}/rest/v1/${resource}`;
  const result = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });
  if (!result.ok) throw new Error(`Supabase request failed with HTTP ${result.status}.`);
  return result.json();
}

async function getAuthenticatedUser(accessToken) {
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase environment variables are not configured.');
  const result = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${accessToken}` },
  });
  if (!result.ok) throw new Error('Your session is no longer valid. Please sign in again.');
  return result.json();
}

async function checkOllama() {
  try {
    const result = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!result.ok) return { available: false, modelAvailable: false };
    const payload = await result.json();
    const models = Array.isArray(payload.models) ? payload.models : [];
    const modelAvailable = models.some((model) => typeof model?.name === 'string' && (model.name === EMBEDDING_MODEL || model.name.split(':')[0] === EMBEDDING_MODEL.split(':')[0]));
    return { available: true, modelAvailable };
  } catch {
    return { available: false, modelAvailable: false };
  }
}

async function embed(input) {
  const result = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input }),
  });
  if (!result.ok) throw new Error(`Ollama embedding request failed with HTTP ${result.status}.`);
  const payload = await result.json();
  if (!Array.isArray(payload.embeddings) || payload.embeddings.some((item) => !Array.isArray(item))) {
    throw new Error('Ollama did not return embedding vectors.');
  }
  return payload.embeddings;
}

function cleanList(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.trim()) : [];
}

function profileText(profile, skills, projects, certifications, resumeVersions) {
  return [
    profile?.degree && `Degree: ${profile.degree}`,
    profile?.college && `College: ${profile.college}`,
    profile?.location && `Location: ${profile.location}`,
    profile?.bio && `Bio: ${profile.bio}`,
    skills.length && `Skills: ${skills.join(', ')}`,
    projects.length && `Projects: ${projects.map((project) => `${project.title}: ${project.description || ''} (${cleanList(project.tech_stack).join(', ')})`).join('; ')}`,
    certifications.length && `Certifications: ${certifications.map((certification) => `${certification.name} from ${certification.provider}`).join('; ')}`,
    resumeVersions.length && `Resume available: ${resumeVersions.map((resume) => resume.title).join(', ')}`,
  ].filter(Boolean).join('. ');
}

function opportunityText(opportunity) {
  const company = opportunity.company?.name;
  return [
    opportunity.title && `${opportunity.opportunityType === 'job' ? 'Job' : 'Internship'} title: ${opportunity.title}`,
    company && `Company: ${company}`,
    opportunity.description && `Description: ${opportunity.description}`,
    cleanList(opportunity.skills).length && `Skills: ${cleanList(opportunity.skills).join(', ')}`,
    opportunity.mode && `Work mode: ${opportunity.mode}`,
    opportunity.location && `Location: ${opportunity.location}`,
  ].filter(Boolean).join('. ');
}

function cosineSimilarity(left, right) {
  if (!left.length || left.length !== right.length) throw new Error('Embedding vectors have incompatible dimensions.');
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }
  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
  return denominator === 0 ? 0 : dot / denominator;
}

function percentageFromCosine(similarity) {
  return Math.round(Math.max(0, Math.min(100, ((similarity + 1) / 2) * 100)));
}

function normalizedSkill(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9+#.]+/g, ' ');
}

function skillScore(studentSkills, internshipSkills) {
  const student = studentSkills.map(normalizedSkill);
  const required = internshipSkills.map(normalizedSkill);
  if (!student.length || !required.length) return { score: null, matched: [], missing: [] };
  const matches = (requiredSkill) => student.some((studentSkill) => studentSkill === requiredSkill || studentSkill.includes(requiredSkill) || requiredSkill.includes(studentSkill));
  const matched = internshipSkills.filter((_, index) => matches(required[index]));
  const missing = internshipSkills.filter((_, index) => !matches(required[index]));
  return { score: Math.round((matched.length / required.length) * 100), matched, missing };
}

function calculateFinalScore(semanticScore, structured) {
  const weighted = [{ value: semanticScore, weight: 0.6 }];
  if (structured.skillScore !== null) weighted.push({ value: structured.skillScore, weight: 0.2 });
  if (structured.eligibilityScore !== null) weighted.push({ value: structured.eligibilityScore, weight: 0.1 });
  if (structured.preferenceScore !== null) weighted.push({ value: structured.preferenceScore, weight: 0.1 });
  const weightTotal = weighted.reduce((sum, item) => sum + item.weight, 0);
  return Math.round(weighted.reduce((sum, item) => sum + item.value * item.weight, 0) / weightTotal);
}

function explanation(semanticScore, structured, matched, missing) {
  const parts = [`${semanticScore}% AI semantic alignment with your saved profile`];
  if (matched.length) parts.push(`matched ${matched.join(', ')}`);
  if (structured.skillScore === null) parts.push('explicit skill comparison unavailable');
  if (structured.eligibilityScore === null) parts.push('eligibility comparison unavailable because the internship schema has no eligibility field');
  if (structured.preferenceScore === null) parts.push('preference comparison unavailable because no preferred work mode is saved');
  if (missing.length) parts.push(`skills to improve: ${missing.join(', ')}`);
  return `${parts[0]}${parts.length > 1 ? `; ${parts.slice(1).join('; ')}` : ''}.`;
}

async function recommendations(accessToken) {
  const user = await getAuthenticatedUser(accessToken);
  const userId = user.id;
  const [profiles, skillsRows, projectRows, certificationRows, resumeRows, jobRows, internshipRows] = await Promise.all([
    supabaseRequest(`profiles?id=eq.${encodeURIComponent(userId)}&select=full_name,degree,college,location,bio`, accessToken),
    supabaseRequest(`student_skills?user_id=eq.${encodeURIComponent(userId)}&select=name&order=name`, accessToken),
    supabaseRequest(`projects?user_id=eq.${encodeURIComponent(userId)}&select=title,description,tech_stack&order=created_at.desc`, accessToken),
    supabaseRequest(`user_certifications?user_id=eq.${encodeURIComponent(userId)}&select=name,provider&order=issue_date.desc`, accessToken),
    supabaseRequest(`resume_versions?user_id=eq.${encodeURIComponent(userId)}&select=title,file_url&order=created_at.desc&limit=3`, accessToken),
    supabaseRequest('jobs?status=eq.active&select=id,title,description,mode,type,location,skills,apply_url,company:companies(name)&order=created_at.desc', accessToken),
    supabaseRequest('internships?status=eq.active&select=id,title,description,mode,skills,apply_url,company:companies(name)&order=created_at.desc', accessToken),
  ]);
  const profile = profiles[0] || null;
  const studentSkills = skillsRows.map((row) => row.name).filter(Boolean);
  const studentText = profileText(profile, studentSkills, projectRows, certificationRows, resumeRows);
  if (!studentText) throw new Error('Add profile details or skills before generating AI recommendations.');
  const opportunities = [
    ...jobRows.map((item) => ({ ...item, opportunityType: 'job' })),
    ...internshipRows.map((item) => ({ ...item, opportunityType: 'internship' })),
  ];
  const [studentEmbedding] = await embed(studentText);
  const uncached = [];
  const embeddings = new Map();
  for (const opportunity of opportunities) {
    const text = opportunityText(opportunity);
    const key = `${opportunity.opportunityType}:${opportunity.id}:${text}`;
    const cached = embeddingCache.get(key);
    if (cached) embeddings.set(`${opportunity.opportunityType}:${opportunity.id}`, cached);
    else uncached.push({ opportunity, text, key });
  }
  if (uncached.length) {
    const vectors = await embed(uncached.map((item) => item.text));
    vectors.forEach((vector, index) => {
      embeddingCache.set(uncached[index].key, vector);
      embeddings.set(`${uncached[index].opportunity.opportunityType}:${uncached[index].opportunity.id}`, vector);
    });
  }
  const results = opportunities.map((opportunity) => {
    const vector = embeddings.get(`${opportunity.opportunityType}:${opportunity.id}`);
    const semanticScore = percentageFromCosine(cosineSimilarity(studentEmbedding, vector));
    const skillsResult = skillScore(studentSkills, cleanList(opportunity.skills));
    const structured = { skillScore: skillsResult.score, eligibilityScore: null, preferenceScore: null };
    return {
      opportunityId: opportunity.id,
      opportunityType: opportunity.opportunityType,
      title: opportunity.title,
      company: opportunity.company?.name || 'Company not specified',
      matchScore: calculateFinalScore(semanticScore, structured),
      semanticScore,
      skillScore: structured.skillScore,
      eligibilityScore: null,
      preferenceScore: null,
      matchedSkills: skillsResult.matched,
      missingSkills: skillsResult.missing,
      reason: explanation(semanticScore, structured, skillsResult.matched, skillsResult.missing),
      applicationUrl: opportunity.apply_url || null,
      location: opportunity.location || null,
      workMode: opportunity.mode || null,
      embeddingDimension: studentEmbedding.length,
      componentsAvailable: { semantic: true, skills: structured.skillScore !== null, eligibility: false, preference: false },
    };
  }).sort((left, right) => right.matchScore - left.matchScore).slice(0, 10);
  return { model: EMBEDDING_MODEL, recommendations: results, evaluatedOpportunities: opportunities.length, evaluatedInternships: opportunities.length, embeddingDimension: studentEmbedding.length, cachedEmbeddings: embeddingCache.size };
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }
  if (request.method === 'GET' && request.url === '/health') {
    const ollama = await checkOllama();
    const ok = ollama.available && ollama.modelAvailable;
    sendJson(response, ok ? 200 : 503, { ok, model: EMBEDDING_MODEL, ollama: OLLAMA_URL, ...ollama });
    return;
  }
  if (request.method !== 'GET' || request.url !== '/api/recommendations') {
    sendJson(response, 404, { error: 'Not found' });
    return;
  }
  const accessToken = getBearer(request);
  if (!accessToken) {
    sendJson(response, 401, { error: 'Authentication is required.' });
    return;
  }
  try {
    sendJson(response, 200, await recommendations(accessToken));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Recommendation service failed.';
    const status = message.includes('session') || message.includes('Authentication') ? 401 : 503;
    sendJson(response, status, { error: message, model: EMBEDDING_MODEL });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`NAVPRARAMBH recommendation API listening on http://${HOST}:${PORT}`);
  console.log(`Embedding model: ${EMBEDDING_MODEL}`);
});
