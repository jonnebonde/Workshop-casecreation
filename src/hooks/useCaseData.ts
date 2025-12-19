import { useState } from 'react';
import { CaseData, Vehicle, Owner, ExistingCase, ClaimForm, CoverageCheck, PriceEstimate, Photo, RepairItem, InvoiceOcrData, AdditionalClaimInfo } from '../types/case';

export const useCaseData = () => {
  const [caseData, setCaseData] = useState<CaseData>({
    vrn: '',
    damageDate: '',
    insuranceCompany: '',
    glassType: '',
    vehicle: null,
    owner: null,
    existingCase: null,
    coverageCheck: null,
    priceEstimate: null,
    claimForm: null,
    additionalClaimInfo: {},
    photos: [],
    photosComplete: false,
    repairItems: [],
    invoice: null,
    ocrInvoiceData: null,
    preCheckResult: null,
    skippedItems: [],
    vrnConfirmed: false,
    partsLaborConfirmed: false,
    customerAcceptedNoCoverage: false,
    calibrationNeeded: false,
    calibrationSignature: '',
    calibrationDocument: null,
    photosSkipped: false,
    photosSkippedReason: '',
    jobPerformedDate: '',
    claimFormActionTaken: undefined
  });

  const updateVRNData = (
    vrn: string, 
    damageDate: string,
    insuranceCompany: string,
    glassType: string,
    vehicle: Vehicle | null, 
    owner: Owner | null, 
    existingCase: ExistingCase | null, 
    coverageCheck: CoverageCheck | null,
    priceEstimate: PriceEstimate | null,
    vrnConfirmed: boolean
  ) => {
    setCaseData(prev => ({
      ...prev,
      vrn,
      damageDate,
      insuranceCompany,
      glassType,
      vehicle,
      owner,
      existingCase,
      coverageCheck,
      priceEstimate,
      vrnConfirmed
    }));
  };

  const updateClaimForm = (claimForm: ClaimForm | null, customerAcceptedNoCoverage?: boolean) => {
    setCaseData(prev => ({
      ...prev,
      claimForm,
      customerAcceptedNoCoverage: customerAcceptedNoCoverage ?? prev.customerAcceptedNoCoverage
    }));
  };

  const updateAdditionalClaimInfo = (additionalClaimInfo: AdditionalClaimInfo) => {
    setCaseData(prev => ({
      ...prev,
      additionalClaimInfo
    }));
  };

  const updatePhotos = (photos: Photo[], photosComplete: boolean, photosSkipped?: boolean, photosSkippedReason?: string) => {
    setCaseData(prev => ({
      ...prev,
      photos,
      photosComplete,
      photosSkipped: photosSkipped ?? prev.photosSkipped,
      photosSkippedReason: photosSkippedReason ?? prev.photosSkippedReason
    }));
  };

  const updateRepairItems = (repairItems: RepairItem[]) => {
    setCaseData(prev => ({
      ...prev,
      repairItems
    }));
  };

  const updatePartsLaborConfirmation = (confirmed: boolean) => {
    setCaseData(prev => ({
      ...prev,
      partsLaborConfirmed: confirmed
    }));
  };

  const updateCalibrationData = (calibrationNeeded: boolean, calibrationSignature?: string, calibrationDocument?: File | null) => {
    setCaseData(prev => ({
      ...prev,
      calibrationNeeded,
      calibrationSignature: calibrationSignature ?? prev.calibrationSignature,
      calibrationDocument: calibrationDocument ?? prev.calibrationDocument
    }));
  };

  const updateInvoice = (invoice: File) => {
    setCaseData(prev => ({
      ...prev,
      invoice
    }));
  };

  const updateOcrInvoiceData = (ocrData: InvoiceOcrData) => {
    setCaseData(prev => ({
      ...prev,
      ocrInvoiceData: ocrData
    }));
  };

  const updatePreCheck = (preCheckResult: 'auto_approved' | 'manual_review') => {
    setCaseData(prev => ({
      ...prev,
      preCheckResult
    }));
  };

  const addSkippedItem = (item: string) => {
    setCaseData(prev => ({
      ...prev,
      skippedItems: [...prev.skippedItems, item]
    }));
  };

  const removeSkippedItem = (item: string) => {
    setCaseData(prev => ({
      ...prev,
      skippedItems: prev.skippedItems.filter(i => i !== item)
    }));
  };

  const updateJobPerformedDate = (date: string) => {
    setCaseData(prev => ({
      ...prev,
      jobPerformedDate: date
    }));
  };

  const updateClaimFormActionTaken = (action: 'continued' | 'drafted' | 'stopped' | 'submitted') => {
    setCaseData(prev => ({
      ...prev,
      claimFormActionTaken: action
    }));
  };

  const resetDependentCaseData = () => {
    setCaseData(prev => ({
      ...prev,
      // Reset all data that depends on VRN lookup, but keep VRN-related data
      damageDate: '',
      insuranceCompany: '',
      glassType: '',
      coverageCheck: null,
      priceEstimate: null,
      claimForm: null,
      additionalClaimInfo: {},
      photos: [],
      repairItems: [],
      invoice: null,
      ocrInvoiceData: null,
      preCheckResult: null,
      skippedItems: [],
      partsLaborConfirmed: false,
      customerAcceptedNoCoverage: false,
      calibrationNeeded: false,
      calibrationSignature: '',
      calibrationDocument: null,
      photosSkipped: false,
      photosSkippedReason: '',
      jobPerformedDate: '',
      claimFormActionTaken: undefined
    }));
  };

  return {
    caseData,
    updateVRNData,
    updateClaimForm,
    updateAdditionalClaimInfo,
    updatePhotos,
    updateRepairItems,
    updatePartsLaborConfirmation,
    updateCalibrationData,
    updateInvoice,
    updateOcrInvoiceData,
    updatePreCheck,
    addSkippedItem,
    removeSkippedItem,
    resetDependentCaseData,
    updateJobPerformedDate,
    updateClaimFormActionTaken
  };
};
