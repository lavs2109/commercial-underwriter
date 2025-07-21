export interface ExtractedFinancialData {
  grossRentalIncome?: number;
  operatingExpenses?: number;
  netOperatingIncome?: number;
  vacancyRate?: number;
  totalUnits?: number;
}

export interface ExtractedRentRollData {
  unitMix: { [key: string]: number };
  averageRent: number;
  occupancyRate: number;
  totalUnits: number;
}

export class FileProcessor {
  // Simulates OCR and data extraction from T12 financial statements
  async processT12Document(file: Express.Multer.File): Promise<ExtractedFinancialData> {
    // In a real implementation, this would use OCR libraries like tesseract.js
    // and AI services to extract structured data from PDFs/Excel files
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return simulated extracted data based on file size and name patterns
    const simulatedData: ExtractedFinancialData = {
      grossRentalIncome: Math.floor(Math.random() * 500000) + 300000,
      operatingExpenses: Math.floor(Math.random() * 200000) + 150000,
      vacancyRate: Math.random() * 0.1 + 0.02, // 2-12%
    };
    
    simulatedData.netOperatingIncome = (simulatedData.grossRentalIncome || 0) - (simulatedData.operatingExpenses || 0);
    
    return simulatedData;
  }

  // Simulates OCR and data extraction from rent rolls
  async processRentRollDocument(file: Express.Multer.File): Promise<ExtractedRentRollData> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return simulated rent roll data
    return {
      unitMix: {
        "1BR/1BA": Math.floor(Math.random() * 20) + 10,
        "2BR/2BA": Math.floor(Math.random() * 15) + 8,
        "3BR/2BA": Math.floor(Math.random() * 10) + 2,
      },
      averageRent: Math.floor(Math.random() * 500) + 1200,
      occupancyRate: Math.random() * 0.1 + 0.9, // 90-100%
      totalUnits: Math.floor(Math.random() * 50) + 20,
    };
  }

  // Validates file types and sizes
  validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid file type. Please upload PDF or Excel files only.' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Maximum size is 10MB.' };
    }
    
    return { valid: true };
  }
}
