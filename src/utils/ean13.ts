/**
 * EAN-13 GS1 Utilities
 * Calculates official modulo-10 check digit and validates EAN-13 barcodes
 */

export function calculateEan13CheckDigit(first12Digits: string): number {
  if (first12Digits.length < 12) return 0;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(first12Digits[i], 10);
    if (isNaN(digit)) return 0;
    // Odd positions (0-indexed: 0, 2, 4...) multiplied by 1, even positions (1, 3, 5...) by 3
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

export function isValidEan13(code: string): boolean {
  const clean = code.trim().replace(/\D/g, '');
  if (clean.length !== 13) return false;
  const first12 = clean.slice(0, 12);
  const expectedCheck = calculateEan13CheckDigit(first12);
  return parseInt(clean[12], 10) === expectedCheck;
}

/**
 * Generate a valid 13-digit EAN-13 barcode with mathematically correct check digit
 */
export function generateValidEan13(): string {
  // 890 is standard GS1 prefix for retail in India
  const prefix = '890';
  let body = '';
  for (let i = 0; i < 9; i++) {
    body += Math.floor(Math.random() * 10).toString();
  }
  const first12 = prefix + body;
  const checkDigit = calculateEan13CheckDigit(first12);
  return first12 + checkDigit.toString();
}
