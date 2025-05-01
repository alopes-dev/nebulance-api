/**
 * Parses a currency amount from a string, handling different international number formats.
 * Supports US format (1,234.56), European format (1.234,56), and Swiss format (1'234.56)
 *
 * @param text - The currency amount string to parse
 * @returns The parsed number or null if invalid
 */
export function parseCurrencyAmount(text: string): number | null {
  // Step 1: Clean the input
  let cleanedText = text
    .replace(/[^\d.,'\-+]/g, "") // Keep only numbers and separators
    .replace(/'/g, ""); // Remove Swiss-style thousand separators

  // Step 2: Determine number format and normalize
  const hasComma = cleanedText.includes(",");
  const hasDot = cleanedText.includes(".");

  if (hasComma && hasDot) {
    text = normalizeMultipleSeparators(cleanedText);
  } else if (hasComma) {
    text = normalizeCommaSeparator(cleanedText);
  }
  // Step 3: Parse and validate
  const parsedNumber = parseFloat(text);
  return isNaN(parsedNumber) ? null : parsedNumber;
}

/**
 * Handles numbers with both comma and dot separators
 */
function normalizeMultipleSeparators(text: string): string {
  const isEuropeanFormat = text.lastIndexOf(",") > text.lastIndexOf(".");

  if (isEuropeanFormat) {
    // European format: 1.234,56 -> 1234.56
    return text.replace(/\./g, "").replace(",", ".");
  } else {
    // US format: 1,234.56 -> 1234.56
    return text.replace(/,/g, "");
  }
}

/**
 * Handles numbers with only comma separators
 */
function normalizeCommaSeparator(text: string): string {
  const commaCount = (text.match(/,/g) || []).length;
  const digitsAfterComma = text.split(",")[1]?.length || 0;

  const isDecimalComma = commaCount === 1 && digitsAfterComma === 2;
  return isDecimalComma ? text.replace(",", ".") : text.replace(/,/g, "");
}

// Enhanced currency patterns with better matching
export const amountPatterns = {
  // EUR: 1.234,56 or 1,234.56
  eur: /([-+]?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/,
  // CHF: 1'234.56 or 1 234.56
  chf: /([-+]?\d{1,3}(?:['\s]\d{3})*\.\d{2})/,
  // USD/GBP: 1,234.56
  usd: /([-+]?\d{1,3}(?:,\d{3})*\.\d{2})/,
  // French/Belgian: 1 234,56
  fr: /([-+]?\d{1,3}(?:\s\d{3})*,\d{2})/,
};
