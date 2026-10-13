import { useCallback } from 'react';
import { CUSTOMER_FILE_SECTIONS } from '@/data/customerFiles';
import { PAN_PATTERN } from '@/lib/gstin';

/*
 * State is grouped by card so each memoised card receives only its own
 * slice: typing in "Email" re-renders Contact Details and nothing else.
 */

/**
 * Spreadsheet behaviour: a grid always ends with one blank line, so filling
 * the last line opens the next one and there is no "Add" button.
 */
function withTrailingBlank(rows, isBlank, makeRow) {
  const last = rows.at(-1);
  if (last && isBlank(last)) return rows;
  const nextKey = Math.max(0, ...rows.map((row) => row.key)) + 1;
  return [...rows, makeRow(nextKey)];
}

/* Customer Files: one grid per section, rows shaped by the section's columns. */
const FILE_SECTIONS = Object.fromEntries(CUSTOMER_FILE_SECTIONS.map((section) => [section.value, section]));

function emptyFileRow(sectionId, key) {
  return { key, ...Object.fromEntries(FILE_SECTIONS[sectionId].columns.map((column) => [column.key, ''])) };
}

/** True while a Customer Files line has nothing typed or attached. */
export function isBlankFileRow(row) {
  return Object.entries(row).every(([field, value]) => field === 'key' || value === '' || value == null);
}

const withTrailingFileRow = (sectionId, rows) =>
  withTrailingBlank(rows, isBlankFileRow, (key) => emptyFileRow(sectionId, key));

/** Every grid starts with a single blank line; filling it opens the next one. */
function initialCustomerFiles() {
  return Object.fromEntries(CUSTOMER_FILE_SECTIONS.map(({ value: sectionId }) => [sectionId, [emptyFileRow(sectionId, 1)]]));
}

export const initialClientState = {
  basic: {
    photo: null,
    isActive: true,
    clientName: '',
    type: null,
    group: null,
    pan: '',
    dob: '',
  },
  contact: {
    mobile: '',
    secondaryMobile: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    state: null,
  },
  customerFiles: initialCustomerFiles(),
  errors: { basic: {}, contact: {} },
  status: 'idle',
};

function withoutError(errors, section, field) {
  if (!errors[section]?.[field]) return errors;
  const { [field]: _removed, ...rest } = errors[section];
  return { ...errors, [section]: rest };
}

export function clientFormReducer(state, action) {
  switch (action.type) {
    case 'set': {
      const { section, field, value } = action;
      return {
        ...state,
        [section]: { ...state[section], [field]: value },
        errors: withoutError(state.errors, section, field),
        status: state.status === 'saved' ? 'idle' : state.status,
      };
    }
    case 'updateFileRow': {
      const { section, key, field, value } = action;
      const column = FILE_SECTIONS[section].columns.find((c) => c.key === field);
      const filled = { [field]: value, ...column?.lookup?.(value) };
      const rows = state.customerFiles[section].map((row) => (row.key === key ? { ...row, ...filled } : row));
      return {
        ...state,
        customerFiles: { ...state.customerFiles, [section]: withTrailingFileRow(section, rows) },
        status: state.status === 'saved' ? 'idle' : state.status,
      };
    }
    case 'removeFileRow': {
      const { section, key } = action;
      const rows = state.customerFiles[section].filter((row) => row.key !== key);
      return { ...state, customerFiles: { ...state.customerFiles, [section]: withTrailingFileRow(section, rows) } };
    }
    case 'setErrors':
      return { ...state, errors: action.errors };
    case 'autofill': {
      const { pan, state: stateCode, legalName, type, address, city, pincode } = action.data;
      const defined = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null && v !== ''));
      return {
        ...state,
        basic: { ...state.basic, ...defined({ pan, clientName: legalName, type }) },
        contact: { ...state.contact, ...defined({ state: stateCode, address, city, pincode }) },
        errors: {
          ...state.errors,
          basic: Object.fromEntries(
            Object.entries(state.errors.basic).filter(([key]) => !['pan', 'clientName', 'type'].includes(key)),
          ),
        },
      };
    }
    case 'status':
      return { ...state, status: action.status };
    default:
      return state;
  }
}

/** Stable `(value, field) => void` setter for one section of the form. */
export function useSectionSetter(dispatch, section) {
  return useCallback((value, field) => dispatch({ type: 'set', section, field, value }), [dispatch, section]);
}

export const fieldId = (section, field) => `${section}-${field}`;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^[6-9]\d{9}$/;
const PINCODE_PATTERN = /^\d{6}$/;

/** Returns errors grouped by section; empty objects mean the section is valid. */
export function validateClient({ basic, contact }) {
  const errors = { basic: {}, contact: {} };

  if (!basic.clientName.trim()) errors.basic.clientName = 'Client Name is required';
  if (!basic.type) errors.basic.type = 'Type is required';
  if (basic.pan && !PAN_PATTERN.test(basic.pan)) errors.basic.pan = 'Enter a valid PAN, e.g. ABCDE1234F';

  if (contact.mobile && !MOBILE_PATTERN.test(contact.mobile)) errors.contact.mobile = 'Enter a valid 10-digit mobile number';
  if (contact.secondaryMobile && !MOBILE_PATTERN.test(contact.secondaryMobile)) {
    errors.contact.secondaryMobile = 'Enter a valid 10-digit mobile number';
  }
  if (contact.email && !EMAIL_PATTERN.test(contact.email.trim())) errors.contact.email = 'Enter a valid email address';
  if (contact.pincode && !PINCODE_PATTERN.test(contact.pincode)) errors.contact.pincode = 'Enter a valid 6-digit pincode';

  return errors;
}

/** Visual order of validated fields, used to focus the first error. */
const FIELD_ORDER = [
  ['basic', 'clientName'],
  ['basic', 'type'],
  ['basic', 'pan'],
  ['contact', 'mobile'],
  ['contact', 'secondaryMobile'],
  ['contact', 'email'],
  ['contact', 'pincode'],
];

export function firstInvalidFieldId(errors) {
  const match = FIELD_ORDER.find(([section, field]) => errors[section][field]);
  return match ? fieldId(...match) : null;
}

/* Input formatters (module-level so memoised fields keep stable props). */
export const toUpperAlnum = (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');
export const toDigits = (value) => value.replace(/\D/g, '');

/** Keeps a money amount to digits with at most two decimals. */
export const toAmount = (value) => {
  const [whole = '', ...rest] = value.replace(/[^\d.]/g, '').split('.');
  return rest.length ? `${whole}.${rest.join('').slice(0, 2)}` : whole;
};
