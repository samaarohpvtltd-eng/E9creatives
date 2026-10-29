/**
 * Core business rules and calculation utilities for E9 CRM & Production Flow
 */

export interface QuotationItem {
  id: string;
  productName: string;
  category: string;
  unit: string; // 'sqft' | 'running_ft' | 'unit' | 'set'
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
}

export interface HistoricalPricePoint {
  id: string;
  clientName: string;
  date: string;
  productName: string;
  unitPrice: number;
  terms: string;
}

export interface PreInstallChecklist {
  surfacesClean: boolean;
  dustFree: boolean;
  storageAvailable: boolean;
  materialGoodCondition: boolean;
  materialQuantityMatches: boolean;
}

/**
 * Calculates subtotal, discount, tax, and final grand total for quotation line items.
 */
export function calculateQuotationTotals(
  items: QuotationItem[],
  taxRatePercent: number = 18
): {
  subtotal: number;
  discountTotal: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
} {
  let subtotal = 0;
  let discountTotal = 0;

  for (const item of items) {
    const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
    subtotal += lineTotal;
    if (item.discountPercent && item.discountPercent > 0) {
      discountTotal += (lineTotal * item.discountPercent) / 100;
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const taxAmount = (taxableAmount * taxRatePercent) / 100;
  const grandTotal = taxableAmount + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
  };
}

/**
 * Compares current quote rate with historical rates for consistency.
 */
export function compareCustomerPrices(
  productName: string,
  currentRate: number,
  history: HistoricalPricePoint[]
): {
  matches: HistoricalPricePoint[];
  avgRate: number;
  minRate: number;
  maxRate: number;
  percentageDiffFromAvg: number;
} {
  const filtered = history.filter(
    (h) => h.productName.toLowerCase() === productName.toLowerCase()
  );

  if (filtered.length === 0) {
    return {
      matches: [],
      avgRate: currentRate,
      minRate: currentRate,
      maxRate: currentRate,
      percentageDiffFromAvg: 0,
    };
  }

  const rates = filtered.map((h) => h.unitPrice);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const sum = rates.reduce((acc, curr) => acc + curr, 0);
  const avgRate = Math.round((sum / rates.length) * 100) / 100;

  const percentageDiffFromAvg =
    avgRate > 0
      ? Math.round(((currentRate - avgRate) / avgRate) * 1000) / 10
      : 0;

  return {
    matches: filtered,
    avgRate,
    minRate,
    maxRate,
    percentageDiffFromAvg,
  };
}

/**
 * Validates that requested production batch will not exceed PO approved quantity.
 */
export function validateProductionAgainstPO(
  requestedBatchQty: number,
  poTotalQty: number,
  alreadyProducedQty: number
): {
  isValid: boolean;
  remainingAllowable: number;
  excessQuantity: number;
  errorMessage?: string;
} {
  const remainingAllowable = Math.max(0, poTotalQty - alreadyProducedQty);

  if (requestedBatchQty <= 0) {
    return {
      isValid: false,
      remainingAllowable,
      excessQuantity: 0,
      errorMessage: 'Batch quantity must be greater than zero.',
    };
  }

  if (requestedBatchQty > remainingAllowable) {
    const excessQuantity = requestedBatchQty - remainingAllowable;
    return {
      isValid: false,
      remainingAllowable,
      excessQuantity,
      errorMessage: `Production cannot exceed PO Quantity! Requested ${requestedBatchQty}, but only ${remainingAllowable} allowable before exceeding PO limit of ${poTotalQty}.`,
    };
  }

  return {
    isValid: true,
    remainingAllowable,
    excessQuantity: 0,
  };
}

/**
 * Validates the 5 mandatory pre-installation checklist questionnaire items.
 */
export function validatePreInstallationReadiness(
  checklist: PreInstallChecklist
): {
  isReady: boolean;
  missingItems: string[];
} {
  const missingItems: string[] = [];

  if (!checklist.surfacesClean) {
    missingItems.push('All surfaces neat and clean for installation');
  }
  if (!checklist.dustFree) {
    missingItems.push('Area is dust-free');
  }
  if (!checklist.storageAvailable) {
    missingItems.push('Storage space is available for material');
  }
  if (!checklist.materialGoodCondition) {
    missingItems.push('All material was received in good condition');
  }
  if (!checklist.materialQuantityMatches) {
    missingItems.push('All material quantity is fine with nothing missing');
  }

  return {
    isReady: missingItems.length === 0,
    missingItems,
  };
}

/**
 * Formats seconds into human-readable HH:MM:SS string.
 */
export function formatElapsedTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}
