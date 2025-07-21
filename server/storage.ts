import { 
  users, properties, deals, buyBoxCriteria, documentUploads, marketComparables,
  type User, type UpsertUser, type CreateUser, type Property, type Deal, type BuyBoxCriteria, type DocumentUpload, type MarketComparable,
  type InsertProperty, type InsertDeal, type InsertBuyBoxCriteria, type InsertDocumentUpload, type InsertMarketComparable
} from "@shared/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: CreateUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Properties
  createProperty(property: InsertProperty): Promise<Property>;
  getProperty(id: number): Promise<Property | undefined>;

  // Deals
  createDeal(deal: InsertDeal): Promise<Deal>;
  getDeal(id: number): Promise<Deal | undefined>;
  getDeals(): Promise<Deal[]>;
  updateDeal(id: number, updates: Partial<InsertDeal>): Promise<Deal>;
  getRecentDeals(limit?: number): Promise<(Deal & { property: Property })[]>;

  // Buy Box Criteria
  createBuyBoxCriteria(criteria: InsertBuyBoxCriteria): Promise<BuyBoxCriteria>;
  getBuyBoxCriteriaByDealId(dealId: number): Promise<BuyBoxCriteria | undefined>;

  // Document Uploads
  createDocumentUpload(upload: InsertDocumentUpload): Promise<DocumentUpload>;
  getDocumentUploadsByDealId(dealId: number): Promise<DocumentUpload[]>;

  // Market Comparables
  createMarketComparable(comparable: InsertMarketComparable): Promise<MarketComparable>;
  getMarketComparablesByDealId(dealId: number): Promise<MarketComparable[]>;

  // Stats
  getDashboardStats(): Promise<{
    dealsAnalyzed: number;
    passedDeals: number;
    avgCoCReturn: number;
    avgProcessingTime: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private properties: Map<number, Property> = new Map();
  private deals: Map<number, Deal> = new Map();
  private buyBoxCriteria: Map<number, BuyBoxCriteria> = new Map();
  private documentUploads: Map<number, DocumentUpload> = new Map();
  private marketComparables: Map<number, MarketComparable> = new Map();
  
  private currentPropertyId = 1;
  private currentDealId = 1;
  private currentBuyBoxId = 1;
  private currentDocumentId = 1;
  private currentComparableId = 1;

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: CreateUser): Promise<User> {
    const id = nanoid();
    const user: User = {
      ...userData,
      id,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      createdAt: this.users.get(userData.id)?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const property: Property = { 
      ...insertProperty, 
      id,
      createdAt: new Date(),
      totalUnits: insertProperty.totalUnits ?? null,
      yearBuilt: insertProperty.yearBuilt ?? null
    };
    this.properties.set(id, property);
    return property;
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const id = this.currentDealId++;
    const deal: Deal = { 
      ...insertDeal, 
      id,
      createdAt: new Date(),
      propertyId: insertDeal.propertyId ?? null,
      purchasePrice: insertDeal.purchasePrice ?? null,
      downPaymentPercent: insertDeal.downPaymentPercent ?? null,
      loanAmount: insertDeal.loanAmount ?? null,
      grossRentalIncome: insertDeal.grossRentalIncome ?? null,
      operatingExpenses: insertDeal.operatingExpenses ?? null,
      netOperatingIncome: insertDeal.netOperatingIncome ?? null,
      debtService: insertDeal.debtService ?? null,
      cashFlowBeforeTax: insertDeal.cashFlowBeforeTax ?? null,
      cashOnCashReturn: insertDeal.cashOnCashReturn ?? null,
      capRate: insertDeal.capRate ?? null,
      dscr: insertDeal.dscr ?? null,
      processingTimeSeconds: insertDeal.processingTimeSeconds ?? null
    };
    this.deals.set(id, deal);
    return deal;
  }

  async getDeal(id: number): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async getDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values());
  }

  async updateDeal(id: number, updates: Partial<InsertDeal>): Promise<Deal> {
    const existingDeal = this.deals.get(id);
    if (!existingDeal) {
      throw new Error(`Deal with id ${id} not found`);
    }
    const updatedDeal = { ...existingDeal, ...updates };
    this.deals.set(id, updatedDeal);
    return updatedDeal;
  }

  async getRecentDeals(limit: number = 10): Promise<(Deal & { property: Property })[]> {
    const dealsArray = Array.from(this.deals.values())
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
      .slice(0, limit);

    return dealsArray.map(deal => {
      const property = this.properties.get(deal.propertyId!);
      return { ...deal, property: property! };
    }).filter(deal => deal.property);
  }

  async createBuyBoxCriteria(insertCriteria: InsertBuyBoxCriteria): Promise<BuyBoxCriteria> {
    const id = this.currentBuyBoxId++;
    const criteria: BuyBoxCriteria = { 
      ...insertCriteria, 
      id,
      dealId: insertCriteria.dealId ?? null
    };
    this.buyBoxCriteria.set(id, criteria);
    return criteria;
  }

  async getBuyBoxCriteriaByDealId(dealId: number): Promise<BuyBoxCriteria | undefined> {
    return Array.from(this.buyBoxCriteria.values()).find(c => c.dealId === dealId);
  }

  async createDocumentUpload(insertUpload: InsertDocumentUpload): Promise<DocumentUpload> {
    const id = this.currentDocumentId++;
    const upload: DocumentUpload = { 
      ...insertUpload, 
      id,
      uploadedAt: new Date(),
      dealId: insertUpload.dealId ?? null,
      fileSize: insertUpload.fileSize ?? null,
      extractedData: insertUpload.extractedData ?? null
    };
    this.documentUploads.set(id, upload);
    return upload;
  }

  async getDocumentUploadsByDealId(dealId: number): Promise<DocumentUpload[]> {
    return Array.from(this.documentUploads.values()).filter(doc => doc.dealId === dealId);
  }

  async createMarketComparable(insertComparable: InsertMarketComparable): Promise<MarketComparable> {
    const id = this.currentComparableId++;
    const comparable: MarketComparable = { 
      ...insertComparable, 
      id,
      dealId: insertComparable.dealId ?? null,
      capRate: insertComparable.capRate ?? null,
      rentPerSqft: insertComparable.rentPerSqft ?? null
    };
    this.marketComparables.set(id, comparable);
    return comparable;
  }

  async getMarketComparablesByDealId(dealId: number): Promise<MarketComparable[]> {
    return Array.from(this.marketComparables.values()).filter(comp => comp.dealId === dealId);
  }

  async getDashboardStats(): Promise<{
    dealsAnalyzed: number;
    passedDeals: number;
    avgCoCReturn: number;
    avgProcessingTime: number;
  }> {
    const deals = Array.from(this.deals.values());
    const passedDeals = deals.filter(d => d.status === 'pass');
    const completedDeals = deals.filter(d => d.status !== 'analyzing');
    
    const avgCoCReturn = completedDeals.length > 0 
      ? completedDeals.reduce((sum, d) => sum + (d.cashOnCashReturn || 0), 0) / completedDeals.length
      : 0;
    
    const avgProcessingTime = completedDeals.length > 0
      ? completedDeals.reduce((sum, d) => sum + (d.processingTimeSeconds || 0), 0) / completedDeals.length
      : 0;

    return {
      dealsAnalyzed: deals.length,
      passedDeals: passedDeals.length,
      avgCoCReturn,
      avgProcessingTime
    };
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: CreateUser): Promise<User> {
    const id = nanoid();
    const [user] = await db.insert(users).values({ ...userData, id }).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Properties
  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db.insert(properties).values(insertProperty).returning();
    return property;
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  // Deals
  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const [deal] = await db.insert(deals).values(insertDeal).returning();
    return deal;
  }

  async getDeal(id: number): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal;
  }

  async getDeals(): Promise<Deal[]> {
    return await db.select().from(deals);
  }

  async updateDeal(id: number, updates: Partial<InsertDeal>): Promise<Deal> {
    const [deal] = await db.update(deals).set(updates).where(eq(deals.id, id)).returning();
    return deal;
  }

  async getRecentDeals(limit: number = 10): Promise<(Deal & { property: Property })[]> {
    const results = await db
      .select()
      .from(deals)
      .leftJoin(properties, eq(deals.propertyId, properties.id))
      .orderBy(deals.createdAt)
      .limit(limit);

    return results.map(result => ({
      ...result.deals,
      property: result.properties!
    }));
  }

  // Buy Box Criteria
  async createBuyBoxCriteria(insertCriteria: InsertBuyBoxCriteria): Promise<BuyBoxCriteria> {
    const [criteria] = await db.insert(buyBoxCriteria).values(insertCriteria).returning();
    return criteria;
  }

  async getBuyBoxCriteriaByDealId(dealId: number): Promise<BuyBoxCriteria | undefined> {
    const [criteria] = await db.select().from(buyBoxCriteria).where(eq(buyBoxCriteria.dealId, dealId));
    return criteria;
  }

  // Document Uploads
  async createDocumentUpload(insertUpload: InsertDocumentUpload): Promise<DocumentUpload> {
    const [upload] = await db.insert(documentUploads).values(insertUpload).returning();
    return upload;
  }

  async getDocumentUploadsByDealId(dealId: number): Promise<DocumentUpload[]> {
    return await db.select().from(documentUploads).where(eq(documentUploads.dealId, dealId));
  }

  // Market Comparables
  async createMarketComparable(insertComparable: InsertMarketComparable): Promise<MarketComparable> {
    const [comparable] = await db.insert(marketComparables).values(insertComparable).returning();
    return comparable;
  }

  async getMarketComparablesByDealId(dealId: number): Promise<MarketComparable[]> {
    return await db.select().from(marketComparables).where(eq(marketComparables.dealId, dealId));
  }

  // Stats
  async getDashboardStats(): Promise<{
    dealsAnalyzed: number;
    passedDeals: number;
    avgCoCReturn: number;
    avgProcessingTime: number;
  }> {
    const allDeals = await db.select().from(deals);
    const completedDeals = allDeals.filter(deal => deal.status !== 'analyzing');
    const passedDeals = completedDeals.filter(deal => deal.status === 'pass');
    
    const avgCoCReturn = completedDeals.length > 0 
      ? completedDeals.reduce((sum, deal) => sum + (deal.cashOnCashReturn || 0), 0) / completedDeals.length
      : 0;
    
    const avgProcessingTime = completedDeals.length > 0
      ? completedDeals.reduce((sum, deal) => sum + (deal.processingTimeSeconds || 0), 0) / completedDeals.length
      : 0;

    return {
      dealsAnalyzed: completedDeals.length,
      passedDeals: passedDeals.length,
      avgCoCReturn,
      avgProcessingTime
    };
  }
}

// Use database storage in production, memory storage for development/testing
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
