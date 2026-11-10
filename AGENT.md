# SchemeSathi agent flow

Built in the AgentFoundry IDE (Code for a Billion hackathon IDE requirement).

```
voice/tap intake (app.js, Web Speech API, hi-IN)
        |
        v
structured profile { age, gender, state, occupation, income, category, bpl, ... }
        |
        v
deterministic rules engine (engine.js) + knowledge base (data/schemes.json)
        |   -> eligibility is CODE, never an LLM guess
        v
ranked scheme list + "kyun milega" reasons
        |
        v
Hinglish answer layer
  - default: on-device templates (works offline)
  - optional: api/chat.js LLM adapter (AgentFoundry smart-code agent endpoint)
        |
        v
action cards: benefit, documents, apply link/place, WhatsApp share, helper queue
```

Trust design: the LLM can only rephrase an already-computed result; it cannot
change who is eligible. Every scheme rule cites its official source URL with a
last-checked date in data/schemes.json.
