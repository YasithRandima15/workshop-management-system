import { Job, JobPart } from '@/types/job';

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
  jobCount?: number;
}

export class PricingService {
  /**
   * Calculates 3D printing part price strictly based on Weight (grams) x Rate Per Gram:
   * - Below 100 grams: default 20 LKR per gram
   * - 100 grams or above: default 15 LKR per gram
   * (Allows custom rate per gram override)
   */
  static calculate3DPrintPartPrice(
    weightGrams: number,
    customRatePerGram?: number
  ): number {
    const safeWeight = Math.max(0, weightGrams || 0);

    // Default Tiered rate: < 100g -> 20 LKR/g, >= 100g -> 15 LKR/g
    const ratePerGram = customRatePerGram !== undefined && customRatePerGram > 0
      ? customRatePerGram
      : (safeWeight < 100 ? 20 : 15);

    const materialCost = safeWeight * ratePerGram;
    return Math.round(materialCost);
  }

  /**
   * Calculates estimated cost for CNC part based on material cost and machining fee.
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
   * Standalone Monthly Electricity / Light Bill Calculator:
   * (For monthly viewing & expense logging only - NOT added into individual part pricing)
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
      printingHours: parseFloat(safePrintHours.toFixed(1)),
      cncHours: parseFloat(safeCncHours.toFixed(1)),
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
   * Automatically calculates Monthly Electricity Bill from saved database Jobs!
   */
  static calculateElectricityBillFromJobs(
    jobs: Job[],
    unitRateLKR = 30
  ): ElectricityBillCalculation {
    let totalPrintMinutes = 0;
    let totalCncMinutes = 0;

    for (const job of jobs) {
      if (!job.parts || job.parts.length === 0) continue;

      for (const part of job.parts) {
        const qty = Math.max(1, part.quantity || 1);
        if (part.manufacturingMethod === '3D_PRINTING') {
          const mins = part.printDetails?.estimatedPrintMinutes || 60;
          totalPrintMinutes += mins * qty;
        } else if (part.manufacturingMethod === 'CNC') {
          const mins = part.cncDetails?.estimatedMachiningMinutes || 60;
          totalCncMinutes += mins * qty;
        }
      }
    }

    const printHours = totalPrintMinutes / 60;
    const cncHours = totalCncMinutes / 60;

    const result = this.calculateElectricityBill(printHours, cncHours, unitRateLKR);
    return {
      ...result,
      jobCount: jobs.length,
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
