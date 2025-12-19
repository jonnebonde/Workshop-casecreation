export interface Vehicle {
  vrn: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
}

export interface Owner {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface ExistingCase {
  id: string;
  vrn: string;
  status: 'open' | 'pending' | 'closed';
  createdDate: string;
  description: string;
}

export interface ClaimForm {
  id: string;
  vrn: string;
  description: string;
  exists: boolean;
  damageDate?: string;
  location?: string;
  insuranceCompany?: string;
  glassType?: string;
}

export interface CoverageCheck {
  covered: boolean;
  coverageAmount: number;
  deductible: number;
  message: string;
  insuranceCompany: string;
}

export interface PriceEstimate {
  minPrice: number;
  maxPrice: number;
  estimatedPrice: number;
  confidence: 'low' | 'medium' | 'high';
  factors: string[];
}

export interface Photo {
  id: string;
  type: 'overview' | 'glass_closeup' | 'damage_closeup' | 'extra_documentation' | null;
  file: File;
  preview: string;
}

export type RepairCategory =
  | 'Glass'
  | 'Tilbehør'
  | 'Sensor / Sensorgel'
  | 'Arbeid monteringspris'
  | 'Arbeid Timepris'
  | 'Rutelim'
  | 'Verkstedmateriell'
  | 'Miljøavgift'
  | 'Statisk Kalibrering'
  | 'Dynamisk Kalibrering'
  | 'Lys/regnsensor Kalibrering'
  | 'Kombinert Kalibrering'
  | 'Dab-antenne'
  | 'Annet'
  | 'Fraktsone 1'
  | 'Fraktsone 2'
  | 'Fraktsone 3'
  | 'Fraktsone 4'
  | 'Glass med avvikende rabatt';

export interface RepairItem {
  id: string;
  category: RepairCategory;
  articleNumber?: string;
  quantity: number;
  unitPrice: number;
  discount: number; // Percentage discount (0-100)
  suggested: boolean;
}

export interface InvoiceOcrData {
  partsTotal: number;
  laborTotal: number;
  totalAmount: number;
  invoiceNumber?: string;
  invoiceDate?: string;
  companyName?: string;
  kidNumber?: string;
  dueDate?: string;
}

export interface PriceAgreementResult {
  status: 'approved' | 'review_required';
  message: string;
  details?: string[];
}

export interface CaseData {
  vrn: string;
  damageDate: string;
  insuranceCompany: string;
  glassType: string;
  vehicle: Vehicle | null;
  owner: Owner | null;
  existingCase: ExistingCase | null;
  coverageCheck: CoverageCheck | null;
  priceEstimate: PriceEstimate | null;
  claimForm: ClaimForm | null;
  additionalClaimInfo?: AdditionalClaimInfo;
  photos: Photo[];
  photosComplete: boolean;
  repairItems: RepairItem[];
  invoice: File | null;
  ocrInvoiceData: InvoiceOcrData | null;
  preCheckResult: 'auto_approved' | 'manual_review' | null;
  skippedItems: string[];
  vrnConfirmed: boolean;
  partsLaborConfirmed: boolean;
  customerAcceptedNoCoverage: boolean;
  calibrationNeeded: boolean;
  calibrationSignature: string;
  calibrationDocument: File | null;
  photosSkipped: boolean;
  photosSkippedReason: string;
  jobPerformedDate: string;
  claimFormActionTaken?: 'continued' | 'drafted' | 'stopped' | 'submitted';
}

export interface AdditionalClaimInfo {
  causeOfDamage?: string;
  wearAndTear?: string;
  place?: string;
}

export type StepStatus = 'complete' | 'incomplete' | 'pending' | 'error';

export interface Step {
  id: string;
  title: string;
  status: StepStatus;
  required: boolean;
}
