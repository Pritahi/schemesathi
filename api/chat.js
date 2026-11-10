// Optional LLM language-layer adapter (Vercel serverless).
// The app's eligibility decisions are 100% deterministic (engine.js) and run
// on-device; this adapter ONLY rephrases the already-computed result into
// warmer spoken Hinglish. It never sees or decides eligibility.
// Configure AGENTFOUNDRY_AGENT_URL to an agent endpoint to enable.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const url = process.env.AGENTFOUNDRY_AGENT_URL;
  if (!url) return res.status(200).json({ mode: 'template', note: 'LLM adapter not configured; client uses built-in templates.' });
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(req.body) });
  const j = await r.json();
  res.status(200).json({ mode: 'llm', text: j.text || j.output || '' });
}
