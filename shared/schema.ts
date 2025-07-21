import { pgTable, text, serial, integer, real, boolean, timestamp, json, varchar, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for email/password auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  propertyType: text("property_type").notNull(),
  totalUnits: integer("total_units"),
  yearBuilt: integer("year_built"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  status: text("status").notNull(), // 'analyzing', 'pass', 'fail'
  purchasePrice: real("purchase_price"),
  downPaymentPercent: real("down_payment_percent"),
  loanAmount: real("loan_amount"),
  grossRentalIncome: real("gross_rental_income"),
  operatingExpenses: real("operating_expenses"),
  netOperatingIncome: real("net_operating_income"),
  debtService: real("debt_service"),
  cashFlowBeforeTax: real("cash_flow_before_tax"),
  cashOnCashReturn: real("cash_on_cash_return"),
  capRate: real("cap_rate"),
  dscr: real("dscr"),
  processingTimeSeconds: integer("processing_time_seconds"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const buyBoxCriteria = pgTable("buy_box_criteria", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").references(() => deals.id),
  minCashOnCashReturn: real("min_cash_on_cash_return").notNull(),
  minCapRate: real("min_cap_rate").notNull(),
  yearBuiltThreshold: integer("year_built_threshold").notNull(),
  targetHoldPeriod: integer("target_hold_period").notNull(),
});

export const documentUploads = pgTable("document_uploads", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").references(() => deals.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // 't12' or 'rentRoll'
  fileSize: integer("file_size"),
  extractedData: json("extracted_data"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const marketComparables = pgTable("market_comparables", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").references(() => deals.id),
  propertyName: text("property_name").notNull(),
  rentPerSqft: real("rent_per_sqft"),
  capRate: real("cap_rate"),
  source: text("source").notNull(), // 'costar', 'zillow', 'neighborhoodscout'
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
});

export const insertBuyBoxCriteriaSchema = createInsertSchema(buyBoxCriteria).omit({
  id: true,
});

export const insertDocumentUploadSchema = createInsertSchema(documentUploads).omit({
  id: true,
  uploadedAt: true,
});

export const insertMarketComparablesSchema = createInsertSchema(marketComparables).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type CreateUser = Omit<typeof users.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;
export type Property = typeof properties.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type BuyBoxCriteria = typeof buyBoxCriteria.$inferSelect;
export type DocumentUpload = typeof documentUploads.$inferSelect;
export type MarketComparable = typeof marketComparables.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type InsertBuyBoxCriteria = z.infer<typeof insertBuyBoxCriteriaSchema>;
export type InsertDocumentUpload = z.infer<typeof insertDocumentUploadSchema>;
export type InsertMarketComparable = z.infer<typeof insertMarketComparablesSchema>;
