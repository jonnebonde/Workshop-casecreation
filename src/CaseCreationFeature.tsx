import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import ProgressBar from './components/ProgressBar';
import StepNavigation from './components/StepNavigation';
import VRNLookupStep from './components/steps/VRNLookupStep';
import ClaimFormStep from './components/steps/ClaimFormStep';
import PhotoUploadStep from './components/steps/PhotoUploadStep';
import PartsLaborStep from './components/steps/PartsLaborStep';
import InvoiceStep from './components/steps/InvoiceStep';
import { useCaseData } from './hooks/useCaseData';
import { Step, StepStatus } from './types/case';
import { determineCaseApprovalStatus } from './utils/preCheckLogic';

interface CaseCreationFeatureProps {
  onCaseSubmitted?: (caseData: any) => void;
  className?: string;
}

const CaseCreationFeature: React.FC<CaseCreationFeatureProps> = ({
  onCaseSubmitted,
  className = ""
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [caseSubmitted, setCaseSubmitted] = useState(false);
  const [submissionOutcome, setSubmissionOutcome] = useState<'submitted' | 'drafted' | 'stopped'>('submitted');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [saveDraftSuccess, setSaveDraftSuccess] = useState(false);
  const [showClaimFormNavigation, setShowClaimFormNavigation] = useState(true);
  const [claimFormDisablePreviousAndStop, setClaimFormDisablePreviousAndStop] = useState(false);
  const [showExistingCaseOptionsInNav, setShowExistingCaseOptionsInNav] = useState(false);
  const {
    caseData,
    updateVRNData,
    updateClaimForm,
    updatePhotos,
    updateCalibrationData,
    updateInvoice,
    updateOcrInvoiceData,
    updatePreCheck,
    addSkippedItem,
    removeSkippedItem,
    updateRepairItems,
    resetDependentCaseData,
    updateJobPerformedDate,
    updateClaimFormActionTaken,
    updateAdditionalClaimInfo
  } = useCaseData();

  // Static step configurations without status - removed pre-check step
  const staticStepConfigs = [
    {
      id: 'vrn-lookup',
      title: 'VRN Lookup',
      required: true
    },
    {
      id: 'claim-form',
      title: 'Claim Form',
      required: true
    },
    {
      id: 'parts-labor',
      title: 'Parts & Labor',
      required: true
    },
    {
      id: 'photos',
      title: 'Photos',
      required: false
    },
    {
      id: 'invoice',
      title: 'Invoice',
      required: true
    }
  ];

  function getStepStatus(stepIndex: number): StepStatus {
    if (caseData.skippedItems.includes(staticStepConfigs[stepIndex]?.id)) return 'pending';
    
    switch (stepIndex) {
      case 0:
        const hasValidCoverage = caseData.coverageCheck && 
                                (caseData.coverageCheck.covered || caseData.coverageCheck.message.includes('manual review'));
        return caseData.vehicle && caseData.owner && caseData.priceEstimate && caseData.vrnConfirmed && hasValidCoverage ? 'complete' : 'incomplete';
      case 1:
        return caseData.claimFormActionTaken === 'continued' ? 'complete' : 'incomplete';
      case 2:
        const isCalibrationComplete = !caseData.calibrationNeeded || (caseData.calibrationNeeded && caseData.calibrationSignature);
        return caseData.repairItems.length > 0 && isCalibrationComplete ? 'complete' : 'incomplete';
      case 3:
        if (caseData.skippedItems.includes('photos')) return 'pending';
        return caseData.photosComplete ? 'complete' : 'complete';
      case 4:
        return caseData.invoice ? 'complete' : 'incomplete';
      default:
        return 'incomplete';
    }
  }

  // Create steps array with dynamic status
  const steps: Step[] = staticStepConfigs.map((config, index) => ({
    ...config,
    status: getStepStatus(index)
  }));

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0:
        return !!(caseData.vehicle && caseData.owner && caseData.vrnConfirmed && 
               caseData.coverageCheck && 
               (caseData.coverageCheck.covered || caseData.coverageCheck.message.includes('manual review')));
      case 1:
        return caseData.claimFormActionTaken === 'continued';
      case 2:
        const isCalibrationComplete = !caseData.calibrationNeeded || (caseData.calibrationNeeded && caseData.calibrationSignature);
        return !!((caseData.repairItems.length > 0 && isCalibrationComplete) || caseData.skippedItems.includes('parts-labor'));
      case 3:
        return true;
      case 4:
        return !!(caseData.invoice || caseData.skippedItems.includes('invoice'));
      default:
        return false;
    }
  };

  const handleSaveCaseAsDraft = async () => {
    setIsSavingDraft(true);
    
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Case saved as draft:', {
      ...caseData,
      status: 'draft',
      savedAt: new Date().toISOString()
    });
    
    setIsSavingDraft(false);
    setSubmissionOutcome('drafted');
    setCaseSubmitted(true);
    
    if (onCaseSubmitted) {
      onCaseSubmitted({ ...caseData, status: 'draft' });
    }
  };

  const handleNext = () => {
    // If on the last step (Invoice), submit the case
    if (currentStep === steps.length - 1) {
      const approvalStatus = determineCaseApprovalStatus(caseData);
      updatePreCheck(approvalStatus);
      handleCaseSubmit();
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    const stepId = steps[currentStep].id;
    if (!caseData.skippedItems.includes(stepId)) {
      addSkippedItem(stepId);
    }
    handleNext();
  };

  const handleGoToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleStopProcess = () => {
    setSubmissionOutcome('stopped');
    setCaseSubmitted(true);
    if (onCaseSubmitted) {
      onCaseSubmitted({ ...caseData, status: 'stopped' });
    }
  };

  const handleCaseSubmit = () => {
    setCaseSubmitted(true);
    // Call the optional callback with case data
    if (onCaseSubmitted) {
      onCaseSubmitted(caseData);
    }
    // Here you would typically submit to your backend
    console.log('Case submitted:', caseData);
  };

  const handleClaimFormProcessedAndActionChosen = (
    claimForm: any,
    action: 'continued' | 'drafted' | 'stopped' | 'submitted'
  ) => {
    updateClaimForm(claimForm);
    updateClaimFormActionTaken(action);
  };

  const handleSkipConfirm = (confirmedItems: string[]) => {
    // Update confirmed skipped items
    confirmedItems.forEach(item => {
      if (!caseData.skippedItems.includes(item)) {
        addSkippedItem(item);
      }
    });
    setCaseSubmitted(true);
    if (onCaseSubmitted) {
      onCaseSubmitted(caseData);
    }
    console.log('Case submitted with skipped items:', caseData);
  };

  const canShowSkip = () => {
    return currentStep >= 2 && currentStep <= 4 && !caseData.skippedItems.includes(steps[currentStep].id);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <VRNLookupStep
            onVRNLookup={updateVRNData}
            onResetDependentData={resetDependentCaseData}
            onStopProcess={handleStopProcess}
            initialVRN={caseData.vrn}
            initialDamageDate={caseData.damageDate}
            initialInsuranceCompany={caseData.insuranceCompany}
            initialGlassType={caseData.glassType}
            initialVrnConfirmed={caseData.vrnConfirmed}
          />
        );
      case 1:
        return (
          <ClaimFormStep
            vrn={caseData.vrn}
            damageDate={caseData.damageDate}
            insuranceCompany={caseData.insuranceCompany}
            glassType={caseData.glassType}
            onClaimFormUpdated={(claimForm, action) => 
              handleClaimFormProcessedAndActionChosen(claimForm, action)
            }
            initialAdditionalClaimInfo={caseData.additionalClaimInfo}
            onAdditionalClaimInfoUpdated={updateAdditionalClaimInfo}
            setShowClaimFormNavigation={setShowClaimFormNavigation}
            setClaimFormDisablePreviousAndStop={setClaimFormDisablePreviousAndStop}
          />
        );
      case 2:
        return (
          <PartsLaborStep
            glassType={caseData.claimForm?.glassType || 'Windscreen'}
            customerDeductible={250}
            onRepairItemsUpdated={updateRepairItems}
            onCalibrationNeededUpdated={(calibrationNeeded) => 
              updateCalibrationData(calibrationNeeded, caseData.calibrationSignature ?? '', caseData.calibrationDocument ?? null)
            }
            onCalibrationSignatureUpdated={(calibrationSignature) => 
              updateCalibrationData(caseData.calibrationNeeded ?? false, calibrationSignature, caseData.calibrationDocument ?? null)
            }
            onCalibrationDocumentUpdated={(calibrationDocument) => 
              updateCalibrationData(caseData.calibrationNeeded ?? false, caseData.calibrationSignature ?? '', calibrationDocument)
            }
            initialRepairItems={caseData.repairItems}
            initialCalibrationNeeded={caseData.calibrationNeeded ?? false}
            initialCalibrationSignature={caseData.calibrationSignature ?? ''}
            initialCalibrationDocument={caseData.calibrationDocument ?? null}
            initialJobPerformedDate={caseData.jobPerformedDate || ''}
            onJobPerformedDateUpdated={updateJobPerformedDate}
          />
        );
      case 3:
        return (
          <PhotoUploadStep
            onPhotosUploaded={updatePhotos}
            initialPhotos={caseData.photos}
            initialPhotosSkipped={caseData.photosSkipped}
            initialPhotosSkippedReason={caseData.photosSkippedReason}
          />
        );
      case 4:
        return (
          <InvoiceStep
            onInvoiceUploaded={updateInvoice}
            onOcrDataExtracted={updateOcrInvoiceData}
            onGoToStep={handleGoToStep}
            initialInvoice={caseData.invoice}
            repairItems={caseData.repairItems}
          />
        );
      default:
        return null;
    }
  };

  if (caseSubmitted) {
    const getSubmissionTitle = () => {
      switch (submissionOutcome) {
        case 'drafted':
          return 'Case Saved as Draft';
        case 'stopped':
          return 'Process Stopped';
        default:
          return 'Case Submitted Successfully';
      }
    };

    const getSubmissionMessage = () => {
      switch (submissionOutcome) {
        case 'drafted':
          return 'Your case has been saved as a draft. You can continue working on it later or submit it when ready.';
        case 'stopped':
          return 'The case process has been stopped as requested. The coverage check information has been recorded.';
        default:
          return 'Your case has been submitted and will be processed according to the approval status.';
      }
    };

    const getSubmissionIcon = () => {
      switch (submissionOutcome) {
        case 'drafted':
          return 'text-yellow-600';
        case 'stopped':
          return 'text-red-600';
        default:
          return 'text-green-600';
      }
    };

    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${className}`}>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className={`w-16 h-16 ${submissionOutcome === 'drafted' ? 'bg-yellow-100' : submissionOutcome === 'stopped' ? 'bg-red-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <ClipboardList className={`w-8 h-8 ${getSubmissionIcon()}`} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getSubmissionTitle()}</h2>
          <p className="text-gray-600 mb-6">
            {getSubmissionMessage()}
          </p>
          {submissionOutcome === 'submitted' && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between items-center mb-2">
                <span>VRN:</span>
                <span className="font-medium">{caseData.vrn}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Status:</span>
                <span className={`font-medium ${
                  caseData.preCheckResult === 'auto_approved' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {caseData.preCheckResult === 'auto_approved' ? 'Auto-Approved' : 'Manual Review'}
                </span>
              </div>
              {caseData.customerAcceptedNoCoverage && (
                <div className="flex justify-between items-center mb-2">
                  <span>Payment:</span>
                  <span className="font-medium text-red-600">Customer Paid</span>
                </div>
              )}
              {caseData.calibrationNeeded && (
                <div className="flex justify-between items-center mb-2">
                  <span>Calibration:</span>
                  <span className="font-medium text-blue-600">Required</span>
                </div>
              )}
              {caseData.skippedItems.length > 0 && (
                <div className="flex justify-between items-center">
                  <span>Pending Items:</span>
                  <span className="font-medium text-yellow-600">{caseData.skippedItems.length}</span>
                </div>
              )}
            </div>
          </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Case
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mt-3"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClipboardList className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Workshop Case Creation</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressBar steps={steps} currentStep={currentStep} onStepClick={handleGoToStep} />
        
        <div className="mb-8">
          {renderCurrentStep()}
        </div>

        {!(currentStep === 1 && !showClaimFormNavigation) && (
          (currentStep !== 0) || (currentStep === 0 && caseData.vehicle && !caseData.existingCase && canProceedToNextStep())
        ) ? (
          <StepNavigation
            currentStep={currentStep}
            totalSteps={steps.length}
            steps={steps}
            onPrevious={currentStep === 1 && claimFormDisablePreviousAndStop ? undefined : handlePrevious}
            onNext={handleNext}
            onSaveDraft={[1, 2, 3, 4].includes(currentStep) ? handleSaveCaseAsDraft : undefined}
            onStopProcess={currentStep === 1 && claimFormDisablePreviousAndStop ? undefined : ([0, 1].includes(currentStep) ? handleStopProcess : undefined)}
            isSavingDraft={isSavingDraft}
            onSkip={canShowSkip() ? handleSkip : undefined}
            canProceed={canProceedToNextStep()}
            isLastStep={currentStep === steps.length - 1}
          />
        ) : null}
      </main>
    </div>
  );
};

export default CaseCreationFeature;
