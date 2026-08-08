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

export class PricingService {
  /**
   * Calculates estimated cost for 3D printing part based on weight and print time.
   * Standard default rate: Rs 15 per gram + Rs 100 per print hour
   */
  static calculate3DPrintPartPrice(weightGrams: number, printMinutes: number, ratePerGram = 15, ratePerHour = 100): number {
    const safeWeight = Math.max(0, weightGrams || 0);
    const safeMinutes = Math.max(0, printMinutes || 0);
    const materialCost = safeWeight * ratePerGram;
    const machineTimeCost = (safeMinutes / 60) * ratePerHour;
    return Math.round(materialCost + machineTimeCost);
  }

  /**
   * Calculates estimated cost for CNC part based on material cost and machining time.
   * Standard default machine rate: Rs 1500 per machining hour
   */
  static calculateCNCPartPrice(materialCostLKR: number, machiningMinutes: number, ratePerHour = 1500): number {
    const safeMatCost = Math.max(0, materialCostLKR || 0);
    const safeMinutes = Math.max(0, machiningMinutes || 0);
    const machineCost = (safeMinutes / 60) * ratePerHour;
    return Math.round(safeMatCost + machineCost);
  }

  /**
   * Centralized Job Pricing Calculation
   * All values rounded to integer LKR amounts to avoid floating point money errors.
   */
  static calculateJobPricing(input: CalculatePricingInput): PricingBreakdown {
    const {
      parts = [],
      discountLKR = 0,
      taxPercentage = 0,
      deliveryFeeLKR = 0,
      paidAmountLKR = 0,
    } = input;

    // 1. Calculate sum of parts
    const partsSubtotalLKR = parts.reduce((acc, part) => {
      const unitPrice = Math.round(part.unitPriceLKR || 0);
      const qty = Math.max(1, part.quantity || 1);
      return acc + (unitPrice * qty);
    }, 0);

    // 2. Apply discount safely
    const safeDiscount = Math.min(partsSubtotalLKR, Math.max(0, Math.round(discountLKR)));
    const discountedSubtotal = partsSubtotalLKR - safeDiscount;

    // 3. Apply delivery fee
    const safeDeliveryFee = Math.max(0, Math.round(deliveryFeeLKR));

    // 4. Apply Tax if tax percentage > 0
    const safeTaxPercentage = Math.max(0, taxPercentage);
    const taxLKR = safeTaxPercentage > 0 ? Math.round(discountedSubtotal * (safeTaxPercentage / 100)) : 0;

    // 5. Calculate Final Total
    const totalLKR = discountedSubtotal + taxLKR + safeDeliveryFee;

    // 6. Balance & Paid Amount
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

  /**
   * Calculates balance after a new payment submission
   */
  static calculateNewBalance(currentBalanceLKR: number, newPaymentLKR: number): number {
    const safeBalance = Math.round(currentBalanceLKR || 0);
    const safePayment = Math.round(newPaymentLKR || 0);
    return Math.max(0, safeBalance - safePayment);
  }
}
