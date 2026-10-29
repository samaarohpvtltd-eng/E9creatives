export type Designation = 'admin' | 'project_manager' | 'designer' | 'employee';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  designation: Designation;
  designationTitle: string;
  department: string;
  avatarInitials: string;
  allowedRoles: UserRole[];
  defaultRole: UserRole;
  badgeLabel: string;
}

export interface AccountCredential extends UserAccount {
  passwordHash: string;
  description: string;
  phone?: string;
  status?: 'active' | 'suspended';
  lastUpdated?: string;
}

export type UserRole =
  | 'executive'
  | 'sales'
  | 'quotation'
  | 'project_manager'
  | 'design'
  | 'production'
  | 'installation'
  | 'invoicing'
  | 'admin_panel'
  | 'chat';

export type EnquiryStatus =
  | 'new'
  | 'discussing'
  | 'site_visit_requested'
  | 'quotation_sent'
  | 'won'
  | 'lost';

export type ProjectStage =
  | 'enquiry'
  | 'site_measurement'
  | 'design'
  | 'production'
  | 'installation'
  | 'completed';

export interface QuotationLineItem {
  id: string;
  productName: string;
  category: string;
  hsnSacCode?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  taxRatePercent?: number;
  amount?: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  date: string;
  validUntil?: string;
  clientName: string;
  clientContactPerson?: string;
  clientContactPhone?: string;
  clientContactEmail?: string;
  clientGstin?: string;
  billingAddress?: string;
  stateCode?: string;
  isInterState?: boolean;
  projectId?: string;
  projectLeadCode?: string;
  items: QuotationLineItem[];
  taxRatePercent: number;
  terms: string[];
  subtotal: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  taxAmount: number;
  grandTotal: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  revisionsCount?: number;
  lastReminderSentAt?: string;
  requiresSiteMeasurement: boolean;
  notes?: string;
}

export interface SiteMeasurement {
  id: string;
  inChargeId: string;
  inChargeName: string;
  assignedDate: string;
  completedDate?: string;
  floorPlanUrl?: string;
  elevationNotes: string;
  dimensions: {
    surfaceName: string;
    widthFeet: number;
    heightFeet: number;
    areaSqFt: number;
    surfaceType: string;
  }[];
  surfacePrepInstructions: {
    ladderRequired: boolean;
    scaffoldingRequired: boolean;
    scaffoldingTiers?: number;
    surfaceCleaningNeeded: boolean;
    wallPrimerNeeded: boolean;
    electricalAccessNeeded: boolean;
    notes: string;
  };
  sitePhotos: {
    id: string;
    caption: string;
    url: string;
    timestamp: string;
  }[];
}

export interface DesignVersion {
  versionNumber: number;
  type: 'moodboard' | 'presentation' | 'final_print';
  uploadedAt: string;
  uploadedBy: string;
  title: string;
  fileUrl: string;
  highResDownloadLink?: string;
  clientStatus: 'pending' | 'changes_requested' | 'approved';
  comments: {
    id: string;
    author: string;
    role: string;
    timestamp: string;
    comment: string;
  }[];
}

export interface DesignerTimesheetEntry {
  id: string;
  projectId: string;
  projectName: string;
  designerName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  activityDescription: string;
}

export interface ProductionOrder {
  id: string;
  poNumber: string;
  poTotalQuantity: number;
  producedQuantity: number;
  unit: string;
  prePressApproved: boolean;
  sampleRequested: boolean;
  sampleApprovedBySales: boolean;
  qcStatus: 'pending' | 'passed' | 're_production_required';
  qcInspectorName?: string;
  qcCheckedAt?: string;
  qcDefectNotes?: string;
  qcDefectPhotoUrl?: string;
  dispatched: boolean;
  dispatchedAt?: string;
  dispatchTrackingNo?: string;
  invoiceRequestedFromAccounts: boolean;
}

export interface TaggedInstallationPhoto {
  id: string;
  surfaceTag: string; // e.g. "Wall A - Reception"
  floor: string;
  photoUrl: string;
  timestamp: string;
  installedBy: string;
  status: 'completed';
}

export interface InstallationHandover {
  assignedApplicatorLead: string;
  crewCount: number;
  scheduledDate: string;
  preInstallationChecklist: {
    surfacesClean: boolean;
    dustFree: boolean;
    storageAvailable: boolean;
    materialGoodCondition: boolean;
    materialQuantityMatches: boolean;
    completedAt?: string;
  };
  taggedPhotos: TaggedInstallationPhoto[];
  clientHandoverCertUrl?: string;
  clientSignOffName?: string;
  postApplicationSnagFree: boolean;
  snagNotes?: string;
  completedAt?: string;
}

export interface ProjectLead {
  id: string;
  leadCode: string;
  clientName: string;
  projectName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  location: string;
  stage: ProjectStage;
  enquiryStatus: EnquiryStatus;
  lossReason?: {
    category: 'budget' | 'competitor_pricing' | 'timeline' | 'design_rejected' | 'client_cancelled' | 'other';
    explanation: string;
    competitorName?: string;
    loggedAt: string;
  };
  quotation?: Quotation;
  siteMeasurement?: SiteMeasurement;
  designInfo?: {
    assignedDesigner?: string;
    designHead: string;
    timelineType: 'fixed_by_sales' | 'open_discussion';
    deadlineDate?: string;
    moreTimeRequested?: {
      requestedDays: number;
      reason: string;
      requestedAt: string;
      salesApproved?: boolean;
    };
    versions: DesignVersion[];
  };
  productionOrder?: ProductionOrder;
  installationHandover?: InstallationHandover;
  createdAt: string;
  estimatedValue: number;
}

export interface ChatMessage {
  id: string;
  channelId: string; // e.g. 'proj-google' or 'dept-design'
  senderName: string;
  senderRole: string;
  department: string;
  timestamp: string;
  text: string;
  attachmentName?: string;
  attachmentUrl?: string;
  isExternalClientVisible: boolean;
}

export type InvoiceStatus = 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue';

export interface InvoiceLineItem {
  id: string;
  description: string;
  hsnSacCode: string;
  quantity: number;
  unit: string;
  unitRate: number;
  taxRatePercent: number;
  amount: number;
}

export interface InvoicePaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'neft_rtgs' | 'upi' | 'cheque' | 'cash';
  referenceNo: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId?: string;
  projectLeadCode?: string;
  clientName: string;
  clientGstin?: string;
  billingAddress: string;
  date: string;
  dueDate: string;
  items: InvoiceLineItem[];
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  paymentHistory: InvoicePaymentRecord[];
  notes?: string;
  poNumber?: string;
  quotationNumber?: string;
  isInterState?: boolean;
}

export type ServiceCategory =
  | 'Window Film'
  | 'Wall Graphics'
  | '3D & Dimensional Signage'
  | 'UV & Flatbed'
  | 'Architectural Wayfinding'
  | 'Installation & Survey';

export interface ServiceCatalogItem {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  unit: 'sq.ft' | 'rft' | 'unit' | 'set' | 'job' | 'day';
  baseRate: number;
  minOrderQuantity: number;
  taxRatePercent: number;
  turnaroundDays: number;
  status: 'active' | 'inactive';
  lastUpdated: string;
  hsnSacCode: string;
}

export interface CompanyBillingSettings {
  companyName: string;
  brandTagline: string;
  gstin: string;
  panNumber: string;
  cinNumber: string;
  address: string;
  stateCode: string;
  email: string;
  phone: string;
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  bankBranch: string;
  upiId: string;
  defaultPaymentTerms: string;
}

