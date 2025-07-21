import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Edit, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MetricCard from "@/components/MetricCard";
import { useExportDeal } from "@/hooks/useAnalysis";
import { useToast } from "@/hooks/use-toast";
import { convertCurrency, formatCurrency } from "@/lib/currency";

export default function AnalysisResults() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { exportExcel, exportPDF, generateLOI } = useExportDeal();
  const [showTableInINR, setShowTableInINR] = useState(false);

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['/api/deals', id, 'results'],
    enabled: !!id,
  });

  const handleExport = async (type: 'excel' | 'pdf' | 'loi') => {
    if (!id) return;

    try {
      const dealId = parseInt(id);
      
      switch (type) {
        case 'excel':
          await exportExcel.mutateAsync(dealId);
          break;
        case 'pdf':
          await exportPDF.mutateAsync(dealId);
          break;
        case 'loi':
          await generateLOI.mutateAsync(dealId);
          break;
      }
      
      toast({
        title: "Export Complete",
        description: `${type.toUpperCase()} file has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating the file.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Results</h3>
            <p className="text-neutral-600">There was an error loading the analysis results.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-neutral-600">Analysis results not found for this deal.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { deal, property, marketComps } = results;
  const statusIcon = deal.status === 'pass' ? CheckCircle : XCircle;
  const statusColor = deal.status === 'pass' ? 'text-secondary' : 'text-destructive';
  const statusBg = deal.status === 'pass' ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive';

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">Analysis Results</h3>
              <p className="text-sm text-neutral-600">
                {property?.address} • {property?.propertyType} • 
                Completed in {deal.processingTimeSeconds || 0} seconds
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={statusBg}>
                {React.createElement(statusIcon, { className: "w-4 h-4 mr-2" })}
                {deal.status?.toUpperCase()}
              </Badge>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExport('excel')}
                  disabled={exportExcel.isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  disabled={exportPDF.isPending}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleExport('loi')}
                  disabled={generateLOI.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  LOI
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Cash-on-Cash Return"
          value={`${deal.cashOnCashReturn?.toFixed(2) || 0}%`}
          target="8.0%"
          difference={deal.cashOnCashReturn ? `+${(deal.cashOnCashReturn - 8.0).toFixed(1)}%` : undefined}
          status={(deal.cashOnCashReturn || 0) >= 8.0 ? 'pass' : 'fail'}
        />

        <MetricCard
          title="Cap Rate"
          value={`${deal.capRate?.toFixed(2) || 0}%`}
          target="5.5%"
          difference={deal.capRate ? `+${(deal.capRate - 5.5).toFixed(1)}%` : undefined}
          status={(deal.capRate || 0) >= 5.5 ? 'pass' : 'fail'}
        />

        <MetricCard
          title="DSCR"
          value={deal.dscr?.toFixed(2) || '0'}
          target="1.20"
          difference={(deal.dscr || 0) > 1.2 ? 'Good' : 'Poor'}
          status={(deal.dscr || 0) >= 1.2 ? 'pass' : 'fail'}
        />
      </div>

      {/* Additional Financial Metrics with Currency Toggle */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Purchase Price"
          value={deal.purchasePrice || 0}
          isCurrency={true}
          status="neutral"
        />

        <MetricCard
          title="Cash Flow Before Tax"
          value={deal.cashFlowBeforeTax || 0}
          isCurrency={true}
          status={deal.cashFlowBeforeTax && deal.cashFlowBeforeTax > 0 ? 'pass' : 'fail'}
        />

        <MetricCard
          title="Net Operating Income"
          value={deal.netOperatingIncome || 0}
          isCurrency={true}
          status="neutral"
        />

        <MetricCard
          title="Gross Rental Income"
          value={deal.grossRentalIncome || 0}
          isCurrency={true}
          status="neutral"
        />
      </div>

      {/* Financial Details Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Financial Summary</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTableInINR(!showTableInINR)}
              className="text-xs"
            >
              Show in {showTableInINR ? 'USD' : 'INR'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="py-3 text-sm font-medium text-neutral-900">Purchase Price</td>
                  <td className="py-3 text-sm text-neutral-900 text-right">
                    {showTableInINR 
                      ? formatCurrency(convertCurrency(deal.purchasePrice || 0).inr, 'INR')
                      : formatCurrency(deal.purchasePrice || 0, 'USD')}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-sm font-medium text-neutral-900">Down Payment (25%)</td>
                  <td className="py-3 text-sm text-neutral-900 text-right">
                    {showTableInINR 
                      ? formatCurrency(convertCurrency((deal.purchasePrice || 0) * 0.25).inr, 'INR')
                      : formatCurrency((deal.purchasePrice || 0) * 0.25, 'USD')}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-sm font-medium text-neutral-900">Loan Amount</td>
                  <td className="py-3 text-sm text-neutral-900 text-right">
                    {showTableInINR 
                      ? formatCurrency(convertCurrency(deal.loanAmount || 0).inr, 'INR')
                      : formatCurrency(deal.loanAmount || 0, 'USD')}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-sm font-medium text-neutral-900">Gross Rental Income</td>
                  <td className="py-3 text-sm text-neutral-900 text-right">
                    {showTableInINR 
                      ? formatCurrency(convertCurrency(deal.grossRentalIncome || 0).inr, 'INR')
                      : formatCurrency(deal.grossRentalIncome || 0, 'USD')}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-sm font-medium text-neutral-900">Operating Expenses</td>
                  <td className="py-3 text-sm text-neutral-900 text-right">
                    ({showTableInINR 
                      ? formatCurrency(convertCurrency(deal.operatingExpenses || 0).inr, 'INR')
                      : formatCurrency(deal.operatingExpenses || 0, 'USD')})
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-sm font-medium text-neutral-900">Net Operating Income</td>
                  <td className="py-3 text-sm font-semibold text-neutral-900 text-right">
                    {showTableInINR 
                      ? formatCurrency(convertCurrency(deal.netOperatingIncome || 0).inr, 'INR')
                      : formatCurrency(deal.netOperatingIncome || 0, 'USD')}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-sm font-medium text-neutral-900">Debt Service</td>
                  <td className="py-3 text-sm text-neutral-900 text-right">
                    ({showTableInINR 
                      ? formatCurrency(convertCurrency(deal.debtService || 0).inr, 'INR')
                      : formatCurrency(deal.debtService || 0, 'USD')})
                  </td>
                </tr>
                <tr className="bg-neutral-50">
                  <td className="py-3 text-sm font-bold text-neutral-900">Cash Flow Before Tax</td>
                  <td className="py-3 text-sm font-bold text-neutral-900 text-right">
                    {showTableInINR 
                      ? formatCurrency(convertCurrency(deal.cashFlowBeforeTax || 0).inr, 'INR')
                      : formatCurrency(deal.cashFlowBeforeTax || 0, 'USD')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Market Comparables */}
      {marketComps && marketComps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Market Comparables</CardTitle>
            <p className="text-sm text-neutral-600">Data sourced from CoStar, Zillow, and NeighborhoodScout</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-neutral-700 mb-3">Rent Comparables ($/sqft)</h5>
                <div className="space-y-2">
                  {marketComps.slice(0, 3).map((comp, index) => (
                    <div 
                      key={comp.id} 
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        index === 1 ? 'bg-primary/5 border border-primary/20' : 'bg-neutral-50'
                      }`}
                    >
                      <span className="text-sm text-neutral-900">{comp.propertyName}</span>
                      <span className={`text-sm ${index === 1 ? 'font-bold text-primary' : 'font-medium'}`}>
                        ${comp.rentPerSqft?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setLocation("/analyze")}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Assumptions
        </Button>
        <div className="space-x-3">
          <Button 
            variant="outline" 
            onClick={() => handleExport('excel')}
            disabled={exportExcel.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button 
            onClick={() => handleExport('pdf')}
            disabled={exportPDF.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
}
