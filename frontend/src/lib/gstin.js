/*
 * Front-end-only GSTIN "lookup". A GSTIN encodes the state (chars 1–2)
 * and the PAN (chars 3–12), so those are always derivable. A small mock
 * registry stands in for the GST portal for a couple of sample numbers.
 */

export const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const SAMPLE_GSTIN = '24AAKCA1234F1Z5';

const MOCK_REGISTRY = {
  '24AAKCA1234F1Z5': {
    legalName: 'SUNRISE ENTERPRISES PRIVATE LIMITED',
    type: 'private-limited',
    address: '402, Sample Plaza, MG Road',
    city: 'Ahmedabad',
    pincode: '380015',
  },
  '27AABFV5678K1ZP': {
    legalName: 'MAPLE TRADING CO',
    type: 'partnership',
    address: 'Unit 12, Demo Industrial Estate',
    city: 'Mumbai',
    pincode: '400093',
  },
};

const LOOKUP_DELAY_MS = 450;

export function normalizeGstin(value) {
  return value.replace(/\s+/g, '').toUpperCase();
}

/** Resolves `{ data }` or `{ error }` after a short simulated network delay. */
export async function fetchGstinDetails(rawGstin) {
  const gstin = normalizeGstin(rawGstin ?? '');

  if (!gstin) return { error: 'Enter a GSTIN to look up.' };
  if (!GSTIN_PATTERN.test(gstin)) return { error: 'Enter a valid 15-character GSTIN, e.g. 24AAKCA1234F1Z5.' };

  await new Promise((resolve) => setTimeout(resolve, LOOKUP_DELAY_MS));

  return {
    data: {
      gstin,
      pan: gstin.slice(2, 12),
      state: gstin.slice(0, 2),
      ...MOCK_REGISTRY[gstin],
    },
  };
}
