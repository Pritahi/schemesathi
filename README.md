# SchemeSathi (स्कीमसाथी)

**Sarkari schemes, aapki bhasha mein.** A voice-first agent that tells informal workers and low-literacy families which government schemes they are eligible for - and exactly how to apply.

Track: **Livelihood for the Uneducated** (benefits access) · Code for a Billion - Bharat Agentic-AI Hackathon 2026

## Live demo

**https://pritahi.github.io/schemesathi/** - no install, no signup, works on any phone browser. Try the demo personas (see PILOT.md) or speak in Hindi/Hinglish.

## The problem (size & severity)

India runs thousands of welfare schemes - scholarships, pensions, crop support, housing, health cover. The people they exist for - informal workers, low-literacy families - mostly do not know which ones they qualify for, because discovery itself needs English, literacy, and a computer.

- **Size:** ~450 million informal-sector workers (e-Shram registry crossed 30 crore registrations; source: e-Shram portal / MoLE). Unclaimed welfare benefits are estimated in **lakhs of crores** of rupees every year.
- **Severity:** a single missed benefit is rent-money real: ₹6,000/yr PM-KISAN, ₹1.2 lakh PMAY-G house grant, ₹5 lakh/yr Ayushman hospital cover, ₹1.1 lakh Vahli Dikri for a daughter.

## The solution

1. **Talk, don't type.** The user speaks (Hindi/Hinglish/Gujarati voice note) or taps chips: age, state, work, income band, family. No forms, no English.
2. **Deterministic eligibility matching.** A versioned knowledge base of 30 flagship central + Gujarat schemes encodes eligibility rules as data, each rule linked to its official scheme page with a last-checked date (`data/schemes.json`). A small rules engine (`engine.js`) returns the 3-5 schemes the user most likely qualifies for, with a plain-language "kyun milega" for each.
3. **Action card per scheme:** benefit, exact documents, where/how to apply (portal or nearest office), one-tap WhatsApp share to a helper.
4. **Helper mode:** an anganwadi/ASHA worker or cyber-cafe operator can run the intake for many people back-to-back and keep a queue.
5. **The AI only speaks; it never decides.** Eligibility is code, not a guess. The optional LLM adapter (`api/chat.js`) only rephrases the already-computed result into warmer spoken language. This is the trust design and the demo's centerpiece.

## Architecture

```
index.html  app.js        mobile-first PWA (voice + tap intake, action cards, helper queue)
engine.js                 deterministic rules engine (pure JS, unit-tested, runs on-device)
data/schemes.json         30 schemes: rules + official source URLs + last-checked dates
api/chat.js               OPTIONAL LLM language adapter (AgentFoundry smart-code agent endpoint)
tests/engine.test.js      rules engine test suite (node tests/engine.test.js)
```

No build step, no backend required for the core product - it runs offline on a ₹8,000 phone. Built in the **AgentFoundry IDE** with smart-code tokens (Code for a Billion hackathon requirement) - the `.codenow/` project folder is kept in this repo deliberately as AgentFoundry provenance.

## Proven impact

Pilot with real users from the builder's community in Gujarat (family, neighbours, informal workers), run before the submission deadline. Numbers are reported exactly as measured - users screened, schemes discovered per user, applications started. See `PILOT.md` for the raw log. (We publish honest small data, not projected big data - the rubric asks for actual deployment data.)

## Live demo

- App: deployed link in the submission issue
- Video: 2-3 minute walkthrough linked in the submission issue

## Run locally

Open `index.html` in any modern browser, or serve statically: `npx serve .`
Tests: `node tests/engine.test.js`

## License

MIT (attribution retained by contributors; released per Code for India hackathon rules).
