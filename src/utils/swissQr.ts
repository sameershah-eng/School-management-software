import QRCode from 'qrcode';

/**
 * Validates Swiss IBAN format (CHxx xxxx xxxx xxxx xxxx x)
 */
export function isValidSwissIBAN(iban: string): boolean {
  const clean = iban.replace(/\s+/g, '').toUpperCase();
  if (!clean.startsWith('CH') && !clean.startsWith('LI')) return false;
  if (clean.length !== 21) return false;
  
  // Basic IBAN Modulo 97 check
  const rearranged = clean.slice(4) + clean.slice(0, 4);
  const numeric = rearranged
    .split('')
    .map(c => {
      const code = c.charCodeAt(0);
      return code >= 65 && code <= 90 ? (code - 55).toString() : c;
    })
    .join('');

  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    const chunk = remainder.toString() + numeric.substring(i, Math.min(i + 7, numeric.length));
    remainder = parseInt(chunk, 10) % 97;
  }
  return remainder === 1;
}

/**
 * Formats IBAN into standard 4-character blocks
 */
export function formatIBAN(iban: string): string {
  const clean = iban.replace(/\s+/g, '').toUpperCase();
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Computes Modulo 10 recursive check digit for Swiss QR-Reference
 */
export function calculateMod10(input: string): number {
  const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
  let carry = 0;
  for (let i = 0; i < input.length; i++) {
    const digit = parseInt(input[i], 10);
    carry = table[(carry + digit) % 10];
  }
  return (10 - carry) % 10;
}

/**
 * Generates a standard 27-digit Swiss QR-reference number
 */
export function generateSwissQRReference(numericId: number | string): string {
  const padded = String(numericId).padStart(26, '0');
  const checkDigit = calculateMod10(padded);
  return `${padded}${checkDigit}`;
}

/**
 * Formats a 27-digit Swiss QR-reference with spacing (e.g., 21 00000 00003 13947 11300 09917)
 */
export function formatSwissQRReference(reference: string): string {
  const clean = reference.replace(/\s+/g, '');
  if (clean.length !== 27) return reference;
  return `${clean.slice(0, 2)} ${clean.slice(2, 7)} ${clean.slice(7, 12)} ${clean.slice(12, 17)} ${clean.slice(17, 22)} ${clean.slice(22, 27)}`;
}

/**
 * Formats numbers into Swiss currency string (e.g. 1'450.00)
 */
export function formatSwissCHF(amount: number): string {
  const fixed = amount.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${formattedInt}.${decPart}`;
}

/**
 * Formats ISO date to Swiss DD.MM.YYYY
 */
export function formatSwissDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export interface SwissQRBillData {
  creditor: {
    iban: string;
    name: string;
    street: string;
    postalCode: string;
    city: string;
    country: string; // 'CH'
  };
  debtor?: {
    name: string;
    street: string;
    postalCode: string;
    city: string;
    country: string; // 'CH'
  };
  amount: number;
  currency: 'CHF';
  reference: string; // 27 digit QRR or empty for NON
  referenceType: 'QRR' | 'NON' | 'SCOR';
  unstructuredMessage?: string;
  billInformation?: string;
}

/**
 * Builds the official SIX Swiss Payment Standards (SPC) text payload
 */
export function buildSwissQRPayload(data: SwissQRBillData): string {
  const cr = data.creditor;
  const db = data.debtor;
  const cleanIban = cr.iban.replace(/\s+/g, '').toUpperCase();
  const amountStr = data.amount > 0 ? data.amount.toFixed(2) : '';

  const lines: string[] = [
    'SPC', // Header
    '0200', // Version 2.0
    '1', // Coding: Latin / UTF-8
    cleanIban, // Creditor Account
    'S', // Address Type: Structured
    cr.name.substring(0, 70), // Name
    cr.street.substring(0, 70), // Street and building
    '', // Building number (empty if street has both)
    cr.postalCode.substring(0, 16), // Postal Code
    cr.city.substring(0, 35), // Town
    cr.country || 'CH', // Country
    '', '', '', '', '', '', '', // Ultimate Creditor (7 empty lines)
    amountStr, // Amount
    data.currency, // Currency
    db ? 'S' : '', // Debtor address type
    db ? db.name.substring(0, 70) : '',
    db ? db.street.substring(0, 70) : '',
    '',
    db ? db.postalCode.substring(0, 16) : '',
    db ? db.city.substring(0, 35) : '',
    db ? (db.country || 'CH') : '',
    data.referenceType, // Reference Type
    data.referenceType === 'NON' ? '' : data.reference.replace(/\s+/g, ''),
    data.unstructuredMessage ? data.unstructuredMessage.substring(0, 140) : '',
    'EPD', // Trailer: End Payment Data
    data.billInformation ? data.billInformation.substring(0, 140) : ''
  ];

  return lines.join('\r\n');
}

/**
 * Generates Swiss QR Code as DataURL with high error-correction level 'M' per standard
 */
export async function generateSwissQRCodeDataURL(payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 400,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Failed to generate QR Code data URL', error);
    return '';
  }
}
