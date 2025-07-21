import { useState } from "react";
import { useLocation } from "wouter";
import PropertyForm from "@/components/PropertyForm";
import BuyBoxForm from "@/components/BuyBoxForm";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAnalysis } from "@/hooks/useAnalysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play } from "lucide-react";

export default function NewAnalysis() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [propertyData, setPropertyData] = useState(null);
  const [dealId, setDealId] = useState<number | null>(null);
  const [extractedData, setExtractedData] = useState({ t12: null, rentRoll: null });
  const [buyBoxData, setBuyBoxData] = useState(null);

  const { createProperty, createDeal, runAnalysis } = useAnalysis();

  const handlePropertySubmit = async (data: any) => {
    try {
      const property = await createProperty.mutateAsync(data);
      setPropertyData(property);
      
      const deal = await createDeal.mutateAsync({
        propertyId: property.id,
        status: 'analyzing'
      });
      setDealId(deal.id);
      
      setStep(2);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUploadComplete = (fileType: 't12' | 'rentRoll', data: any) => {
    setExtractedData(prev => ({ ...prev, [fileType]: data }));
    
    // Check if both files are uploaded, if so move to next step
    const updatedData = { ...extractedData, [fileType]: data };
    if (updatedData.t12 && updatedData.rentRoll && step === 2) {
      setStep(3);
    }
  };

  const handleBuyBoxSubmit = (data: any) => {
    setBuyBoxData(data);
    setStep(4); // Skip to analysis ready step
  };

  const handleRunAnalysis = async () => {
    if (!dealId || !buyBoxData || !extractedData.t12) {
      toast({
        title: "Missing Information",
        description: "Please complete all required steps before running analysis.",
        variant: "destructive",
      });
      return;
    }

    try {
      const analysisInputs = {
        purchasePrice: 3850000, // This would come from user input or extracted data
        downPaymentPercent: 25,
        grossRentalIncome: extractedData.t12.grossRentalIncome || 468000,
        operatingExpenses: extractedData.t12.operatingExpenses || 203400,
        interestRate: 6.5,
        loanTermYears: 30
      };

      const result = await runAnalysis.mutateAsync({
        dealId,
        buyBox: buyBoxData,
        inputs: analysisInputs
      });

      toast({
        title: "Analysis Complete",
        description: `Deal ${result.evaluation.passed ? 'passed' : 'failed'} criteria. Processing time: ${result.processingTime}s`,
      });

      setLocation(`/results/${dealId}`);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error running the analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStepIndicator = () => (
    <div className="flex items-center space-x-2 mb-6">
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNumber
                ? "bg-primary text-white"
                : "bg-neutral-200 text-neutral-400"
            }`}
          >
            {stepNumber}
          </div>
          {stepNumber < 3 && (
            <div
              className={`w-16 h-1 rounded ml-2 ${
                step > stepNumber ? "bg-primary" : "bg-neutral-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">New Property Analysis</h2>
          <p className="text-sm text-neutral-600">Enter property details and upload financial documents</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Step 1: Property Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Property Information</CardTitle>
                <p className="text-sm text-neutral-600">Enter basic property details to begin analysis</p>
              </div>
              {getStepIndicator()}
            </div>
          </CardHeader>
          <CardContent>
            <PropertyForm onSubmit={handlePropertySubmit} />
            <div className="flex justify-end mt-6">
              <Button 
                type="submit" 
                form="property-form"
                className="bg-primary hover:bg-primary/90"
                disabled={createProperty.isPending}
              >
                {createProperty.isPending ? "Creating..." : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: File Uploads */}
      {step === 2 && dealId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upload Financial Documents</CardTitle>
                <p className="text-sm text-neutral-600">Upload T12 and Rent Roll for automated data extraction</p>
              </div>
              {getStepIndicator()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <FileUpload
                dealId={dealId}
                fileType="t12"
                title="T12 Financial Statement"
                description="Upload PDF or Excel file (Max 10MB)"
                onUploadComplete={(data) => handleFileUploadComplete('t12', data)}
              />
              
              <FileUpload
                dealId={dealId}
                fileType="rentRoll"
                title="Rent Roll"
                description="Upload PDF or Excel file (Max 10MB)"
                onUploadComplete={(data) => handleFileUploadComplete('rentRoll', data)}
              />
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={!extractedData.t12}
                className="bg-primary hover:bg-primary/90"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Buy Box Criteria */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Investment Criteria (Buy Box)</CardTitle>
                <p className="text-sm text-neutral-600">Set your investment criteria for deal evaluation</p>
              </div>
              {getStepIndicator()}
            </div>
          </CardHeader>
          <CardContent>
            <BuyBoxForm onSubmit={handleBuyBoxSubmit} />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                type="submit" 
                form="buybox-form"
                className="bg-primary hover:bg-primary/90"
              >
                Set Criteria
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Run Analysis */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Analyze</CardTitle>
            <p className="text-sm text-neutral-600">All information collected. Ready to run comprehensive analysis.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
                <span className="text-sm font-medium">Property Information</span>
                <span className="text-sm text-secondary">✓ Complete</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
                <span className="text-sm font-medium">T12 Financial Data</span>
                <span className="text-sm text-secondary">✓ Extracted</span>
              </div>
              {extractedData.rentRoll && (
                <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
                  <span className="text-sm font-medium">Rent Roll Data</span>
                  <span className="text-sm text-secondary">✓ Extracted</span>
                </div>
              )}
              <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
                <span className="text-sm font-medium">Buy Box Criteria</span>
                <span className="text-sm text-secondary">✓ Set</span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button
                onClick={handleRunAnalysis}
                disabled={runAnalysis.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <Play className="w-4 h-4 mr-2" />
                {runAnalysis.isPending ? "Analyzing..." : "Run Analysis"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
