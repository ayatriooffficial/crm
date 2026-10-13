/**
 * Dummy clients for the Clients list. All names are fictional and every
 * mobile number uses the 98765 0xxxx placeholder range.
 * `type` → CLIENT_TYPES, `tags` → CLIENT_TAGS, `services` → RECURRING_SERVICES ids.
 */
const RAW = [
  ['Apex Auto Works', '', 'others', '', '', [], true, []],
  ['Asha Kulkarni', '', 'individual', '9876500001', '', [], true, []],
  ['Atlas Travels', '', 'proprietorship', '9876500002', '', [], true, []],
  ['Bharat Traders', '', 'individual', '', 'GST REGISTRATION', ['15cb', 'gst-monthly'], true, []],
  ['Blue Lagoon Cafe', '', 'private-limited', '', '', [], true, []],
  ['Coastal Exports', '012', 'individual', '9876500003', 'AUDIT', ['income-tax'], true, ['Aarav']],
  ['Daksh Mehra', '014', 'individual', '9876500004', 'Verma Family', ['aadhar-pan-link'], true, ['Isha']],
  ['Delta Foods', '017', 'individual', '9876500005', 'Delta Foods Family', [], true, ['Kabir']],
  ['Evergreen Textiles', '021', 'partnership', '9876500006', 'Evergreen Textiles', ['annual-filing', 'tds'], true, ['Ananya Rao', 'Neel']],
  ['Falcon Couriers', '022', 'partnership', '9876500007', 'Evergreen Textiles', [], false, []],
  ['Gautam Iyer', '', 'individual', '9876500008', '', [], true, []],
  ['Greenfield Agro', '027', 'individual', '9876500009', '', ['consultancy-fee'], true, ['CS Team']],
  ['Harbor Logistics', '031', 'individual', '9876500010', 'Sharma Family', [], true, ['Aarav']],
  ['Indigo Pharma', '035', 'proprietorship', '9876500011', 'GST Monthly', ['gst-monthly'], true, []],
  ['Jade Jewellers', '044', 'proprietorship', '9876500012', 'GST Monthly', ['gst-monthly', 'tds', 'priority'], true, ['Isha']],
  ['Kiran Industries', '049', 'llp', '9876500013', '', [], false, []],
  ['Lotus Hardware', '058', 'private-limited', '9876500014', 'AUDIT', ['trust-audit'], true, ['Ananya Rao']],
  ['Maple Agencies', '066', 'private-limited', '9876500015', '', ['new-client'], true, []],
  ['Nova Plastics', '073', 'partnership', '9876500016', 'Yearly', [], true, ['Meera Nair']],
  ['Pinnacle Steel', '096', 'proprietorship', '9876500017', 'Pinnacle Steel', ['defendant', 'litigation'], true, ['Neel']],
];

const SERVICE_SETS = [['gstr-3b-monthly', 'gstr-1-monthly'], ['itr-1'], ['tax-audit-3cd', 'audit'], ['tds-return-quarterly']];

export const CLIENTS = RAW.map(([name, fileNo, type, mobile, group, tags, active, users], index) => ({
  // Numeric ids, like the original app's /view-client/267995 URLs.
  id: String(267981 + index),
  name,
  fileNo,
  type,
  mobile,
  group,
  tags,
  active,
  users,
  services: SERVICE_SETS[index % SERVICE_SETS.length],
}));
