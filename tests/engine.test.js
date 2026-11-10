const E = require('../engine.js');
const data = require('../data/schemes.json');
const s = id => data.schemes.find(x => x.id === id);

const labourer = { age: 52, gender: 'male', state: 'gujarat', occupation: 'labour', income_annual: 120000, category: 'obc', bpl: 'yes', bank_account: 'yes', area: 'rural', housing: 'kutcha', marital: 'married', disability: 'no', pregnant_or_mother: 'no' };
const girl = { age: 15, gender: 'female', state: 'gujarat', occupation: 'student', income_annual: 90000, category: 'sc', bpl: 'yes', bank_account: 'yes', area: 'rural', housing: 'pucca' };
const studentBoy = { age: 19, gender: 'male', state: 'gujarat', occupation: 'student', income_annual: 300000, category: 'general', bpl: 'no', bank_account: 'yes', area: 'urban', housing: 'pucca' };

let pass = 0, fail = 0;
function ok(cond, name) { if (cond) pass++; else { fail++; console.error('FAIL:', name); } }

const m1 = E.matchAll(labourer, data.schemes);
ok(m1.top.length >= 3, 'labourer gets 3+ schemes');
ok(m1.eligible.some(r => r.scheme.id === 'mgnrega'), 'labourer eligible MGNREGA');
ok(m1.eligible.some(r => r.scheme.id === 'pmay-g'), 'labourer with kutcha house eligible PMAY-G');
ok(!m1.eligible.some(r => r.scheme.id === 'nmmss'), 'labourer 52 not eligible student scholarship');

const m2 = E.matchAll(girl, data.schemes);
ok(m2.eligible.some(r => r.scheme.id === 'postmatric-sc'), 'SC girl eligible post-matric SC');
ok(m2.eligible.some(r => r.scheme.id === 'guj-namo-lakshmi'), 'Gujarat girl eligible Namo Lakshmi');
ok(!m2.eligible.some(r => r.scheme.id === 'pm-kisan'), 'student girl not eligible PM-KISAN');

const m3 = E.matchAll(studentBoy, data.schemes);
ok(m3.eligible.some(r => r.scheme.id === 'guj-mysy'), 'Gujarat student income<6L eligible MYSY');
ok(!m3.eligible.some(r => r.scheme.id === 'postmatric-sc'), 'general category not eligible SC scholarship');

// Gujarat-only scheme must not match other states
const other = Object.assign({}, labourer, { state: 'maharashtra' });
ok(!E.matchAll(other, data.schemes).eligible.some(r => r.scheme.id === 'guj-mysy'), 'MYSY Gujarat-only');

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
