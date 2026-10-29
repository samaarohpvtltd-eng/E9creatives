import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateQuotationTotals,
  compareCustomerPrices,
  validateProductionAgainstPO,
  validatePreInstallationReadiness,
  formatElapsedTime,
} from './crmLogic.ts';

test('calculateQuotationTotals calculates subtotal, discounts, and GST correctly', () => {
  const items = [
    {
      id: 'item-1',
      productName: 'Frosted Glass Film 3M',
      category: 'Window Films',
      unit: 'sqft',
      quantity: 500,
      unitPrice: 120, // 60,000
      discountPercent: 10, // 6,000 discount -> 54,000
    },
    {
      id: 'item-2',
      productName: 'Custom Wallpaper HP Latex',
      category: 'Wall Graphics',
      unit: 'sqft',
      quantity: 200,
      unitPrice: 250, // 50,000, 0 discount -> 50,000
    },
  ];

  const result = calculateQuotationTotals(items, 18);
  assert.equal(result.subtotal, 110000);
  assert.equal(result.discountTotal, 6000);
  assert.equal(result.taxableAmount, 104000);
  assert.equal(result.taxAmount, 18720);
  assert.equal(result.grandTotal, 122720);
});

test('compareCustomerPrices matches product rates and calculates divergence', () => {
  const history = [
    {
      id: 'h1',
      clientName: 'Infosys Campus',
      date: '2026-08-10',
      productName: 'Frosted Glass Film 3M',
      unitPrice: 110,
      terms: 'Net 30 days',
    },
    {
      id: 'h2',
      clientName: 'Wipro Bangalore',
      date: '2026-09-15',
      productName: 'Frosted Glass Film 3M',
      unitPrice: 130,
      terms: '50% advance',
    },
  ];

  const comparison = compareCustomerPrices('Frosted Glass Film 3M', 120, history);
  assert.equal(comparison.matches.length, 2);
  assert.equal(comparison.avgRate, 120);
  assert.equal(comparison.minRate, 110);
  assert.equal(comparison.maxRate, 130);
  assert.equal(comparison.percentageDiffFromAvg, 0);

  const higherQuote = compareCustomerPrices('Frosted Glass Film 3M', 150, history);
  assert.equal(higherQuote.percentageDiffFromAvg, 25);
});

test('validateProductionAgainstPO strictly prevents over-production beyond PO limit', () => {
  // PO is 1000 units, already produced 800 units, remaining 200
  const allowed = validateProductionAgainstPO(200, 1000, 800);
  assert.equal(allowed.isValid, true);
  assert.equal(allowed.remainingAllowable, 200);

  const exceeded = validateProductionAgainstPO(250, 1000, 800);
  assert.equal(exceeded.isValid, false);
  assert.equal(exceeded.excessQuantity, 50);
  assert.match(exceeded.errorMessage || '', /Production cannot exceed PO Quantity/);
});

test('validatePreInstallationReadiness requires all 5 site checklist points', () => {
  const incomplete = validatePreInstallationReadiness({
    surfacesClean: true,
    dustFree: false,
    storageAvailable: true,
    materialGoodCondition: true,
    materialQuantityMatches: false,
  });

  assert.equal(incomplete.isReady, false);
  assert.equal(incomplete.missingItems.length, 2);
  assert.ok(incomplete.missingItems.includes('Area is dust-free'));

  const complete = validatePreInstallationReadiness({
    surfacesClean: true,
    dustFree: true,
    storageAvailable: true,
    materialGoodCondition: true,
    materialQuantityMatches: true,
  });

  assert.equal(complete.isReady, true);
  assert.equal(complete.missingItems.length, 0);
});

test('formatElapsedTime formats seconds into HH:MM:SS', () => {
  assert.equal(formatElapsedTime(0), '00:00:00');
  assert.equal(formatElapsedTime(65), '00:01:05');
  assert.equal(formatElapsedTime(3665), '01:01:05');
});
