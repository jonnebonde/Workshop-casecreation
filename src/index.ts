// Main exports for the case creation feature
export { default as CaseCreationFeature } from './CaseCreationFeature';

// Export all components that might be useful independently
export { default as ProgressBar } from './components/ProgressBar';
export { default as StepNavigation } from './components/StepNavigation';
export { default as CalibrationSection } from './components/CalibrationSection';
export { default as VRNLookupStep } from './components/steps/VRNLookupStep';
export { default as ClaimFormStep } from './components/steps/ClaimFormStep';
export { default as PhotoUploadStep } from './components/steps/PhotoUploadStep';
export { default as PartsLaborStep } from './components/steps/PartsLaborStep';
export { default as InvoiceStep } from './components/steps/InvoiceStep';

// Export hooks and utilities
export { useCaseData } from './hooks/useCaseData';
export * from './utils/preCheckLogic';
export * from './utils/calibration';

// Export types
export * from './types/case';
