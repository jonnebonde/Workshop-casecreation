import React, { useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { CalibrationData } from '../types/case';

interface CalibrationSectionProps {
  calibration: CalibrationData;
  onChange: (updates: Partial<CalibrationData>) => void;
}

const CalibrationSection: React.FC<CalibrationSectionProps> = ({ calibration, onChange }) => {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [fileError, setFileError] = useState('');

  const sourceRequiresCalibration = calibration.pidRequiresCalibration || calibration.arRequiresCalibration;
  const calibrationRequired = sourceRequiresCalibration
    ? !calibration.workshopDisagrees
    : calibration.workshopRequiresCalibration;

  const developerStatus = calibration.workshopDisagrees
    ? 'source-required-challenged'
    : calibration.workshopRequiresCalibration
      ? 'source-not-required-challenged'
      : sourceRequiresCalibration
        ? 'source-required-confirmed'
        : 'source-not-required-confirmed';

  const applyDeveloperStatus = (status: string) => {
    const scenarios: Record<string, Partial<CalibrationData>> = {
      'source-required-confirmed': {
        pidRequiresCalibration: true,
        arRequiresCalibration: false,
        workshopDisagrees: false,
        workshopRequiresCalibration: false
      },
      'source-required-challenged': {
        pidRequiresCalibration: true,
        arRequiresCalibration: false,
        workshopDisagrees: true,
        workshopRequiresCalibration: false
      },
      'source-not-required-challenged': {
        pidRequiresCalibration: false,
        arRequiresCalibration: false,
        workshopDisagrees: false,
        workshopRequiresCalibration: true
      },
      'source-not-required-confirmed': {
        pidRequiresCalibration: false,
        arRequiresCalibration: false,
        workshopDisagrees: false,
        workshopRequiresCalibration: false
      }
    };

    onChange(scenarios[status]);
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size must be less than 10 MB.');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setFileError('File must be a PDF, Word document, JPG or PNG.');
      return;
    }

    setFileError('');
    onChange({ document: file });
  };

  const renderDocumentUpload = (supporting = false) => (
    <div>
      <p className="mb-1 text-sm font-medium text-gray-700">
        {supporting ? 'Supporting documentation (optional)' : 'Documentation'}
        {!supporting && <span className="text-red-500"> *</span>}
      </p>
      <p className="mb-2 text-xs text-gray-500">
        {supporting ? 'Attach documentation that supports the change.' : 'Required to complete this section.'}
      </p>

      {calibration.document ? (
        <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-3">
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="h-5 w-5 flex-shrink-0 text-gray-500" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{calibration.document.name}</p>
              <p className="text-xs text-gray-500">{(calibration.document.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button type="button" onClick={() => onChange({ document: null })} className="rounded-md p-2 text-red-600 hover:bg-red-50" aria-label="Remove document">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 text-center hover:border-gray-400">
          <Upload className="mb-2 h-7 w-7 text-gray-400" />
          <span className="text-sm text-gray-600">
            {supporting ? 'Upload supporting documentation' : 'Upload calibration documentation'}
          </span>
          <span className="mt-1 text-xs text-gray-500">PDF, Word, JPG or PNG (max 10 MB)</span>
          <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleDocumentUpload} className="hidden" />
        </label>
      )}

      {fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}
    </div>
  );

  return (
    <div className="border-t pt-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Calibration</h3>
          <p className="text-sm text-gray-600">Review the calibration requirement and add the relevant case information.</p>
        </div>
        <button type="button" onClick={() => setIsDeveloperMode(previous => !previous)} className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${isDeveloperMode ? 'border-yellow-500 bg-yellow-500 text-white shadow-sm' : 'border-yellow-500 bg-white text-yellow-800 hover:bg-yellow-50'}`}>
          Developer mode
        </button>
      </div>

      {isDeveloperMode && (
        <div className="mb-4 rounded-md border border-dashed border-yellow-500 bg-yellow-50 p-3">
          <p className="mb-2 text-sm font-semibold text-gray-900">Select calibration scenario</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['source-required-confirmed', 'SOT: Required / workshop confirms'],
              ['source-required-challenged', 'SOT: Required / workshop challenges'],
              ['source-not-required-challenged', 'SOT: Not required / workshop challenges'],
              ['source-not-required-confirmed', 'SOT: Not required / workshop confirms']
            ].map(([value, label]) => (
              <button key={value} type="button" onClick={() => applyDeveloperStatus(value)} className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition-colors ${developerStatus === value ? 'border-yellow-500 bg-yellow-500 text-white shadow-sm' : 'border-yellow-500 bg-white text-yellow-800 hover:bg-yellow-50'}`}>
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-600">Local override for demonstration and testing.</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-900">
            Calibration is marked as {sourceRequiresCalibration ? 'required' : 'not required'}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Based on the case information, calibration is {sourceRequiresCalibration ? 'required' : 'not required'}.
          </p>

          {sourceRequiresCalibration ? (
            <label className="mt-4 flex cursor-pointer items-start rounded-md border border-gray-200 bg-white p-3 hover:border-gray-300">
              <input type="checkbox" checked={calibration.workshopDisagrees} onChange={event => onChange({ workshopDisagrees: event.target.checked })} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm font-medium text-gray-900">Mark calibration as not required</span>
            </label>
          ) : (
            <label className="mt-4 flex cursor-pointer items-start rounded-md border border-gray-200 bg-white p-3 hover:border-gray-300">
              <input type="checkbox" checked={calibration.workshopRequiresCalibration} onChange={event => onChange({ workshopRequiresCalibration: event.target.checked })} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm font-medium text-gray-900">Mark calibration as required</span>
            </label>
          )}
        </div>

        {calibrationRequired && (
          <div className="rounded-md border border-gray-200 bg-white p-4">
            <h4 className="text-base font-semibold text-gray-900">Calibration details</h4>
            <p className="mt-1 text-sm text-gray-600">Upload documentation from the completed calibration and sign when the work is finished.</p>

            <div className="mt-4">{renderDocumentUpload()}</div>

            <div className="mt-4">
              <label htmlFor="calibration-comment" className="mb-2 block text-sm font-medium text-gray-700">Comment (optional)</label>
              <textarea id="calibration-comment" value={calibration.comment} onChange={event => onChange({ comment: event.target.value })} rows={3} placeholder="Add any relevant information" className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm" />
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="mb-2 text-sm font-medium text-gray-700">Confirmation <span className="text-red-500">*</span></p>
              <label className="flex cursor-pointer items-start rounded-md border border-gray-200 bg-gray-50 p-3 hover:border-gray-300">
                <input type="checkbox" checked={calibration.confirmed} onChange={event => onChange({ confirmed: event.target.checked })} className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-900">I confirm that the workshop has carried out the necessary work according to the car manufacturer's requirements and instructions. The workshop has the necessary expertise, tools and equipment to carry this out.</span>
              </label>
            </div>

            <div className="mt-4">
              <label htmlFor="calibration-signature" className="mb-1 block text-sm font-medium text-gray-700">Signature <span className="text-red-500">*</span></label>
              <p className="mb-2 text-xs text-gray-500">Sign when the calibration is complete and the documentation has been uploaded.</p>
              <input id="calibration-signature" type="text" value={calibration.signature} onChange={event => onChange({ signature: event.target.value })} placeholder="Enter full name" className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm lg:max-w-md" />
            </div>
          </div>
        )}

        {sourceRequiresCalibration && calibration.workshopDisagrees && (
          <div className="rounded-md border border-gray-200 bg-white p-4">
            <h4 className="text-base font-semibold text-gray-900">Calibration requirement change</h4>
            <p className="mt-1 text-sm text-gray-600">Provide a reason for changing the calibration requirement.</p>

            <div className="mt-4">
              <label htmlFor="calibration-reason" className="mb-1 block text-sm font-medium text-gray-700">Reason <span className="text-red-500">*</span></label>
              <p className="mb-2 text-xs text-gray-500">Required to complete this section.</p>
              <textarea id="calibration-reason" value={calibration.comment} onChange={event => onChange({ comment: event.target.value })} rows={3} placeholder="Describe why calibration is not required" className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm" />
            </div>

            <div className="mt-4">{renderDocumentUpload(true)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalibrationSection;
