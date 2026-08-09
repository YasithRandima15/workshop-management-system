import { JobPart } from '@/types/job';

export interface PricingBreakdown {
  partsSubtotalLKR: number;
  discountLKR: number;
  taxLKR: number;
  deliveryFeeLKR: number;
  totalLKR: number;
  paidAmountLKR: number;
  balanceLKR: number;
}

export interface CalculatePricingInput {
  parts: JobPart[];
  discountLKR?: number;
  taxPercentage?: number;
  deliveryFeeLKR?: number;
  paidAmountLKR?: number;
}

export interface ElectricityBillCalculation {
  printingHours: number;
  cncHours: number;
  printUnits: number;
  cncUnits: number;
  totalUnits: number;
  unitRateLKR: number;
  printCostLKR: number;
  cncCostLKR: number;
  totalBillLKR: number;
}

export class PricingService {
  /**
   * Calculates 3D printing part price with Tiered Sri Lankan Material Cost Rule:
   * - Below 100 grams: 20 LKR per gram
   * - 100 grams or above: 15 LKR per gram
   */
  static calculate3DPrintPartPrice(
    weightGrams: number,
    printMinutes: number,
    customRatePerGram?: number,
    ratePerHour = 100
  ): number {
    const safeWeight = Math.max(0, weightGrams || 0);
    const safeMinutes = Math.max(0, printMinutes || 0);

    // Tiered rate: < 100g -> 20 LKR/g, >= 100g -> 15 LKR/g
    const ratePerGram = customRatePerGram !== undefined
      ? customRatePerGram
      : (safeWeight < 100 ? 20 : 15);

    const materialCost = safeWeight * ratePerGram;
    const machineTimeCost = (safeMinutes / 60) * ratePerHour;
    return Math.round(materialCost + machineTimeCost);
  }

  /**
   * Calculates estimated cost for CNC part based on material cost and machining time.
   */
  static calculateCNCPartPrice(
    materialCostLKR: number,
    machiningMinutes: number,
    ratePerHour = 1500
  ): number {
    const safeMatCost = Math.max(0, materialCostLKR || 0);
    const safeMinutes = Math.max(0, machiningMinutes || 0);
    const machineCost = (safeMinutes / 60) * ratePerHour;
    return Math.round(safeMatCost + machineCost);
  }

  /**
   * Calculates Monthly Electricity / Light Bill:
   * - 1 Unit = 30 LKR
   * - 3D Printing: 0.1 units per operating hour (3 LKR/hr)
   * - CNC Machining: 0.3 units per operating hour (9 LKR/hr)
   */
  static calculateElectricityBill(
    printingHours: number,
    cncHours: number,
    unitRateLKR = 30
  ): ElectricityBillCalculation {
    const safePrintHours = Math.max(0, printingHours || 0);
    const safeCncHours = Math.max(0, cncHours || 0);

    const printUnits = safePrintHours * 0.1;
    const cncUnits = safeCncHours * 0.3;
    const totalUnits = printUnits + cncUnits;

    const printCostLKR = Math.round(printUnits * unitRateLKR);
    const cncCostLKR = Math.round(cncUnits * unitRateLKR);
    const totalBillLKR = Math.round(totalUnits * unitRateLKR);

    return {
      printingHours: safePrintHours,
      cncHours: safeCncHours,
      printUnits: parseFloat(printUnits.toFixed(2)),
      cncUnits: parseFloat(cncUnits.toFixed(2)),
      totalUnits: parseFloat(totalUnits.toFixed(2)),
      unitRateLKR,
      printCostLKR,
      cncCostLKR,
      totalBillLKR,
    };
  }

  /**
   * Centralized Job Pricing Calculation
   */
  static calculateJobPricing(input: CalculatePricingInput): PricingBreakdown {
    const {
      parts = [],
      discountLKR = 0,
      taxPercentage = 0,
      deliveryFeeLKR = 0,
      paidAmountLKR = 0,
    } = input;

    const partsSubtotalLKR = parts.reduce((acc, part) => {
      const unitPrice = Math.round(part.unitPriceLKR || 0);
      const qty = Math.max(1, part.quantity || 1);
      return acc + unitPrice * qty;
    }, 0);

    const safeDiscount = Math.min(partsSubtotalLKR, Math.max(0, Math.round(discountLKR)));
    const discountedSubtotal = partsSubtotalLKR - safeDiscount;
    const safeDeliveryFee = Math.max(0, Math.round(deliveryFeeLKR));
    const safeTaxPercentage = Math.max(0, taxPercentage);
    const taxLKR = safeTaxPercentage > 0 ? Math.round(discountedSubtotal * (safeTaxPercentage / 100)) : 0;
    const totalLKR = discountedSubtotal + taxLKR + safeDeliveryFee;

    const safePaidAmount = Math.max(0, Math.round(paidAmountLKR));
    const balanceLKR = Math.max(0, totalLKR - safePaidAmount);

    return {
      partsSubtotalLKR,
      discountLKR: safeDiscount,
      taxLKR,
      deliveryFeeLKR: safeDeliveryFee,
      totalLKR,
      paidAmountLKR: safePaidAmount,
      balanceLKR,
    };
  }

  static calculateNewBalance(currentBalanceLKR: number, newPaymentLKR: number): number {
    const safeBalance = Math.round(currentBalanceLKR || 0);
    const safePayment = Math.round(newPaymentLKR || 0);
    return Math.max(0, safeBalance - safePayment);
  }
}
