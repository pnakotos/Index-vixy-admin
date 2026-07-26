export interface FareCalculationResult {
  distanceKm: number;
  baseFareUSD: number;
  baseDistanceKm: number;
  extraKm: number;
  additionalKmRateUSD: number;
  extraCostUSD: number;
  totalFareUSD: number;
  totalFareVES: number;
  companyCommissionUSD: number;
  companyCommissionVES: number;
  driverEarningsUSD: number;
  driverEarningsVES: number;
}

export function calculateTripFare(
  distanceKm: number,
  baseFareUSD: number = 2.00,
  baseDistanceKm: number = 3.0,
  additionalKmRateUSD: number = 0.50,
  bcvRate: number = 58.50,
  commissionPercent: number = 12.5
): FareCalculationResult {
  const safeDistance = Math.max(0, distanceKm);
  const extraKm = Math.max(0, safeDistance - baseDistanceKm);
  const extraCostUSD = extraKm * additionalKmRateUSD;
  const totalFareUSD = baseFareUSD + extraCostUSD;
  const totalFareVES = totalFareUSD * bcvRate;

  const companyCommissionUSD = (totalFareUSD * commissionPercent) / 100;
  const companyCommissionVES = companyCommissionUSD * bcvRate;

  const driverEarningsUSD = totalFareUSD - companyCommissionUSD;
  const driverEarningsVES = driverEarningsUSD * bcvRate;

  return {
    distanceKm: safeDistance,
    baseFareUSD,
    baseDistanceKm,
    extraKm,
    additionalKmRateUSD,
    extraCostUSD,
    totalFareUSD,
    totalFareVES,
    companyCommissionUSD,
    companyCommissionVES,
    driverEarningsUSD,
    driverEarningsVES,
  };
}
