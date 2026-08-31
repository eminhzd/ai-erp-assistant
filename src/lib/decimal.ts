import Decimal from 'decimal.js';

export function addDecimal(
  valueA: string | Decimal,
  valueB: string | Decimal,
): string {
  return new Decimal(valueA).plus(valueB).toString();
}

export function subtractDecimal(
  valueA: string | Decimal,
  valueB: string | Decimal,
): string {
  return new Decimal(valueA).minus(valueB).toString();
}

/**
 * Compare two decimal values.
 *
 * Returns:
 *  1  if valueA > valueB
 *  0  if valueA === valueB
 * -1  if valueA < valueB
 */
export function compareDecimal(
  valueA: string | Decimal,
  valueB: string | Decimal,
): number {
  return new Decimal(valueA).comparedTo(valueB);
}

export function isPositiveDecimal(value: string | Decimal): boolean {
  try {
    const decimal = new Decimal(value);

    return decimal.isFinite() && decimal.greaterThan(0);
  } catch {
    return false;
  }
}

export function isZeroDecimal(value: string | Decimal): boolean {
  try {
    const decimal = new Decimal(value);

    return decimal.isFinite() && decimal.isZero();
  } catch {
    return false;
  }
}

export function isNonNegativeDecimal(value: string | Decimal): boolean {
  try {
    const decimal = new Decimal(value);

    return decimal.isFinite() && decimal.greaterThanOrEqualTo(0);
  } catch {
    return false;
  }
}

export function multiplyDecimal(
  valueA: string | Decimal,
  valueB: string | Decimal,
): string {
  return new Decimal(valueA).mul(valueB).toString();
}
