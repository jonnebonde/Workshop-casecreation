// Main exports for the case creation feature
export { default as CaseCreationFeature } from './CaseCreationFeature';

// Export all components that might be useful independently
export { default as ProgressBar } from './components/ProgressBar';
export { default as StepNavigation } from './components/StepNavigation';
export { default as VRNLookupStep } from './components/steps/VRNLookupStep';
export { default as ClaimFormStep } from './components/steps/ClaimFormStep';
export { default as PhotoUploadStep } from './components/steps/PhotoUploadStep';
export { default as PartsLaborStep } from './components/steps/PartsLaborStep';
export { default as InvoiceStep } from './components/steps/InvoiceStep';
export { default as ConfirmationStep } from './components/steps/ConfirmationStep';

// Export hooks and utilities
export { useCaseData } from './hooks/useCaseData';
export * from './utils/preCheckLogic';

// Export types
export * from './types/case';