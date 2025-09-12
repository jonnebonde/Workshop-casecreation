import { CaseData } from '../types/case';

const calculateItemTotal = (item: any) => {
  const subtotal = item.quantity * item.unitPrice;
  const discountAmount = subtotal * (item.discount / 100);
  return subtotal - discountAmount;
};

const calculatePartsTotal = (caseData: CaseData): number => {
  return caseData.repairItems
    .filter(item => item.category === 'parts')
    .reduce((sum, item) => sum + calculateItemTotal(item), 0);
};

const calculateLaborTotal = (caseData: CaseData): number => {
  return caseData.repairItems
    .filter(item => item.category === 'labor')
    .reduce((sum, item) => sum + calculateItemTotal(item), 0);
};

export const calculateExpectedTotal = (caseData: CaseData): number => {
  return caseData.repairItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
};

export const getComparisonStatus = (ocrValue: number, expectedValue: number): boolean => {
  const tolerance = 5; // £5 tolerance
  const difference = Math.abs(ocrValue - expectedValue);
  return difference <= tolerance;
};

export const evaluateCheck = (checkId: string, caseData: CaseData): 'success' | 'error' => {
  switch (checkId) {
    case 'vehicle_data':
      return (caseData.vehicle && caseData.owner && caseData.coverageCheck && caseData.priceEstimate && caseData.vrnConfirmed) ? 'success' : 'error';
    
    case 'claim_form':
      return (caseData.claimForm && caseData.claimFormActionTaken === 'continued') ? 'success' : 'error';
    
    case 'photo_quality':
      return (caseData.photos.length === 3) ? 'success' : 'error';
    
    case 'parts_pricing':
      return (caseData.repairItems.length > 0 && caseData.partsLaborConfirmed) ? 'success' : 'error';
    
    case 'invoice_validation':
      if (!caseData.invoice || !caseData.ocrInvoiceData) {
        return 'error';
      }
      
      // Check if OCR data matches expected totals
      const expectedPartsTotal = calculatePartsTotal(caseData);
      const expectedLaborTotal = calculateLaborTotal(caseData);
      const expectedTotal = calculateExpectedTotal(caseData);
      
      const partsMatch = getComparisonStatus(caseData.ocrInvoiceData.partsTotal, expectedPartsTotal);
      const laborMatch = getComparisonStatus(caseData.ocrInvoiceData.laborTotal, expectedLaborTotal);
      const totalMatch = getComparisonStatus(caseData.ocrInvoiceData.totalAmount, expectedTotal);
      
      return (partsMatch && laborMatch && totalMatch) ? 'success' : 'error';
    
    case 'coverage_check':
      // If customer accepted no coverage, consider it a success
      if (caseData.customerAcceptedNoCoverage) {
        return 'success';
      }
      return (caseData.coverageCheck && caseData.coverageCheck.covered) ? 'success' : 'error';
    
    default:
      return 'error';
  }
};

export const getCheckDetails = (checkId: string, caseData: CaseData): string => {
  switch (checkId) {
    case 'vehicle_data':
      if (!caseData.vehicle || !caseData.owner || !caseData.coverageCheck || !caseData.priceEstimate || !caseData.vrnConfirmed) {
        return 'Missing vehicle, owner, coverage, or price estimate information, or VRN not confirmed';
      }
      return 'Vehicle, owner, coverage, and price estimate data validated';
    
    case 'claim_form':
      if (!caseData.claimForm || caseData.claimFormActionTaken !== 'continued') {
        return 'Claim form missing or not continued';
      }
      return 'Claim form processed and continued';
    
    case 'photo_quality':
      if (caseData.photos.length !== 3) {
        return `${caseData.photos.length}/3 required photos uploaded`;
      }
      return 'All required photos uploaded';
    
    case 'parts_pricing':
      if (caseData.repairItems.length === 0) {
        return 'Repair items missing';
      }
      if (!caseData.partsLaborConfirmed) {
        return 'Repair items data not confirmed';
      }
      return `${caseData.repairItems.length} repair items confirmed`;
    
    case 'invoice_validation':
      if (!caseData.invoice) {
        return 'Invoice not uploaded';
      }
      if (!caseData.ocrInvoiceData) {
        return 'OCR processing incomplete';
      }
      
      const expectedTotal = calculateExpectedTotal(caseData);
      
      const totalMatch = getComparisonStatus(caseData.ocrInvoiceData.totalAmount, expectedTotal);
      
      if (!totalMatch) {
        return 'Invoice amounts do not match expected totals';
      }
      return 'Invoice validated and amounts match';
    
    case 'coverage_check':
      if (caseData.customerAcceptedNoCoverage) {
        return 'Customer accepted to pay without insurance coverage';
      }
      if (!caseData.coverageCheck) {
        return 'Coverage check not performed';
      }
      if (!caseData.coverageCheck.covered) {
        return 'Coverage not confirmed';
      }
      return 'Coverage confirmed';
    
    default:
      return '';
  }
};

export const determineCaseApprovalStatus = (caseData: CaseData): 'auto_approved' | 'manual_review' => {
  // Check if all validation checks pass
  const preCheckSummary = getPreCheckSummary(caseData);
  const allChecksPassed = preCheckSummary.every(check => check.status === 'success');
  
  // If customer is paying without coverage, requires manual review
  if (caseData.customerAcceptedNoCoverage) {
    return 'manual_review';
  }
  
  // If all checks pass and customer has coverage, can be auto-approved
  if (allChecksPassed) {
    return 'auto_approved';
  }
  
  // Otherwise requires manual review
  return 'manual_review';
};

export const getPreCheckSummary = (caseData: CaseData) => {
  const checks = [
    { id: 'vehicle_data', name: 'Vehicle Data Validation' },
    { id: 'claim_form', name: 'Claim Form Verification' },
    { id: 'photo_quality', name: 'Photo Quality Check' },
    { id: 'parts_pricing', name: 'Parts & Pricing Review' },
    { id: 'invoice_validation', name: 'Invoice Validation' },
    { id: 'coverage_check', name: 'Coverage Verification' }
  ];

  return checks.map(check => ({
    ...check,
    status: evaluateCheck(check.id, caseData),
    details: getCheckDetails(check.id, caseData)
  }));
};