import { Deal, BuyBoxCriteria, Property } from "@shared/schema";

export interface UnderwritingInputs {
  property: Property;
  purchasePrice: number;
  downPaymentPercent: number;
  grossRentalIncome: number;
  operatingExpenses: number;
  interestRate: number;
  loanTermYears: number;
}

export interface UnderwritingResults {
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  grossRentalIncome: number;
  operatingExpenses: number;
  netOperatingIncome: number;
  annualDebtService: number;
  cashFlowBeforeTax: number;
  cashOnCashReturn: number;
  capRate: number;
  dscr: number;
  riskFlags: string[];
}

export interface PassFailResult {
  passed: boolean;
  failedCriteria: string[];
  recommendations: string[];
}

export class UnderwritingEngine {
  calculateMetrics(inputs: UnderwritingInputs): UnderwritingResults {
    const { purchasePrice, downPaymentPercent, grossRentalIncome, operatingExpenses, interestRate, loanTermYears } = inputs;
    
    // Basic calculations
    const downPayment = purchasePrice * (downPaymentPercent / 100);
    const loanAmount = purchasePrice - downPayment;
    const netOperatingIncome = grossRentalIncome - operatingExpenses;
    
    // Debt service calculation (monthly payment * 12)
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTermYears * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    const annualDebtService = monthlyPayment * 12;
    
    const cashFlowBeforeTax = netOperatingIncome - annualDebtService;
    
    // Key metrics
    const cashOnCashReturn = downPayment > 0 ? (cashFlowBeforeTax / downPayment) * 100 : 0;
    const capRate = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;
    const dscr = annualDebtService > 0 ? netOperatingIncome / annualDebtService : 0;
    
    // Risk flags
    const riskFlags: string[] = [];
    if (dscr < 1.2) riskFlags.push('Low DSCR - Debt service coverage is below 1.2x');
    if (capRate < 4) riskFlags.push('Low Cap Rate - Below market standards');
    if (operatingExpenses / grossRentalIncome > 0.5) riskFlags.push('High Operating Expenses - Above 50% of gross income');
    if (cashOnCashReturn < 5) riskFlags.push('Low Cash-on-Cash Return - Below 5%');
    
    return {
      purchasePrice,
      downPayment,
      loanAmount,
      grossRentalIncome,
      operatingExpenses,
      netOperatingIncome,
      annualDebtService,
      cashFlowBeforeTax,
      cashOnCashReturn,
      capRate,
      dscr,
      riskFlags
    };
  }

  evaluateAgainstBuyBox(results: UnderwritingResults, buyBox: BuyBoxCriteria, property: Property): PassFailResult {
    const failedCriteria: string[] = [];
    const recommendations: string[] = [];

    // Check cash-on-cash return
    if (results.cashOnCashReturn < buyBox.minCashOnCashReturn) {
      failedCriteria.push(`Cash-on-Cash Return: ${results.cashOnCashReturn.toFixed(2)}% < ${buyBox.minCashOnCashReturn}% (required)`);
      recommendations.push('Consider reducing purchase price or increasing rents to improve cash-on-cash return');
    }

    // Check cap rate
    if (results.capRate < buyBox.minCapRate) {
      failedCriteria.push(`Cap Rate: ${results.capRate.toFixed(2)}% < ${buyBox.minCapRate}% (required)`);
      recommendations.push('Negotiate lower purchase price or identify value-add opportunities to increase NOI');
    }

    // Check year built
    if (property.yearBuilt && property.yearBuilt < buyBox.yearBuiltThreshold) {
      failedCriteria.push(`Year Built: ${property.yearBuilt} < ${buyBox.yearBuiltThreshold} (minimum)`);
      recommendations.push('Consider higher reserves for capital improvements due to property age');
    }

    // Additional recommendations based on risk flags
    if (results.riskFlags.length > 0) {
      recommendations.push('Address identified risk flags to strengthen the investment thesis');
    }

    return {
      passed: failedCriteria.length === 0,
      failedCriteria,
      recommendations
    };
  }

  generateRecommendations(results: UnderwritingResults, evaluation: PassFailResult): string[] {
    const recommendations = [...evaluation.recommendations];

    // Add performance-based recommendations
    if (results.dscr > 1.5) {
      recommendations.push('Strong debt coverage allows for potential leverage optimization');
    }

    if (results.capRate > 7) {
      recommendations.push('Above-market cap rate suggests good value opportunity');
    }

    if (results.cashOnCashReturn > 12) {
      recommendations.push('Excellent cash-on-cash return indicates strong cash flow potential');
    }

    return recommendations;
  }
}
