import React from 'react';
import { ChevronLeft, ChevronRight, Save, StopCircle } from 'lucide-react';
import { Step } from '../types/case';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
  onPrevious?: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  onStopProcess?: () => void;
  onSkip?: () => void;
  isSavingDraft?: boolean;
  canProceed: boolean;
  isLastStep: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  steps,
  onPrevious,
  onNext,
  onSaveDraft,
  onStopProcess,
  onSkip,
  isSavingDraft,
  canProceed,
  isLastStep,
}) => {
  const getNextStepText = () => {
    if (isLastStep) {
      return 'Submit Case';
    }
    const nextStep = steps[currentStep + 1];
    return nextStep ? `Continue to ${nextStep.title}` : 'Continue';
  };

  return (
    <div className="flex items-center flex-wrap gap-4 bg-white rounded-lg shadow-sm border p-4 mt-6 justify-between">
      {onPrevious && currentStep > 0 && (
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </button>
      )}

      <div className="flex items-stretch justify-end flex-wrap gap-3">
        {onStopProcess && (
          <button
            onClick={onStopProcess}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <StopCircle className="w-4 h-4 mr-2" />
            Stop Process
          </button>
        )}
        
        {onSaveDraft && (
          <button
            onClick={onSaveDraft}
            disabled={isSavingDraft}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingDraft ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </>
            )}
          </button>
        )}
        
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
          >
            Skip Step
          </button>
        )}
        
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          <span className="sm:hidden">{isLastStep ? 'Submit' : 'Next'}</span>
          <span className="hidden sm:inline">
            {getNextStepText()}
          </span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default StepNavigation;
