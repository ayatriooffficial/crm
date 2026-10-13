/*
 * Tags carry a colour tone. Class strings are written out in full so
 * Tailwind's source scanner can find them.
 */
const TONES = {
  blue: { textClass: 'text-[#2b78c2]', chipClass: 'bg-[#e7f1fb] text-[#2b78c2]' },
  purple: { textClass: 'text-[#9b3fb8]', chipClass: 'bg-[#f5e9f9] text-[#9b3fb8]' },
  green: { textClass: 'text-[#22a05a]', chipClass: 'bg-[#e6f6ec] text-[#1d8a4d]' },
  red: { textClass: 'text-[#d7383b]', chipClass: 'bg-[#fdeaea] text-[#c62f32]' },
  orange: { textClass: 'text-[#d97a14]', chipClass: 'bg-[#fdf1e3] text-[#b86410]' },
  teal: { textClass: 'text-[#138a8a]', chipClass: 'bg-[#e3f4f4] text-[#117a7a]' },
};

const tag = (value, label, tone) => ({ value, label, ...TONES[tone] });

export const CLIENT_TAGS = [
  tag('15cb', '15CB', 'blue'),
  tag('aadhar-pan-link', 'Aadhar Pan Link', 'blue'),
  tag('annual-filing', 'annual filing', 'blue'),
  tag('annual-process', 'ANNUAL PROCESS', 'blue'),
  tag('high-value', 'High Value', 'purple'),
  tag('ayushman-card', 'Ayushman Card', 'purple'),
  tag('consultancy-fee', 'Consultancy fee', 'green'),
  tag('defendant', 'Defendant', 'red'),
  tag('gst-monthly', 'GST Monthly', 'teal'),
  tag('income-tax', 'Income Tax', 'orange'),
  tag('litigation', 'Litigation', 'red'),
  tag('new-client', 'New Client', 'green'),
  tag('priority', 'Priority', 'red'),
  tag('tds', 'TDS', 'blue'),
  tag('trust-audit', 'Trust Audit', 'purple'),
];
