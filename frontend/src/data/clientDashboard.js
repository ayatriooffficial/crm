import { CLIENTS } from './clients';
import { CLIENT_TYPES } from './clientTypes';
import { RECURRING_SERVICES } from './services';
import { TEAM_USERS } from './users';

/*
 * Dummy data for the Client Dashboard (every tab). Everything is generated
 * deterministically from the client id, so the server render and the
 * browser render always agree and each client always shows the same data.
 * All names, numbers, PANs, addresses and passwords are FICTIONAL.
 */

/** "Today" for the demo — fixed so the data never drifts or mismatches on hydration. */
export const TODAY = '2026-10-08';

const TYPE_LABELS = new Map(CLIENT_TYPES.map((type) => [type.value, type.label]));
const SERVICE_BY_ID = new Map(RECURRING_SERVICES.map((service) => [service.id, service]));
const USER_NAMES = TEAM_USERS.map((user) => user.label);

/* ---------- seeded random ---------- */

function hashString(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seedText) {
  let state = hashString(seedText);
  const next = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (list) => list[Math.floor(next() * list.length)],
    chance: (p) => next() < p,
    sample: (list, count) => {
      const pool = [...list];
      const out = [];
      while (out.length < count && pool.length) out.push(pool.splice(Math.floor(next() * pool.length), 1)[0]);
      return out;
    },
  };
}

/* ---------- dates ---------- */

const pad = (n) => String(n).padStart(2, '0');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function addDays(iso, days) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const minDate = (a, b) => (a < b ? a : b);

const isoOf = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`;

/** Shifts a (year, month) pair by `delta` months. Month is 1-based. */
function shiftMonth(year, month, delta) {
  const index = year * 12 + (month - 1) + delta;
  return [Math.floor(index / 12), (index % 12) + 1];
}

const monthPeriod = (year, month) => `${MONTHS[month - 1]} - ${year}`;
const quarterPeriod = (year, quarterStartMonth) =>
  `${MONTHS[quarterStartMonth - 1]}-${MONTHS[quarterStartMonth + 1]} - ${year}`;
const fyPeriod = (startYear) => `${startYear}-${String(startYear + 1).slice(2)}`;

/* ---------- services ---------- */

/** Rough billing cadence of a service, inferred from its name. */
export function serviceFrequency(name) {
  const n = name.toLowerCase();
  if (/quarter|advance tax|24q|26q|27eq|esic|pf return/.test(n)) return 'quarterly';
  if (/itr|audit|annual|financial statements|mgt-7|form 8|form 11|dir-3|dpt-3|gstr-9|income tax return|cma|trademark|dsc/.test(n)) return 'yearly';
  if (/registration|incorporation|deed|udyam|import export|labour|shop|lut|msme|certificate|project report|tan /.test(n)) return 'one-time';
  return 'monthly';
}

const [TODAY_Y, TODAY_M] = TODAY.split('-').map(Number);

/** Label of the latest completed period for a service (what Practive shows as the badge). */
export function currentPeriod(frequency) {
  const [y, m] = shiftMonth(TODAY_Y, TODAY_M, -1);
  if (frequency === 'quarterly') {
    const start = Math.floor((m - 1) / 3) * 3 + 1;
    return quarterPeriod(y, start);
  }
  if (frequency === 'yearly') return fyPeriod(TODAY_M >= 4 ? TODAY_Y - 1 : TODAY_Y - 2);
  return monthPeriod(y, m);
}

/** Day of the following month a return is typically due (purely illustrative). */
function dueDayFor(name) {
  const n = name.toLowerCase();
  if (n.includes('gstr-1')) return 11;
  if (n.includes('gstr-3b')) return 20;
  if (n.includes('tds')) return 7;
  if (n.includes('pf') || n.includes('esic')) return 15;
  return 23;
}

/* ---------- reference lists (fictional) ---------- */

const PLACES = [
  ['Hyderabad', 'Telangana', '5000'],
  ['Pune', 'Maharashtra', '4110'],
  ['Ahmedabad', 'Gujarat', '3800'],
  ['Jaipur', 'Rajasthan', '3020'],
  ['Bengaluru', 'Karnataka', '5600'],
  ['Kolkata', 'West Bengal', '7000'],
  ['Lucknow', 'Uttar Pradesh', '2260'],
  ['Chennai', 'Tamil Nadu', '6000'],
  ['Indore', 'Madhya Pradesh', '4520'],
];
const LOCALITIES = ['Gandhi Nagar', 'Nehru Colony', 'Station Road', 'Market Yard', 'Shanti Vihar', 'Industrial Area', 'Lake View Colony', 'Sector 4', 'Old Town'];
const STREETS = ['Main Road', 'Cross Road', 'Ring Road', 'Temple Street', 'Park Lane', 'Mill Road'];
const CONTACT_PEOPLE = ['Rohan', 'Kavya', 'Nikhil', 'Sneha', 'Arjun', 'Pooja', 'Manish', 'Divya', 'Varun', 'Neha'];
// 4th character of a PAN, by entity type (Income Tax Department scheme).
const PAN_TYPE_CHAR = {
  individual: 'P',
  proprietorship: 'P',
  partnership: 'F',
  llp: 'F',
  huf: 'H',
  'private-limited': 'C',
  'public-limited': 'C',
  'joint-venture': 'C',
  opc: 'C',
  'section-8': 'C',
  trust: 'T',
  ngo: 'T',
  government: 'G',
  aop: 'A',
  society: 'A',
  'co-operative-society': 'A',
  boi: 'B',
  ajp: 'J',
  'local-authority': 'L',
};
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

const SUBTASK_TITLES = [
  'Collect sales & purchase data',
  'Reconcile with books of accounts',
  'Prepare draft working',
  'Share draft with client for approval',
  'File return & share acknowledgement',
];

const RETAINER_NAMES = ['GST + ITR', 'Monthly Accounting', 'Annual Compliance Package', 'TDS + Payroll', 'Audit Retainer'];

const DOCUMENT_FILES = [
  'PAN Card.pdf',
  'Aadhaar Card.pdf',
  'Bank Statement FY 2025-26.pdf',
  'GST Registration Certificate.pdf',
  'Partnership Deed.docx',
  'Sales Register Sep-2026.xlsx',
  'Purchase Register Sep-2026.xlsx',
  'Electricity Bill.pdf',
  'Rent Agreement.pdf',
  'Form 16 FY 2025-26.pdf',
  'Balance Sheet FY 2025-26.xlsx',
  'Client Details.xlsx',
  'Board Resolution.docx',
];

const REGISTER_DOC_TYPES = ['DSC - Class-3', 'GST REGISTRATION ALL DOCUMENTS', 'Original PAN Card', 'Bank Statement (Hard copy)', 'Cheque Book', 'Audit File', 'Property Papers'];
const REGISTER_LOCATIONS = ['Cabinet A', 'Front desk', 'Locker 2', 'Shelf 3', 'Partner cabin', ''];

const PORTALS = ['Income Tax', 'GST', 'TRACES', 'MCA V3', 'EPFO', 'Professional Tax'];

export const EXPENSE_CATEGORIES = ['INCOME TAX PAYMENT', 'GST PAYMENT', 'ROC FEES', 'DSC PURCHASE', 'STAMP DUTY', 'COURIER CHARGES'];
export const PAYMENT_MODES = ['Bank Transfer', 'Cash', 'UPI', 'Cheque'];
export const RENEWAL_TYPES = ['DSC', 'Trade License', 'FSSAI License', 'Shop & Establishment', 'Insurance Policy', 'Import Export Code', 'Fire NOC'];
export const TASK_STATUSES = ['Pending', 'In-Progress', 'Hold', 'Completed'];

/* ---------- builders ---------- */

function makePan(rnd, client) {
  const three = Array.from({ length: 3 }, () => rnd.pick(LETTERS)).join('');
  const typeChar = PAN_TYPE_CHAR[client.type] ?? 'A';
  const initial = client.name.split(' ').at(-1)[0].toUpperCase();
  return `${three}${typeChar}${initial}${rnd.int(1000, 9999)}${rnd.pick(LETTERS)}`;
}

function buildDetails(rnd, client) {
  const [city, state, pinPrefix] = rnd.pick(PLACES);
  const pan = makePan(rnd, client);
  const isPerson = client.type === 'individual';
  const birthYear = isPerson ? rnd.int(1950, 1995) : rnd.int(1998, 2022);
  const email = `${client.name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '')}@example.com`;
  return {
    status: client.active ? 'Active' : 'Inactive',
    typeLabel: TYPE_LABELS.get(client.type) ?? 'Other',
    dateLabel: isPerson ? 'Date of Birth' : 'Date of Incorporation',
    date: isoOf(birthYear, rnd.int(1, 12), rnd.int(1, 28)),
    pan,
    gstin: isPerson ? '' : `${pad(rnd.int(1, 36))}${pan}1Z${rnd.pick(LETTERS)}`,
    contactPerson: rnd.pick(CONTACT_PEOPLE),
    mobile: client.mobile,
    email,
    address: `${rnd.int(1, 40)}-${rnd.int(100, 999)}/${rnd.int(1, 20)}, ${rnd.pick(STREETS)}, ${rnd.pick(LOCALITIES)}`,
    city,
    state,
    pincode: `${pinPrefix}${pad(rnd.int(1, 60))}`,
    autoInvoice: rnd.chance(0.7),
    allowNotifications: rnd.chance(0.85),
    allowLogin: rnd.chance(0.6),
    createdBy: rnd.pick(USER_NAMES),
    createdAt: `${isoOf(rnd.int(2023, 2025), rnd.int(1, 12), rnd.int(1, 28))}T${pad(rnd.int(9, 18))}:${pad(rnd.int(0, 59))}`,
  };
}

function buildServices(rnd, client) {
  const own = client.services.map((id) => SERVICE_BY_ID.get(id)).filter(Boolean);
  const extra = rnd.sample(
    RECURRING_SERVICES.filter((service) => !own.includes(service)),
    rnd.int(5, 9),
  );
  const availed = [...own, ...extra].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  const recurring = availed.filter((service) => serviceFrequency(service.name) !== 'one-time').slice(0, 7).map((service) => service.id);
  return { availed: availed.map((service) => service.id), recurring };
}

/** Recent periods for a service: [{ period, start (iso), due (iso) }]. */
function periodsFor(name, frequency) {
  const out = [];
  if (frequency === 'monthly') {
    for (let back = 1; back <= 4; back += 1) {
      const [y, m] = shiftMonth(TODAY_Y, TODAY_M, -back);
      const [ny, nm] = shiftMonth(y, m, 1);
      out.push({ period: monthPeriod(y, m), start: isoOf(ny, nm, 1), due: isoOf(ny, nm, dueDayFor(name)) });
    }
  } else if (frequency === 'quarterly') {
    const [ly, lm] = shiftMonth(TODAY_Y, TODAY_M, -1);
    let start = Math.floor((lm - 1) / 3) * 3 + 1;
    let year = ly;
    for (let i = 0; i < 2; i += 1) {
      const [ny, nm] = shiftMonth(year, start, 3);
      out.push({ period: quarterPeriod(year, start), start: isoOf(ny, nm, 1), due: isoOf(ny, nm, 28) });
      [year, start] = shiftMonth(year, start, -3);
    }
  } else if (frequency === 'yearly') {
    const fyStart = TODAY_M >= 4 ? TODAY_Y - 1 : TODAY_Y - 2;
    for (let i = 0; i < 2; i += 1) {
      const y = fyStart - i;
      out.push({ period: fyPeriod(y), start: isoOf(y + 1, 4, 1), due: isoOf(y + 1, 9, 30) });
    }
  } else {
    out.push({ period: fyPeriod(TODAY_M >= 4 ? TODAY_Y : TODAY_Y - 1), start: addDays(TODAY, -60), due: addDays(TODAY, 20) });
  }
  return out;
}

function buildTasks(rnd, services) {
  const tasks = [];
  let seq = 1;
  services.availed.forEach((serviceId) => {
    const service = SERVICE_BY_ID.get(serviceId);
    const frequency = serviceFrequency(service.name);
    periodsFor(service.name, frequency).forEach(({ period, start, due }) => {
      const overdue = due < TODAY;
      let status;
      if (start > TODAY) return;
      if (overdue) status = rnd.chance(0.55) ? 'Completed' : rnd.pick(['Pending', 'Pending', 'In-Progress', 'Hold']);
      else status = rnd.chance(0.75) ? 'Pending' : 'In-Progress';
      const users = rnd.sample(USER_NAMES, rnd.int(0, 2));
      const id = `t${seq++}`;
      tasks.push({
        id,
        kind: 'task',
        date: start,
        serviceId,
        serviceName: service.name,
        period,
        title: service.name,
        due,
        target: rnd.chance(0.4) ? addDays(due, -3) : '',
        completed: status === 'Completed' ? addDays(due, -rnd.int(0, 6)) : '',
        users,
        status,
        billed: status === 'Completed' && rnd.chance(0.5),
      });
      if (rnd.chance(0.3)) {
        rnd.sample(SUBTASK_TITLES, rnd.int(2, 3)).forEach((title) => {
          const subStatus = status === 'Completed' ? 'Completed' : rnd.pick(['Pending', 'Pending', 'Completed']);
          tasks.push({
            id: `t${seq++}`,
            kind: 'subtask',
            parentId: id,
            date: start,
            serviceId,
            serviceName: service.name,
            period,
            title,
            due: '',
            target: '',
            completed: subStatus === 'Completed' ? minDate(addDays(start, rnd.int(0, 6)), TODAY) : '',
            users,
            status: subStatus,
            billed: false,
          });
        });
      }
    });
  });
  return tasks.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id, 'en', { numeric: true }));
}

function buildRetainers(rnd) {
  return rnd.sample(RETAINER_NAMES, rnd.int(1, 3)).map((name, index) => {
    const amount = rnd.pick([1200, 2500, 6000, 12000, 18000, 24000, 36000]);
    const frequency = rnd.pick(['One-Time', 'Monthly', 'Quarterly', 'Yearly']);
    const billedShare = rnd.pick([1, 1, 0.5, 0.25, 0]);
    const billed = Math.round(amount * billedShare);
    return {
      id: `r${index + 1}`,
      name,
      period: rnd.pick(['2024-25', '2025-26', '2026-27']),
      frequency,
      recurring: frequency !== 'One-Time' || rnd.chance(0.5),
      amount,
      billed,
      active: rnd.chance(0.85),
    };
  });
}

/** Ledger entries in date order. Invoices carry line items. */
function buildLedger(rnd, services) {
  const start = addDays(TODAY, -420);
  const entries = [{ id: 'l0', date: start, kind: 'Opening Balance', number: '', debit: 0, credit: 0, items: [] }];
  let date = start;
  let invoiceNo = rnd.int(1, 20);
  let receiptNo = rnd.int(1, 10);
  const serviceNames = services.availed.map((id) => SERVICE_BY_ID.get(id).name);
  const count = rnd.int(5, 10);
  for (let i = 0; i < count; i += 1) {
    date = addDays(date, rnd.int(20, 60));
    if (date > TODAY) break;
    if (i === 0 || rnd.chance(0.7)) {
      const items = rnd.sample(serviceNames, rnd.int(1, 3)).map((name) => ({ name, amount: rnd.pick([500, 1000, 1500, 2500, 3500, 5000, 7500]) }));
      const taxable = items.reduce((sum, item) => sum + item.amount, 0);
      const gst = Math.round(taxable * 0.18);
      entries.push({ id: `l${i + 1}`, date, kind: 'Invoice', number: `#${invoiceNo++}`, debit: taxable + gst, credit: 0, items: [...items, { name: 'GST @ 18%', amount: gst }] });
    } else {
      entries.push({ id: `l${i + 1}`, date, kind: 'Receipt', number: `#${receiptNo++}`, debit: 0, credit: rnd.pick([2000, 5000, 7500, 10000, 15000]), items: [] });
    }
  }
  return entries;
}

function buildDocuments(rnd, tasks) {
  const files = rnd.sample(DOCUMENT_FILES, rnd.int(2, 6)).map((name, index) => ({
    id: `d${index + 1}`,
    name,
    size: rnd.int(40, 2400) * 1024,
    uploadedAt: addDays(TODAY, -rnd.int(5, 300)),
  }));
  const taskDocs = rnd.chance(0.55)
    ? rnd.sample(tasks.filter((task) => task.kind === 'task' && task.status === 'Completed'), rnd.int(1, 3)).map((task, index) => ({
        id: `td${index + 1}`,
        name: `${task.serviceName.replace(/[^\w]+/g, '_')}_${task.period.replace(/\W+/g, '')}_Acknowledgement.pdf`,
        task: `${task.serviceName} - ${task.period}`,
      }))
    : [];
  return { files, taskDocs };
}

function buildRegister(rnd) {
  return Array.from({ length: rnd.int(0, 4) }, (_, index) => ({
    id: `g${index + 1}`,
    date: addDays(TODAY, -rnd.int(30, 600)),
    docType: rnd.pick(REGISTER_DOC_TYPES),
    category: rnd.chance(0.65) ? 'Received' : 'Given',
    returnable: rnd.chance(0.3),
    location: rnd.pick(REGISTER_LOCATIONS),
    notes: rnd.chance(0.3) ? 'Collected by client representative' : '',
  })).sort((a, b) => a.date.localeCompare(b.date));
}

function buildPasswords(rnd, details) {
  return rnd.sample(PORTALS, rnd.int(1, 4)).map((portal, index) => {
    let username = details.pan;
    if (portal === 'GST') username = details.gstin || `${details.pan.toLowerCase()}_gst`;
    if (portal === 'TRACES') username = `${details.pan.slice(0, 5)}T${rnd.int(100, 999)}`;
    if (portal === 'EPFO') username = `PF${rnd.int(100000, 999999)}`;
    if (portal === 'MCA V3' || portal === 'Professional Tax') username = details.email;
    return {
      id: `p${index + 1}`,
      portal,
      username,
      password: `Demo@${rnd.int(1000, 9999)}${rnd.pick(['ab', 'xy', 'pq', 'mn'])}`,
    };
  });
}

function buildExpenses(rnd) {
  return Array.from({ length: rnd.int(0, 4) }, (_, index) => ({
    id: `e${index + 1}`,
    date: addDays(TODAY, -rnd.int(10, 250)),
    category: rnd.pick(EXPENSE_CATEGORIES),
    mode: rnd.pick(PAYMENT_MODES),
    notes: rnd.chance(0.35) ? 'Paid on behalf of client' : '',
    amount: rnd.pick([250, 500, 1200, 2500, 4800, 7500]),
    billed: rnd.chance(0.4),
  })).sort((a, b) => b.date.localeCompare(a.date));
}

function buildQuotations(rnd, services) {
  const names = services.availed.map((id) => SERVICE_BY_ID.get(id).name);
  return Array.from({ length: rnd.int(0, 3) }, (_, index) => {
    const date = addDays(TODAY, -rnd.int(10, 200));
    return {
      id: `q${index + 1}`,
      number: `QT-${pad(rnd.int(10, 99))}${index}`,
      date,
      validTill: addDays(date, 30),
      services: rnd.sample(names, rnd.int(1, 3)),
      amount: rnd.pick([5000, 8500, 12000, 18000, 25000, 40000]),
      status: rnd.pick(['Draft', 'Sent', 'Accepted', 'Rejected']),
    };
  });
}

function buildNotes(rnd) {
  const texts = ['Client prefers WhatsApp for document requests.', 'Send GST working before the 15th every month.', 'Bank statement for March pending from client.'];
  return rnd.sample(texts, rnd.int(0, 2)).map((text, index) => ({
    id: `n${index + 1}`,
    author: rnd.pick(USER_NAMES),
    text,
    at: `${addDays(TODAY, -rnd.int(2, 40))}T${pad(rnd.int(10, 18))}:${pad(rnd.int(0, 59))}`,
  }));
}

/* ---------- public API ---------- */

export function findClient(id) {
  return CLIENTS.find((client) => client.id === String(id)) ?? null;
}

/** Full dashboard dataset for one client, or null for an unknown id. */
export function buildClientDashboard(id) {
  const client = findClient(id);
  if (!client) return null;
  const rnd = createRandom(`client:${client.id}`);
  const details = buildDetails(rnd, client);
  const services = buildServices(rnd, client);
  const tasks = buildTasks(rnd, services);
  return {
    client,
    details,
    services,
    tasks,
    retainers: buildRetainers(rnd),
    ledger: buildLedger(rnd, services),
    documents: buildDocuments(rnd, tasks),
    register: buildRegister(rnd),
    passwords: buildPasswords(rnd, details),
    expenses: buildExpenses(rnd),
    quotations: buildQuotations(rnd, services),
    notes: buildNotes(rnd),
  };
}

/** Renewals across all clients (about two thirds of clients have some). */
export function buildAllRenewals() {
  const rows = [];
  CLIENTS.forEach((client) => {
    const rnd = createRandom(`renewals:${client.id}`);
    if (!rnd.chance(0.65)) return;
    rnd.sample(RENEWAL_TYPES, rnd.int(1, 2)).forEach((type, index) => {
      const issue = addDays(TODAY, -rnd.int(60, 900));
      rows.push({
        id: `${client.id}-${index + 1}`,
        type,
        clientId: client.id,
        clientName: client.name,
        issue,
        expiry: addDays(issue, rnd.pick([365, 730, 1095])),
        notes: rnd.chance(0.35) ? 'Remind client 30 days before expiry' : '',
        createdBy: rnd.pick(USER_NAMES),
      });
    });
  });
  return rows.sort((a, b) => a.expiry.localeCompare(b.expiry));
}

export const serviceName = (id) => SERVICE_BY_ID.get(id)?.name ?? id;
export const TEAM_USERS_LABELS = USER_NAMES;
