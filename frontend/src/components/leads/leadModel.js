import { STATES } from '@/data/states';
import { PAN_PATTERN } from '@/lib/gstin';

/*
 * Lead fields, taken from MySampleData.xlsx (sheet "PromoterMaster").
 * Field `kind` decides the control: text (default), date, select, secret,
 * file (document name only), photo, or derived (read-only, computed like
 * the sheet's formulas). `format` cleans typed input.
 */
const GENDERS = ['Male', 'Female', 'Others', 'Transgender'].map((label) => ({ value: label, label }));
const STATE_OPTIONS = STATES.map(({ label }) => ({ value: label, label }));

const digits = (value) => value.replace(/\D/g, '');
const upperAlnum = (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

export const LEAD_SECTIONS = [
  {
    title: 'Personal Details',
    fields: [
      { key: 'photo', label: 'Photo', kind: 'photo' },
      { key: 'firstName', label: 'First Name', required: true, autoComplete: 'given-name' },
      { key: 'middleName', label: 'Middle Name', autoComplete: 'additional-name' },
      { key: 'lastName', label: 'Last Name', autoComplete: 'family-name' },
      { key: 'fullName', label: 'Party Full Name', kind: 'derived' },
      { key: 'abbreviation', label: 'Abbreviation' },
      { key: 'dob', label: 'Date of Birth', kind: 'date' },
      { key: 'gender', label: 'Gender', kind: 'select', options: GENDERS },
    ],
  },
  {
    title: 'Contact Details',
    fields: [
      { key: 'aadhaarMobile', label: 'Mobile No Linked with Aadhaar', format: digits, maxLength: 10, inputMode: 'numeric' },
      { key: 'mobile', label: 'Communication Mobile', format: digits, maxLength: 10, inputMode: 'numeric', autoComplete: 'tel-national' },
      { key: 'email', label: 'Communication Mail ID', inputMode: 'email', autoComplete: 'email' },
    ],
  },
  {
    title: 'Identity & Documents',
    fields: [
      { key: 'pan', label: 'PAN No', format: upperAlnum, maxLength: 10 },
      { key: 'panAttachment', label: 'PAN Attachment', kind: 'file' },
      { key: 'aadhaar', label: 'Aadhaar No', format: digits, maxLength: 12, inputMode: 'numeric' },
      { key: 'aadhaarAttachment', label: 'Aadhaar Attachment', kind: 'file' },
      { key: 'din', label: 'DIN / DPIN No', format: digits, maxLength: 8, inputMode: 'numeric' },
      { key: 'dinAttachment', label: 'DIN Attachment', kind: 'file' },
      { key: 'mcaId', label: 'MCA V3 ID' },
      { key: 'mcaPassword', label: 'MCA V3 PW', kind: 'secret' },
    ],
  },
  {
    title: 'Address Details',
    fields: [
      { key: 'address', label: 'Address', multiline: true, wide: true, autoComplete: 'street-address' },
      { key: 'country', label: 'Country', autoComplete: 'country-name' },
      { key: 'state', label: 'State Name', kind: 'select', options: STATE_OPTIONS, searchable: true },
      { key: 'pincode', label: 'Pin Code', format: digits, maxLength: 6, inputMode: 'numeric', autoComplete: 'postal-code' },
      { key: 'nationality', label: 'Nationality', kind: 'derived' },
      { key: 'policeStation', label: 'Police Station' },
      { key: 'postOffice', label: 'Post Office' },
    ],
  },
  {
    title: 'Other Details',
    fields: [{ key: 'referredBy', label: 'Referred By' }],
  },
];

const FIELDS_BY_KEY = new Map(LEAD_SECTIONS.flatMap((section) => section.fields).map((field) => [field.key, field]));

/** Table columns in the sheet's column order (Photo shows next to the name). */
export const TABLE_COLUMNS = [
  'fullName', 'firstName', 'middleName', 'lastName', 'abbreviation', 'dob', 'aadhaarMobile', 'mobile', 'email',
  'pan', 'panAttachment', 'aadhaar', 'aadhaarAttachment', 'gender', 'address', 'country', 'state', 'pincode',
  'nationality', 'policeStation', 'postOffice', 'din', 'mcaId', 'mcaPassword', 'dinAttachment', 'referredBy',
].map((key) => FIELDS_BY_KEY.get(key));

const INPUT_FIELDS = LEAD_SECTIONS.flatMap((section) => section.fields).filter((field) => field.kind !== 'derived');

export function emptyLead() {
  const lead = Object.fromEntries(INPUT_FIELDS.map((field) => [field.key, '']));
  return { ...lead, photo: null, panAttachment: null, aadhaarAttachment: null, dinAttachment: null, country: 'India' };
}

/** Party Full Name = First + Middle + Last; Nationality = Indian if Country is India, else NRI (as in the sheet). */
export function derivedFields(lead) {
  return {
    fullName: [lead.firstName, lead.middleName, lead.lastName].map((part) => part.trim()).filter(Boolean).join(' '),
    nationality: lead.country.trim().toLowerCase() === 'india' ? 'Indian' : 'NRI',
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^[6-9]\d{9}$/;

/** Field errors keyed by field; an empty object means the lead can be saved. */
export function validateLead(lead) {
  const errors = {};
  if (!lead.firstName.trim()) errors.firstName = 'First Name is required';
  if (lead.aadhaarMobile && !MOBILE_PATTERN.test(lead.aadhaarMobile)) errors.aadhaarMobile = 'Enter a valid 10-digit mobile number';
  if (lead.mobile && !MOBILE_PATTERN.test(lead.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number';
  if (lead.email && !EMAIL_PATTERN.test(lead.email.trim())) errors.email = 'Enter a valid email address';
  if (lead.pan && !PAN_PATTERN.test(lead.pan)) errors.pan = 'Enter a valid PAN, e.g. ABCDE1234F';
  if (lead.aadhaar && lead.aadhaar.length !== 12) errors.aadhaar = 'Aadhaar No must be 12 digits';
  if (lead.din && lead.din.length !== 8) errors.din = 'DIN must be 8 digits';
  if (lead.pincode && lead.pincode.length !== 6) errors.pincode = 'Pin Code must be 6 digits';
  return errors;
}

/** Field ids in form order, used to focus the first invalid field on save. */
export const FIELD_ORDER = INPUT_FIELDS.map((field) => field.key);
export const leadFieldId = (key) => `lead-${key}`;

/*
 * Frontend-only storage until the backend has a leads API: the list lives in
 * this browser's localStorage. Attachments keep only the file name; the photo
 * is stored as a small thumbnail.
 */
const STORAGE_KEY = 'crm.leads.v1';

export function loadLeads() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function saveLeads(leads) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    return true;
  } catch {
    return false;
  }
}

/** Shrinks a picked image to a JPEG data URL small enough to keep in localStorage. */
export async function toThumbnail(file, size = 160) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height));
  const canvas = Object.assign(document.createElement('canvas'), {
    width: Math.round(bitmap.width * scale),
    height: Math.round(bitmap.height * scale),
  });
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.8);
}
