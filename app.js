/* SchemeSathi UI logic - voice/text intake -> deterministic match -> action cards */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const profile = { gender: null, occupation: null, category: 'general', bpl: null, bank_account: 'yes', area: 'rural', housing: 'pucca', income_annual: null, age: null, state: 'gujarat', marital: null, disability: 'no', pregnant_or_mother: 'no' };

  let SCHEMES = [];
  fetch('data/schemes.json').then(r => r.json()).then(d => { SCHEMES = d.schemes; });

  // chip groups
  $$('.chips').forEach(g => {
    g.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      g.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
      b.classList.add('on');
      const f = g.dataset.f;
      profile[f === 'income' ? 'income_annual' : f] = f === 'income' ? Number(b.dataset.v) : b.dataset.v;
    });
  });
  $('#f-age').addEventListener('input', e => { profile.age = Number(e.target.value) || null; });
  $('#f-state').addEventListener('change', e => { profile.state = e.target.value; });
  $('#btn-manual').addEventListener('click', () => $('#card-form').classList.toggle('hidden'));

  // --- speech intake (Hinglish/Gujarati) ---
  const WORDS_NUM = { 'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5, 'छह': 6, 'छै': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10, 'बीस': 20, 'पच्चीस': 25, 'तीस': 30, 'चालीस': 40, 'पचास': 50, 'पच्छीस': 25, 'साठ': 60, 'सत्तर': 70 };
  function parseSpeech(text) {
    const t = text.toLowerCase();
    const ageM = t.match(/(\d{1,3})\s*(साल|वर्ष|સાળ)/) || t.match(/(उम्र|आयु|ઉંમર)\D*(\d{1,3})/);
    if (ageM) profile.age = Number(ageM[1] || ageM[3]);
    else for (const w in WORDS_NUM) if (t.includes(w + ' साल') || t.includes(w + ' वर्ष')) { profile.age = WORDS_NUM[w]; break; }
    if (/(महिला|औरत|बाई|स्त्री|મહિલા|लड़की)/.test(t)) profile.gender = 'female';
    else if (/(पुरुष|आदमी|लड़का|પુરુષ)/.test(t)) profile.gender = 'male';
    if (/(किसान|खेती|ખેડૂત)/.test(t)) profile.occupation = 'farmer';
    else if (/(मज़दूर|मजदूर|मज़दूरी|मजदूरी|मज़दुरी|ડાળી|labour)/.test(t)) profile.occupation = 'labour';
    else if (/(रेहड़ी|ठेला|दुकान|વેચ)/.test(t)) profile.occupation = 'vendor';
    else if (/(कारीगर|शिल्पी|दर्जी|लोहार|बढ़ई)/.test(t)) profile.occupation = 'artisan';
    else if (/(छात्र|विद्यार्थी|पढ़ता|पढ़ती|student)/.test(t)) profile.occupation = 'student';
    else if (/(ड्राइवर|ડ્રાઈવર)/.test(t)) profile.occupation = 'driver';
    else if (/(घरेलू|बाई काम)/.test(t)) profile.occupation = 'domestic';
    if (/(गाँव|गांव|ગામ)/.test(t)) profile.area = 'rural'; else if (/(शहर|શહેર)/.test(t)) profile.area = 'urban';
    if (/(विधवा|विधवा हूँ|widow)/.test(t)) { profile.marital = 'widow'; profile.gender = 'female'; }
    if (/(दिव्यांग|विकलांग|अपंग)/.test(t)) profile.disability = 'yes';
    if (/(गर्भवती|माँ बनी|नया बच्चा)/.test(t)) { profile.pregnant_or_mother = 'yes'; profile.gender = 'female'; }
    if (/(बीपीएल|bpl|राशन कार्ड)/.test(t)) profile.bpl = 'yes';
    if (/(sc|एससी|अनुसूचित जाति)/.test(t)) profile.category = 'sc';
    else if (/(st|एसटी|आदिवासी)/.test(t)) profile.category = 'st';
    else if (/(obc|ओबीसी)/.test(t)) profile.category = 'obc';
    $('#heard').textContent = 'सुना: "' + text + '"';
    $('#card-form').classList.remove('hidden');
    // reflect parsed values onto chips
    $$('.chips').forEach(g => {
      const f = g.dataset.f; const key = f === 'income' ? 'income_annual' : f;
      g.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', String(profile[key]) === c.dataset.v));
    });
    if (profile.age) $('#f-age').value = profile.age;
  }
  $('#btn-mic').addEventListener('click', () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { $('#heard').textContent = 'इस फ़ोन में बोलने की सुविधा नहीं - नीचे छूकर भरिए।'; $('#card-form').classList.remove('hidden'); return; }
    const rec = new SR(); rec.lang = 'hi-IN'; rec.interimResults = false;
    $('#heard').textContent = 'सुन रहे हैं... 🎤';
    rec.onresult = e => parseSpeech(e.results[0][0].transcript);
    rec.onerror = () => { $('#heard').textContent = 'आवाज़ समझ नहीं आई - फिर बोलिए या छूकर भरिए।'; };
    rec.start();
  });

  // --- matching + cards ---
  function card(s, reasons) {
    const docs = s.docs.map(d => `<li>${d}</li>`).join('');
    const share = encodeURIComponent(`मेरी योजना: ${s.name_hi}\nफ़ायदा: ${s.benefit_hi}\nकागज़ात: ${s.docs.join(', ')}\nआवेदन: ${s.apply.place_hi}\nजानकारी: ${s.source_url}`);
    return `<div class="card scheme">
      <h3>${s.name_hi}<span class="tag">${s.level === 'gujarat' ? 'गुजरात' : 'केंद्र'}</span></h3>
      <div class="ben">💰 ${s.benefit_hi}</div>
      <div class="why">✅ ${reasons.join(' · ')}</div>
      <div class="step">कागज़ात:</div><ul>${docs}</ul>
      <div>📍 <b>कहाँ करें:</b> ${s.apply.place_hi}</div>
      <div style="margin-top:8px"><a href="${s.apply.url}" target="_blank" rel="noopener">आवेदन पोर्टल खोलें →</a> &nbsp; <a href="https://wa.me/?text=${share}" target="_blank" rel="noopener">WhatsApp →</a></div>
    </div>`;
  }
  function render() {
    if (!SCHEMES.length) return;
    if (profile.age == null) profile.age = 30; // keep screening useful without every answer
    const m = SchemeEngine.matchAll(profile, SCHEMES);
    const el = $('#results');
    el.innerHTML = `<div class="card summary"><div class="q">आपकी योजनाएँ (${m.top.length})</div><p id="summary-text">${SchemeEngine.speakSummary(profile, m)}</p>
      <button class="btn ghost" id="btn-say">🔊 सुनिए</button></div>` + m.top.map(r => card(r.scheme, r.reasons)).join('');
    $('#card-helper').classList.remove('hidden');
    $('#btn-say').onclick = () => {
      const u = new SpeechSynthesisUtterance($('#summary-text').textContent); u.lang = 'hi-IN'; speechSynthesis.speak(u);
    };
    el.scrollIntoView({ behavior: 'smooth' });
    window.__lastMatch = m;
  }
  $('#btn-find').addEventListener('click', render);

  // --- helper mode (queue in localStorage) + share ---
  $('#btn-helper-save').addEventListener('click', () => {
    const q = JSON.parse(localStorage.getItem('ss_queue') || '[]');
    q.push({ at: new Date().toISOString(), profile, count: (window.__lastMatch || { top: [] }).top.length });
    localStorage.setItem('ss_queue', JSON.stringify(q));
    renderQueue();
  });
  function renderQueue() {
    const q = JSON.parse(localStorage.getItem('ss_queue') || '[]');
    if (!q.length) return;
    $('#card-queue').classList.remove('hidden');
    $('#queue-list').innerHTML = q.map((x, i) =>
      `<p class="step">#${i + 1} · ${new Date(x.at).toLocaleString('hi-IN')} · ${x.profile.occupation || '-'}, ${x.profile.age || '-'} वर्ष · ${x.count} योजनाएँ</p>`).join('');
  }
  $('#btn-share').addEventListener('click', () => {
    const m = window.__lastMatch; if (!m) return;
    const txt = encodeURIComponent('SchemeSathi रिपोर्ट:\n' + m.top.map(r => `• ${r.scheme.name_hi} - ${r.scheme.benefit_hi}`).join('\n'));
    window.open('https://wa.me/?text=' + txt, '_blank');
  });
  renderQueue();
})();
