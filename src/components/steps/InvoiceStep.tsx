import React, { useState } from 'react';
import { FileText, Upload, Check, X, AlertTriangle, Eye, Calculator, ArrowLeft, RotateCcw, Info, HelpCircle, Settings, Edit } from 'lucide-react';
import { RepairItem, InvoiceOcrData } from '../../types/case';

interface InvoiceStepProps {
  onInvoiceUploaded: (invoice: File) => void;
  onOcrDataExtracted: (data: InvoiceOcrData) => void;
  onGoToStep?: (stepIndex: number) => void;
  initialInvoice?: File | null;
  repairItems: RepairItem[];
}

const InvoiceStep: React.FC<InvoiceStepProps> = ({ 
  onInvoiceUploaded, 
  onOcrDataExtracted,
  onGoToStep,
  initialInvoice = null,
  repairItems
}) => {
  const [invoice, setInvoice] = useState<File | null>(initialInvoice);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string>('');
  
  // Manual input states
  const [manualInvoiceNumber, setManualInvoiceNumber] = useState('');
  const [manualKidNumber, setManualKidNumber] = useState('');
  const [manualDueDate, setManualDueDate] = useState('');
  const [manualTotalSum, setManualTotalSum] = useState('');
  const [manualInvoiceFile, setManualInvoiceFile] = useState<File | null>(null);
  const [manualInputErrors, setManualInputErrors] = useState<{[key: string]: string}>({});

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PDF, JPG, or PNG file only.';
    }
    
    if (file.size > maxSize) {
      return `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 10MB limit.`;
    }
    
    return null;
  };

  const calculateItemTotal = (item: RepairItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discount / 100);
    return subtotal - discountAmount;
  };

  const calculateExpectedTotal = () => {
    return repairItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const toggleDeveloperMode = () => {
    setIsDeveloperMode(!isDeveloperMode);
    if (isDeveloperMode) {
      // Reset states when exiting developer mode
      setActiveScenario('');
      setInvoice(null);
      setShowManualInput(false);
      setUploadError(null);
    }
  };

  const setScenario = (scenario: string) => {
    setActiveScenario(scenario);
    setUploadError(null);
    setShowManualInput(false);
    
    const mockFile = new File(['mock invoice content'], 'mock-invoice.pdf', { type: 'application/pdf' });
    
    switch (scenario) {
      case 'uploadSuccess':
        setInvoice(mockFile);
        onInvoiceUploaded(mockFile);
        break;
      case 'uploadFailed':
        setInvoice(mockFile);
        setUploadError('Upload failed. Please try again or choose a different file.');
        onInvoiceUploaded(mockFile);
        break;
      case 'noInvoice':
        setInvoice(null);
        break;
      case 'showManualInput':
        setInvoice(mockFile);
        setShowManualInput(true);
        onInvoiceUploaded(mockFile);
        break;
      default:
        break;
    }
  };

  const handleFileUpload = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }
    
    setUploadError(null);
    setInvoice(file);
    onInvoiceUploaded(file);
  };

  const handleManualFileUpload = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setManualInputErrors(prev => ({ ...prev, file: error }));
      return;
    }
    
    setManualInputErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.file;
      return newErrors;
    });
    
    setManualInvoiceFile(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const removeInvoice = () => {
    setInvoice(null);
    setShowManualInput(false);
    setUploadError(null);
  };


  const handleShowManualInput = () => {
    setShowManualInput(true);
  };

  const validateManualInput = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!manualInvoiceNumber.trim()) {
      errors.invoiceNumber = 'Invoice number is required';
    }
    if (!manualTotalSum.trim() || isNaN(parseFloat(manualTotalSum)) || parseFloat(manualTotalSum) <= 0) {
      errors.totalSum = 'Valid total sum is required';
    }
    if (!manualInvoiceFile) {
      errors.file = 'Invoice copy is required';
    }
    
    setManualInputErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmManualInput = () => {
    if (!validateManualInput()) {
      return;
    }
    
    const manualOcrData: InvoiceOcrData = {
      partsTotal: 0,
      laborTotal: 0,
      totalAmount: parseFloat(manualTotalSum),
      invoiceNumber: manualInvoiceNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      companyName: 'Manual Entry',
      kidNumber: manualKidNumber || undefined,
      dueDate: manualDueDate || undefined
    };
    
    // Pass the manual data up to parent component
    onOcrDataExtracted(manualOcrData);
    
    if (manualInvoiceFile) {
      setInvoice(manualInvoiceFile);
      onInvoiceUploaded(manualInvoiceFile);
    }
    
    setShowManualInput(false);
  };
  const handleGoToPartsLabor = () => {
    if (onGoToStep) {
      onGoToStep(3); // Parts & Labor step index
    }
  };

  const handleReUploadInvoice = () => {
    removeInvoice();
  };


  const hasRepairItems = repairItems.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-6">
        <FileText className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">Invoice Upload</h2>
        {invoice && <Check className="w-5 h-5 text-green-500 ml-auto" />}
        <button
          onClick={toggleDeveloperMode}
          className={`ml-4 px-3 py-1 text-sm rounded-lg border transition-colors ${
            isDeveloperMode 
              ? 'bg-orange-100 text-orange-800 border-orange-300' 
              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-1" />
          Developer Mode
        </button>
      </div>

      {/* Developer Tool */}
      {isDeveloperMode && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Settings className="w-4 h-4 text-orange-600 mr-2" />
            <h3 className="font-medium text-orange-800">Developer Testing Tool</h3>
          </div>
          <p className="text-sm text-orange-700 mb-4">
            Select a scenario to instantly test different invoice upload outcomes:
          </p>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setScenario('uploadSuccess')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'uploadSuccess'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Upload Success
            </button>
            <button
              onClick={() => setScenario('uploadFailed')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'uploadFailed'
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Upload Failed
            </button>
            <button
              onClick={() => setScenario('noInvoice')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'noInvoice'
                  ? 'bg-gray-100 text-gray-800 border-gray-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              No Invoice
            </button>
            <button
              onClick={() => setScenario('showManualInput')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'showManualInput'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Show Manual Input
            </button>
          </div>
          
          {activeScenario && (
            <div className="mt-3 p-3 bg-white rounded border border-orange-200">
              <p className="text-sm text-orange-700">
                <strong>Active Scenario:</strong> {
                  activeScenario === 'uploadSuccess' ? 'Upload Success - Shows successful invoice upload' :
                  activeScenario === 'uploadFailed' ? 'Upload Failed - Shows upload failure with retry options' :
                  activeScenario === 'noInvoice' ? 'No Invoice - Shows initial upload state' :
                  activeScenario === 'showManualInput' ? 'Manual Input - Shows manual data entry form' :
                  'Unknown scenario'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Invoice Content */}
      {invoice ? (
          <div className="space-y-6">
            {/* Upload Error - Show first if present */}
            {uploadError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <X className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-red-800">❌ Invoice Upload Failed</h3>
                    <p className="text-sm text-red-700 mb-4">{uploadError}</p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setUploadError(null)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={handleShowManualInput}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Enter Manually
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Show file info even when failed */}
                <div className="mt-4 bg-white rounded-lg p-3 border border-red-200">
                  <div className="text-sm text-red-700">
                    <p><strong>Failed File:</strong> {invoice.name}</p>
                    <p><strong>Size:</strong> {(invoice.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Type:</strong> {invoice.type}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Success Message - Only show when no upload error */
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-800">✅ Invoice Uploaded Successfully</h3>
                      <div className="mt-2 space-y-1 text-sm text-green-700">
                        <p><strong>File:</strong> {invoice.name}</p>
                        <p><strong>Size:</strong> {(invoice.size / 1024 / 1024).toFixed(2)} MB</p>
                        <p><strong>Type:</strong> {invoice.type}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={removeInvoice}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Remove invoice"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mt-4">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleInputChange}
                    className="hidden"
                    id="invoice-replace"
                  />
                  <label
                    htmlFor="invoice-replace"
                    className="inline-flex items-center px-4 py-2 bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Replace Invoice
                  </label>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Invoice Document</h3>
            
            {/* Upload Requirements */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <HelpCircle className="w-5 h-5 text-gray-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Upload Requirements:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Supported formats:</strong> PDF, JPG, PNG</li>
                    <li>• <strong>Maximum file size:</strong> 10MB</li>
                    <li>• <strong>Quality:</strong> Document should be clear and readable</li>
                    <li>• <strong>Content:</strong> Must include repair items and total amounts</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Upload Error */}
            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <X className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Upload Error</h4>
                    <p className="text-sm text-red-700">{uploadError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Invoice Document</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Drag and drop your invoice here, or click to select a file
                </p>
                
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleInputChange}
                  className="hidden"
                  id="invoice-upload"
                />
                <label
                  htmlFor="invoice-upload"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </label>
              </div>
            </div>
          </div>
        )}

      {/* Manual Input Form */}
      {showManualInput && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Edit className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-blue-800">Manual Invoice Entry</h3>
          </div>
          <p className="text-sm text-blue-700 mb-6">
            Please enter the invoice information manually and upload a copy of the invoice.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Invoice Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={manualInvoiceNumber}
                onChange={(e) => setManualInvoiceNumber(e.target.value)}
                placeholder="Enter invoice number"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  manualInputErrors.invoiceNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {manualInputErrors.invoiceNumber && (
                <p className="text-sm text-red-600 mt-1">{manualInputErrors.invoiceNumber}</p>
              )}
            </div>

            {/* KID Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                KID Number
              </label>
              <input
                type="text"
                value={manualKidNumber}
                onChange={(e) => setManualKidNumber(e.target.value)}
                placeholder="Enter KID number (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={manualDueDate}
                onChange={(e) => setManualDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Total Sum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Sum (£) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={manualTotalSum}
                onChange={(e) => setManualTotalSum(e.target.value)}
                placeholder="Enter total amount"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  manualInputErrors.totalSum ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {manualInputErrors.totalSum && (
                <p className="text-sm text-red-600 mt-1">{manualInputErrors.totalSum}</p>
              )}
            </div>
          </div>

          {/* Invoice Copy Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Invoice Copy <span className="text-red-500">*</span>
            </label>
            {manualInvoiceFile ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">{manualInvoiceFile.name}</p>
                      <p className="text-xs text-green-600">
                        {(manualInvoiceFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setManualInvoiceFile(null)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleManualFileUpload(file);
                      }
                    }}
                    className="hidden"
                    id="manual-invoice-upload"
                  />
                  <label
                    htmlFor="manual-invoice-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                  <p className="text-xs text-gray-400 mt-2">PDF, JPG, PNG (max 10MB)</p>
                </div>
              </div>
            )}
            {manualInputErrors.file && (
              <p className="text-sm text-red-600 mt-1">{manualInputErrors.file}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleConfirmManualInput}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirm Manual Input
            </button>
            <button
              onClick={() => setShowManualInput(false)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      </div>
  );
};

export default InvoiceStep;