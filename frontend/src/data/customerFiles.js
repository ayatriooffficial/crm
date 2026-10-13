/*
 * Sections of the "Customer Files" card on the New Client form, laid out as
 * in MySampleData.xlsx (sheet "ClientMaster"; dropdown lists and the
 * promoter lookup come from that workbook).
 *
 * Every section is an editable spreadsheet-style grid that starts with one
 * blank line, like Items. A column's `type`
 * decides its cell:
 *   text (default) · number · currency (right-aligned amount) ·
 *   select (dropdown of `options`) · secret (password input with show/hide) ·
 *   file (attach a document).
 * `uppercase` and `maxLength` apply to text cells (PAN, ID numbers). A select
 * column's `lookup(value)` returns other fields of the line to fill in.
 */
const toOptions = (labels) => [...new Set(labels)].map((label) => ({ value: label, label }));

/** Sheet "PromoterMaster": picking a promoter fills PAN and MCA login, like the sheet's VLOOKUPs. */
const PROMOTERS = [
  { name: 'MD TAUSEF AHMED', pan: 'APNPA2652N', mcaId: 'sabmiswb@gmail.com', mcaPassword: 'Jiban@12' },
  { name: 'MD AZIZUL MIDDYA', pan: 'BPNPB2655N', mcaId: 'afaque_27@yahoo.co.in', mcaPassword: 'Jiban@12' },
];

function lookupPromoter(name) {
  const promoter = PROMOTERS.find((p) => p.name === name);
  return { pan: promoter?.pan ?? '', mcaId: promoter?.mcaId ?? '', mcaPassword: promoter?.mcaPassword ?? '' };
}

/* First-column dropdown lists from sheet "ClientMaster" (columns R and S). */
const STATUTORY_TYPES = toOptions(['PAN', 'TAN', 'Traces', 'ROC', 'EPFO', 'ESIC', 'P-Tax', 'P-Tax Registration']);

const SERVICE_CATEGORIES = toOptions([
  'E.P.F.P',
  'E.S.I.C',
  'G.S.T',
  'Import Export',
  'Income Tax',
  'M.S.M.E',
  'Profession Tax',
  'R.O.C',
  'Shram Suvida',
  'Trade License',
]);

export const CUSTOMER_FILE_SECTIONS = [
  {
    value: 'promoter',
    label: 'Promoter Details',
    columns: [
      {
        key: 'name',
        label: 'Promoter Name',
        type: 'select',
        options: toOptions(PROMOTERS.map((p) => p.name)),
        lookup: lookupPromoter,
        width: 'w-56',
      },
      { key: 'pan', label: 'PAN', width: 'w-32', uppercase: true, maxLength: 10 },
      { key: 'share', label: '% of Share / Nos of Share', type: 'number', width: 'w-44' },
      { key: 'designation', label: 'Designation', width: 'w-40' },
      { key: 'mcaId', label: 'MCA ID (If Director)', width: 'w-56' },
      { key: 'mcaPassword', label: 'MCA PW (If Director)', type: 'secret', width: 'w-48' },
    ],
  },
  {
    value: 'statutory',
    label: 'Statutory Details',
    columns: [
      { key: 'type', label: 'Statutory Type', type: 'select', options: STATUTORY_TYPES, width: 'w-40' },
      { key: 'idNo', label: 'ID No', width: 'w-60', uppercase: true },
      { key: 'userId', label: 'User ID', width: 'w-52' },
      { key: 'password', label: 'Password', type: 'secret', width: 'w-48' },
      { key: 'attachment', label: 'Attachment', type: 'file', width: 'w-48' },
    ],
  },
  {
    value: 'recurring',
    label: 'Recurring Service Obtained',
    columns: [
      { key: 'category', label: 'Service Category', type: 'select', options: SERVICE_CATEGORIES, width: 'w-48' },
      { key: 'service', label: 'Service Name', width: 'w-60' },
      { key: 'tariff', label: 'Tariff', type: 'currency', width: 'w-36' },
    ],
  },
];
