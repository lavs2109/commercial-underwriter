import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { FileProcessor } from "./services/fileProcessor";
import { UnderwritingEngine } from "./services/underwritingEngine";
import { MarketDataService } from "./services/marketDataService";
import { ExportService } from "./services/exportService";
import { insertPropertySchema, insertDealSchema, insertBuyBoxCriteriaSchema, type Deal } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const fileProcessor = new FileProcessor();
const underwritingEngine = new UnderwritingEngine();
const marketDataService = new MarketDataService();
const exportService = new ExportService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);
  
  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Recent Deals
  app.get("/api/deals/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const recentDeals = await storage.getRecentDeals(limit);
      res.json(recentDeals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent deals" });
    }
  });

  // Create Property
  app.post("/api/properties", async (req, res) => {
    try {
      const validatedProperty = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(validatedProperty);
      res.json(property);
    } catch (error) {
      res.status(400).json({ message: "Invalid property data", error });
    }
  });

  // File Upload and Processing
  app.post("/api/deals/:dealId/upload", upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const fileType = req.body.fileType as 't12' | 'rentRoll';
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Validate file
      const validation = fileProcessor.validateFile(req.file);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      // Process file based on type
      let extractedData;
      if (fileType === 't12') {
        extractedData = await fileProcessor.processT12Document(req.file);
      } else if (fileType === 'rentRoll') {
        extractedData = await fileProcessor.processRentRollDocument(req.file);
      } else {
        return res.status(400).json({ message: "Invalid file type specified" });
      }

      // Store document upload record
      const documentUpload = await storage.createDocumentUpload({
        dealId,
        fileName: req.file.originalname,
        fileType,
        fileSize: req.file.size,
        extractedData: extractedData as any
      });

      res.json({ 
        success: true, 
        documentId: documentUpload.id,
        extractedData 
      });
    } catch (error) {
      res.status(500).json({ message: "File processing failed", error });
    }
  });

  // Run Analysis
  app.post("/api/deals/:dealId/analyze", async (req, res) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const buyBoxData = req.body.buyBox;
      const analysisInputs = req.body.inputs;

      const startTime = Date.now();

      // Create buy box criteria
      const buyBox = await storage.createBuyBoxCriteria({
        dealId,
        ...buyBoxData
      });

      // Get property data
      const deal = await storage.getDeal(dealId);
      if (!deal || !deal.propertyId) {
        return res.status(404).json({ message: "Deal or property not found" });
      }

      const property = await storage.getProperty(deal.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Fetch market data
      const marketData = await marketDataService.fetchAllMarketData(property.address);
      
      // Store market comparables
      for (const comp of marketData.rentComps) {
        await storage.createMarketComparable({
          dealId,
          propertyName: comp.propertyName,
          rentPerSqft: comp.rentPerSqft,
          capRate: comp.capRate || null,
          source: 'costar'
        });
      }

      // Run underwriting calculations
      const underwritingInputs = {
        property,
        purchasePrice: analysisInputs.purchasePrice,
        downPaymentPercent: analysisInputs.downPaymentPercent || 25,
        grossRentalIncome: analysisInputs.grossRentalIncome,
        operatingExpenses: analysisInputs.operatingExpenses,
        interestRate: analysisInputs.interestRate || 6.5,
        loanTermYears: analysisInputs.loanTermYears || 30
      };

      const results = underwritingEngine.calculateMetrics(underwritingInputs);
      const evaluation = underwritingEngine.evaluateAgainstBuyBox(results, buyBox, property);
      const recommendations = underwritingEngine.generateRecommendations(results, evaluation);

      const processingTime = Math.floor((Date.now() - startTime) / 1000);

      // Update deal with results
      const updatedDeal = await storage.updateDeal(dealId, {
        status: evaluation.passed ? 'pass' : 'fail',
        purchasePrice: results.purchasePrice,
        downPaymentPercent: analysisInputs.downPaymentPercent || 25,
        loanAmount: results.loanAmount,
        grossRentalIncome: results.grossRentalIncome,
        operatingExpenses: results.operatingExpenses,
        netOperatingIncome: results.netOperatingIncome,
        debtService: results.annualDebtService,
        cashFlowBeforeTax: results.cashFlowBeforeTax,
        cashOnCashReturn: results.cashOnCashReturn,
        capRate: results.capRate,
        dscr: results.dscr,
        processingTimeSeconds: processingTime
      });

      res.json({
        deal: updatedDeal,
        property,
        results,
        evaluation,
        recommendations,
        marketData,
        processingTime
      });

    } catch (error) {
      res.status(500).json({ message: "Analysis failed", error });
    }
  });

  // Get All Deals (for Past Deals page)
  app.get("/api/deals", async (req, res) => {
    try {
      // This would normally include pagination and filtering
      const deals = await storage.getDeals();
      const dealsWithProperties = await Promise.all(
        deals.map(async (deal: Deal) => {
          const property = await storage.getProperty(deal.propertyId!);
          return {
            ...deal,
            property
          };
        })
      );
      res.json(dealsWithProperties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deals", error });
    }
  });

  // Get Deal Results
  app.get("/api/deals/:dealId/results", async (req, res) => {
    try {
      const dealId = parseInt(req.params.dealId);
      
      const deal = await storage.getDeal(dealId);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      const property = await storage.getProperty(deal.propertyId!);
      const buyBox = await storage.getBuyBoxCriteriaByDealId(dealId);
      const marketComps = await storage.getMarketComparablesByDealId(dealId);

      res.json({
        deal,
        property,
        buyBox,
        marketComps
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deal results" });
    }
  });

  // Export Excel Model
  app.get("/api/deals/:dealId/export/excel", async (req, res) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const deal = await storage.getDeal(dealId);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      const property = await storage.getProperty(deal.propertyId!);
      const buyBox = await storage.getBuyBoxCriteriaByDealId(dealId);
      const marketComps = await storage.getMarketComparablesByDealId(dealId);

      const exportData = { deal, property: property!, buyBox: buyBox!, marketComps };
      const excelBuffer = exportService.generateExcelModel(exportData);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="underwriting-model-${dealId}.xlsx"`);
      res.send(excelBuffer);
    } catch (error) {
      res.status(500).json({ message: "Excel export failed" });
    }
  });

  // Export PDF Summary
  app.get("/api/deals/:dealId/export/pdf", async (req, res) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const deal = await storage.getDeal(dealId);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      const property = await storage.getProperty(deal.propertyId!);
      const buyBox = await storage.getBuyBoxCriteriaByDealId(dealId);
      const marketComps = await storage.getMarketComparablesByDealId(dealId);

      const exportData = { deal, property: property!, buyBox: buyBox!, marketComps };
      const pdfBuffer = exportService.generatePDFSummary(exportData);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="investment-summary-${dealId}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: "PDF export failed" });
    }
  });

  // Generate LOI
  app.get("/api/deals/:dealId/export/loi", async (req, res) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const deal = await storage.getDeal(dealId);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      const property = await storage.getProperty(deal.propertyId!);
      const buyBox = await storage.getBuyBoxCriteriaByDealId(dealId);
      const marketComps = await storage.getMarketComparablesByDealId(dealId);

      const exportData = { deal, property: property!, buyBox: buyBox!, marketComps };
      const loiBuffer = exportService.generateLOI(exportData);

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="loi-${dealId}.txt"`);
      res.send(loiBuffer);
    } catch (error) {
      res.status(500).json({ message: "LOI generation failed" });
    }
  });

  // Create initial deal
  app.post("/api/deals", async (req, res) => {
    try {
      const dealData = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(dealData);
      res.json(deal);
    } catch (error) {
      res.status(400).json({ message: "Invalid deal data", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
