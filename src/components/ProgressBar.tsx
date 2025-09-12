import React from 'react';
import { Check, Clock, AlertCircle, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Step } from '../types/case';

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep, onStepClick }) => {

  const getStepIcon = (step: Step, index: number) => {
    if (step.status === 'complete') {
      return <Check className="w-4 h-4 text-white" />;
    }
    if (step.status === 'error') {
      return <X className="w-4 h-4 text-white" />;
    }
    if (step.status === 'pending') {
      return <Clock className="w-4 h-4 text-white" />;
    }
    if (index === currentStep) {
      return <div className="w-2 h-2 bg-white rounded-full" />;
    }
    return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
  };

  const getVerticalStepIcon = (step: Step, index: number) => {
    if (step.status === 'complete') {
      return <Check className="w-3 h-3 text-white" />;
    }
    if (step.status === 'error') {
      return <X className="w-3 h-3 text-white" />;
    }
    if (step.status === 'pending') {
      return <Clock className="w-3 h-3 text-white" />;
    }
    return <span className="text-white text-xs font-semibold">{index + 1}</span>;
  };

  const getVerticalStepColor = (step: Step, index: number) => {
    if (step.status === 'complete') return 'bg-green-500';
    if (step.status === 'error') return 'bg-red-500';
    if (step.status === 'pending') return 'bg-yellow-500';
    if (index === currentStep) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const getStatusText = (step: Step) => {
    switch (step.status) {
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Attention needed';
      case 'pending':
        return 'To be added later';
      default:
        return 'Incomplete';
    }
  };
  const getStepColor = (step: Step, index: number) => {
    if (step.status === 'complete') return 'bg-green-500';
    if (step.status === 'error') return 'bg-red-500';
    if (step.status === 'pending') return 'bg-yellow-500';
    if (index === currentStep) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const handleStepClick = (index: number) => {
    if (onStepClick && index !== currentStep) {
      onStepClick(index);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      {/* Compact progress indicator for mobile */}
      <div className="block md:hidden flex items-center justify-between p-2 border rounded-lg mb-4">
        {currentStep > 0 && (
          <button
            onClick={() => handleStepClick(currentStep - 1)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="text-sm">
              {steps[currentStep - 1]?.title || 'Previous'}
            </span>
          </button>
        )}
        
        <h3 className="text-base font-semibold text-gray-900 text-center flex-1 truncate">
          {steps[currentStep]?.title}
        </h3>
        
        {currentStep < steps.length - 1 && (
          <button
            onClick={() => handleStepClick(currentStep + 1)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <span className="text-sm">
              {steps[currentStep + 1]?.title || 'Next'}
            </span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>
      
      {/* Horizontal progress bar for desktop */}
      <div className="hidden md:flex items-center justify-center  overflow-x-auto min-w-0 sm:gap-0">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div 
              className={`flex flex-col items-center min-w-0 flex-shrink-0 ${
                onStepClick && index !== currentStep 
                  ? 'cursor-pointer hover:opacity-80 transition-opacity' 
                  : ''
              }`}
              onClick={() => handleStepClick(index)}
              title={onStepClick && index !== currentStep ? `Go to ${step.title}` : undefined}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getStepColor(step, index)}`}>
                {getStepIcon(step, index)}
              </div>
              <div className="mt-2 text-center min-w-0">
                <p className={`text-xs sm:text-sm font-medium whitespace-nowrap ${ 
                  index === currentStep ? 'text-blue-600 hidden sm:block' : 'text-gray-600 hidden sm:block'
                }`}>
                  {step.title}
                </p>
                {step.status === 'error' && (
                  <p className="text-xs text-red-500 mt-1 whitespace-nowrap hidden sm:block">Attention needed</p>
                )}
                {step.status === 'pending' && (
                  <p className="text-xs text-yellow-600 mt-1 whitespace-nowrap hidden sm:block">To be added later</p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-4 sm:w-8 h-0.5 mx-1 sm:mx-2 flex-shrink-0  ${
                steps[index + 1].status === 'complete' ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;