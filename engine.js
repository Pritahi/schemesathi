// SchemeSathi deterministic rules engine - no LLM decides eligibility.
// Pure functions, shared between browser and Node (tests).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SchemeEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // profile: { age, gender, state, occupation, income_annual, category, bpl,
  //            land_acres, marital, disability, bank_account, housing, area,
  //            pregnant_or_mother }
  function matchScheme(profile, scheme) {
    const r = scheme.rules;
    const reasons = [];
    const fails = [];

    if (r.states && !r.states.includes('*') && !r.states.includes((profile.state || '').toLowerCase()))
      fails.push('state');
    if (r.genders && !r.genders.includes('*') && !r.genders.includes(profile.gender))
      fails.push('gender');
    if (r.occupations && !r.occupations.includes('*') && !r.occupations.includes(profile.occupation) && !r.occupations.includes('any'))
      fails.push('occupation');
    if (r.age_min != null && profile.age != null && profile.age < r.age_min) fails.push('age');
    if (r.age_max != null && profile.age != null && profile.age > r.age_max) fails.push('age');
    if (r.income_max != null && profile.income_annual != null && profile.income_annual > r.income_max) fails.push('income');
    if (r.categories && !r.categories.includes('*') && !r.categories.includes((profile.category || '').toLowerCase()))
      fails.push('category');
    if (r.bpl_required && profile.bpl !== 'yes') fails.push('bpl');
    if (r.land_max_acres != null && profile.land_acres != null && profile.land_acres > r.land_max_acres) fails.push('land');
    for (const req of (r.requires || [])) {
      if (!req.values.includes(String(profile[req.field]))) fails.push(req.field);
    }

    if (fails.length) return { scheme, eligible: false, score: 0, reasons: [], fails };

    // eligibility passed - build reasons and score
    reasons.push(scheme.why_hi);
    if (r.bpl_preferred && profile.bpl === 'yes') reasons.push('BPL परिवार - प्राथमिकता मिलेगी');
    const score = (scheme.benefit_annual_inr || 0) + (r.bpl_preferred && profile.bpl === 'yes' ? 100000 : 0);
    return { scheme, eligible: true, score, reasons, fails: [] };
  }

  function matchAll(profile, schemes) {
    const results = schemes.map(s => matchScheme(profile, s));
    const eligible = results.filter(r => r.eligible).sort((a, b) => b.score - a.score);
    return { eligible, top: eligible.slice(0, 5) };
  }

  // Template-based Hinglish summary - the "language layer". Deterministic, no LLM needed.
  // An LLM adapter (see api/chat.js) can rephrase this, but never changes eligibility.
  function speakSummary(profile, matched) {
    const n = matched.top.length;
    if (!n) return 'अभी आपकी जानकारी से कोई योजना नहीं मिली। आयु, राज्य या आय बदलकर फिर देखें, या नज़दीकी CSC पर पूछें।';
    const name = matched.top[0].scheme.name_hi;
    const lines = [
      `आपकी जानकारी के हिसाब से आपको ${n} योजनाओं का फ़ायदा मिल सकता है।`,
      `सबसे बड़ी योजना: ${name} - ${matched.top[0].scheme.benefit_hi}।`,
      `क्यों मिलेगा: ${matched.top[0].reasons[0]}।`,
      'नीचे हर योजना के कागज़ात और आवेदन की जगह दी गई है।',
    ];
    return lines.join(' ');
  }

  return { matchScheme, matchAll, speakSummary };
});
