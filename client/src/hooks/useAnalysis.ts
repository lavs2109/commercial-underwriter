import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Property, Deal } from "@shared/schema";

export interface AnalysisInputs {
  purchasePrice: number;
  downPaymentPercent?: number;
  grossRentalIncome: number;
  operatingExpenses: number;
  interestRate?: number;
  loanTermYears?: number;
}

export interface BuyBoxCriteria {
  minCashOnCashReturn: number;
  minCapRate: number;
  yearBuiltThreshold: number;
  targetHoldPeriod: number;
}

export interface AnalysisResults {
  deal: Deal;
  property: Property;
  results: {
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
  };
  evaluation: {
    passed: boolean;
    failedCriteria: string[];
    recommendations: string[];
  };
  recommendations: string[];
  marketData: any;
  processingTime: number;
}

export function useAnalysis() {
  const queryClient = useQueryClient();

  const createProperty = useMutation({
    mutationFn: async (propertyData: any) => {
      const response = await apiRequest('POST', '/api/properties', propertyData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
    }
  });

  const createDeal = useMutation({
    mutationFn: async (dealData: any) => {
      const response = await apiRequest('POST', '/api/deals', dealData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
    }
  });

  const runAnalysis = useMutation({
    mutationFn: async ({ dealId, buyBox, inputs }: { dealId: number; buyBox: BuyBoxCriteria; inputs: AnalysisInputs }) => {
      const response = await apiRequest('POST', `/api/deals/${dealId}/analyze`, { buyBox, inputs });
      return response.json() as Promise<AnalysisResults>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
    }
  });

  const getDealResults = useQuery({
    queryKey: ['/api/deals/results'],
    enabled: false
  });

  return {
    createProperty,
    createDeal,
    runAnalysis,
    getDealResults
  };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['/api/dashboard/stats'],
  });
}

export function useRecentDeals() {
  return useQuery({
    queryKey: ['/api/deals/recent'],
  });
}

export function useExportDeal() {
  const exportExcel = useMutation({
    mutationFn: async (dealId: number) => {
      const response = await apiRequest('GET', `/api/deals/${dealId}/export/excel`);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `underwriting-model-${dealId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    }
  });

  const exportPDF = useMutation({
    mutationFn: async (dealId: number) => {
      const response = await apiRequest('GET', `/api/deals/${dealId}/export/pdf`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `investment-summary-${dealId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    }
  });

  const generateLOI = useMutation({
    mutationFn: async (dealId: number) => {
      const response = await apiRequest('GET', `/api/deals/${dealId}/export/loi`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `loi-${dealId}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    }
  });

  return {
    exportExcel,
    exportPDF,
    generateLOI
  };
}
