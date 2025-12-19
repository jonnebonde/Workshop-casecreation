import React, { useState } from 'react';
import { Search, Car, User, AlertTriangle, Check, X, Info, HelpCircle, Settings, Shield, Calculator, Calendar, Building2, StopCircle } from 'lucide-react';
import { Vehicle, Owner, ExistingCase, CoverageCheck, PriceEstimate } from '../../types/case';

interface VRNLookupStepProps {
  onVRNLookup: (
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
  ) => void;
  onResetDependentData: () => void;
  onStopProcess?: () => void;
  initialVRN?: string;
  initialDamageDate?: string;
  initialInsuranceCompany?: string;
  initialGlassType?: string;
  initialVrnConfirmed?: boolean;
}

const VRNLookupStep: React.FC<VRNLookupStepProps> = ({ 
  onVRNLookup, 
  onResetDependentData, 
  onStopProcess,
  initialVRN = '', 
  initialDamageDate = '',
  initialInsuranceCompany = '',
  initialGlassType = '',
  initialVrnConfirmed = false 
}) => {
  const [vrn, setVRN] = useState(initialVRN);
  const [damageDate, setDamageDate] = useState(initialDamageDate);
  const [insuranceCompany, setInsuranceCompany] = useState(initialInsuranceCompany);
  const [glassType, setGlassType] = useState(initialGlassType);
  const [isLooking, setIsLooking] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [existingCase, setExistingCase] = useState<ExistingCase | null>(null);
  const [coverageCheck, setCoverageCheck] = useState<CoverageCheck | null>(null);
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null);
  const [showExistingCase, setShowExistingCase] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string>('');

  const mockVehicleData: Vehicle = {
    vrn: 'DEV123',
    make: 'BMW',
    model: 'X3',
    year: 2021,
    color: 'Black',
    vin: '1HGCM82633A123456'
  };

  const mockOwnerData: Owner = {
    name: 'John Smith',
    address: '123 Main Street, London, SW1A 1AA',
    phone: '+44 20 7946 0958',
    email: 'john.smith@email.com'
  };

  const mockExistingCaseData: ExistingCase = {
    id: 'CASE-2024-001',
    vrn: 'DEV123',
    status: 'open',
    createdDate: '2024-01-15',
    description: 'Windscreen replacement - rear window'
  };

  const mockCoverageData: CoverageCheck = {
    covered: true,
    coverageAmount: 500,
    deductible: 250,
    message: 'Full glass coverage confirmed',
    insuranceCompany: 'Aviva Insurance'
  };

  const mockPriceEstimateData: PriceEstimate = {
    minPrice: 280,
    maxPrice: 450,
    estimatedPrice: 365,
    confidence: 'high',
    factors: ['Standard windscreen replacement', 'No ADAS calibration required', 'Common vehicle model']
  };

  const glassTypes = ['Windscreen', 'Side Window', 'Rear Window', 'Sunroof'];

  const toggleDeveloperMode = () => {
    setIsDeveloperMode(!isDeveloperMode);
    if (isDeveloperMode) {
      // Reset states when exiting developer mode
      setActiveScenario('');
      setVehicle(null);
      setOwner(null);
      setExistingCase(null);
      setCoverageCheck(null);
      setPriceEstimate(null);
      setShowExistingCase(false);
      setLookupError(null);
      setHasSearched(false);
      setVRN('');
    }
  };

  const setScenario = (scenario: string) => {
    // Comprehensive state reset before applying new scenario
    setVRN('');
    setDamageDate('');
    setInsuranceCompany('');
    setGlassType('');
    setIsLooking(false);
    setVehicle(null);
    setOwner(null);
    setExistingCase(null);
    setCoverageCheck(null);
    setPriceEstimate(null);
    setShowExistingCase(false);
    setLookupError(null);
    setHasSearched(true);
    
    setActiveScenario(scenario);
    
    switch (scenario) {
      case 'vehicleFound':
        const testVrn = 'DEV123';
        const testDamageDate = '2024-01-15';
        const testInsuranceCompany = 'Aviva Insurance';
        const testGlassType = 'Windscreen';
        
        setVRN(testVrn);
        setDamageDate(testDamageDate);
        setInsuranceCompany(testInsuranceCompany);
        setGlassType(testGlassType);
        setVehicle(mockVehicleData);
        setOwner(mockOwnerData);
        setCoverageCheck(mockCoverageData);
        setPriceEstimate(mockPriceEstimateData);
        setExistingCase(null);
        setShowExistingCase(false);
        setLookupError(null);
        onVRNLookup(testVrn, testDamageDate, testInsuranceCompany, testGlassType, mockVehicleData, mockOwnerData, null, mockCoverageData, mockPriceEstimateData, true);
        break;
      case 'vrnNotFound':
        const notFoundVrn = 'NOTFOUND';
        setVRN(notFoundVrn);
        setLookupError(`VRN "${notFoundVrn}" not found in our database. Please verify the registration number and try again.`);
        onVRNLookup(notFoundVrn, '', '', '', null, null, null, null, null, false);
        break;
      case 'existingCaseFound':
        const existingVrn = 'DEV123';
        const existingDamageDate = '2024-01-15';
        const existingInsuranceCompany = 'Aviva Insurance';
        const existingGlassType = 'Windscreen';
        
        setVRN(existingVrn);
        setDamageDate(existingDamageDate);
        setInsuranceCompany(existingInsuranceCompany);
        setGlassType(existingGlassType);
        setVehicle(mockVehicleData);
        setOwner(mockOwnerData);
        setCoverageCheck(mockCoverageData);
        setPriceEstimate(mockPriceEstimateData);
        setExistingCase(mockExistingCaseData);
        setShowExistingCase(true);
        setLookupError(null);
        onVRNLookup(existingVrn, existingDamageDate, existingInsuranceCompany, existingGlassType, mockVehicleData, mockOwnerData, mockExistingCaseData, mockCoverageData, mockPriceEstimateData, true);
        break;
      case 'noCoverage':
        const noCoverageVrn = 'DEV123';
        const noCoverageDamageDate = '2024-01-15';
        const noCoverageInsuranceCompany = 'No Coverage Insurance';
        const noCoverageGlassType = 'Windscreen';
        
        setVRN(noCoverageVrn);
        setDamageDate(noCoverageDamageDate);
        setInsuranceCompany(noCoverageInsuranceCompany);
        setGlassType(noCoverageGlassType);
        setVehicle(mockVehicleData);
        setOwner(mockOwnerData);
        setPriceEstimate(mockPriceEstimateData);
        setExistingCase(null);
        setShowExistingCase(false);
        setLookupError(null);
        
        const noCoverageCheck: CoverageCheck = {
          covered: false,
          coverageAmount: 0,
          deductible: 0,
          message: 'No active glass coverage found for this policy',
          insuranceCompany: noCoverageInsuranceCompany
        };
        setCoverageCheck(noCoverageCheck);
        
        onVRNLookup(noCoverageVrn, noCoverageDamageDate, noCoverageInsuranceCompany, noCoverageGlassType, mockVehicleData, mockOwnerData, null, noCoverageCheck, mockPriceEstimateData, true);
        break;
      case 'coverageNeedsReview':
        const reviewVrn = 'DEV123';
        const reviewDamageDate = '2024-01-15';
        const reviewInsuranceCompany = 'Complex Insurance Ltd';
        const reviewGlassType = 'Windscreen';
        
        const reviewCoverageCheck: CoverageCheck = {
          covered: false,
          coverageAmount: 0,
          deductible: 0,
          message: 'Coverage verification requires manual review due to policy complexity',
          insuranceCompany: reviewInsuranceCompany
        };
        
        setVRN(reviewVrn);
        setDamageDate(reviewDamageDate);
        setInsuranceCompany(reviewInsuranceCompany);
        setGlassType(reviewGlassType);
        setVehicle(mockVehicleData);
        setOwner(mockOwnerData);
        setCoverageCheck(reviewCoverageCheck);
        setPriceEstimate(mockPriceEstimateData);
        setExistingCase(null);
        setShowExistingCase(false);
        setLookupError(null);
        onVRNLookup(reviewVrn, reviewDamageDate, reviewInsuranceCompany, reviewGlassType, mockVehicleData, mockOwnerData, null, reviewCoverageCheck, mockPriceEstimateData, true);
        break;
      default:
        break;
    }
  };
  const handleLookup = async () => {
    if (!vrn.trim() || !damageDate || !insuranceCompany || !glassType) return;

    // If in developer mode, apply the active scenario
    if (isDeveloperMode && activeScenario) {
      setScenario(activeScenario);
      return;
    }

    // If VRN or other key data was previously confirmed and user is changing it, reset all dependent data
    if (initialVrnConfirmed && (
      vrn.toUpperCase() !== initialVRN.toUpperCase() ||
      damageDate !== initialDamageDate ||
      insuranceCompany !== initialInsuranceCompany ||
      glassType !== initialGlassType
    )) {
      onResetDependentData();
    }

    setIsLooking(true);
    setLookupError(null);
    setHasSearched(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate 85% success rate for VRN lookup
    const lookupSuccess = Math.random() > 0.15;
    
    if (!lookupSuccess) {
      setVehicle(null);
      setOwner(null);
      setCoverageCheck(null);
      setPriceEstimate(null);
      setExistingCase(null);
      setLookupError(`VRN "${vrn.toUpperCase()}" not found in our database. Please verify the registration number and try again.`);
      setIsLooking(false);
      return;
    }

    const mockVehicle: Vehicle = {
      vrn: vrn.toUpperCase(),
      make: 'BMW',
      model: 'X3',
      year: 2021,
      color: 'Black',
      vin: '1HGCM82633A123456'
    };

    const mockOwner: Owner = {
      name: 'John Smith',
      address: '123 Main Street, London, SW1A 1AA',
      phone: '+44 20 7946 0958',
      email: 'john.smith@email.com'
    };

    // Simulate existing case check (30% chance)
    const mockExistingCase: ExistingCase | null = Math.random() > 0.7 ? {
      id: 'CASE-2024-001',
      vrn: vrn.toUpperCase(),
      status: 'open',
      createdDate: '2024-01-15',
      description: 'Windscreen replacement - rear window'
    } : null;

    // Simulate coverage check (80% have coverage)
    const hasCoverage = Math.random() > 0.2;
    const mockCoverageResult: CoverageCheck = {
      covered: hasCoverage,
      coverageAmount: hasCoverage ? 500 : 0,
      deductible: hasCoverage ? 250 : 0,
      message: hasCoverage ? 'Full glass coverage confirmed' : 'No active glass coverage found for this policy',
      insuranceCompany: insuranceCompany
    };

    // Simulate price estimate based on glass type
  const basePrices: Record<string, { minPrice: number; maxPrice: number; estimatedPrice: number }> = {
    'Windscreen': { minPrice: 280, maxPrice: 450, estimatedPrice: 365 },
    'Side Window': { minPrice: 120, maxPrice: 200, estimatedPrice: 160 },
    'Rear Window': { minPrice: 200, maxPrice: 350, estimatedPrice: 275 },
    'Sunroof': { minPrice: 400, maxPrice: 650, estimatedPrice: 525 }
  };
    const priceData = basePrices[glassType as keyof typeof basePrices] || basePrices['Windscreen'];
    const mockPriceResult: PriceEstimate = {
      ...priceData,
      confidence: 'high',
      factors: [`${glassType} replacement`, 'Standard installation', 'Common vehicle model']
    };

    setVehicle(mockVehicle);
    setOwner(mockOwner);
    setCoverageCheck(mockCoverageResult);
    setPriceEstimate(mockPriceResult);
    setExistingCase(mockExistingCase);
    setShowExistingCase(!!mockExistingCase);
    setIsLooking(false);

    // Automatically confirm the VRN data when lookup is successful
    if (!mockExistingCase) {
      onVRNLookup(vrn, damageDate, insuranceCompany, glassType, mockVehicle, mockOwner, null, mockCoverageResult, mockPriceResult, true);
    }
  };

  const handleContinueExisting = () => {
    setShowGuidanceModal(true);
  };

  const handleCreateNew = () => {
    if (vehicle && owner) {
      onVRNLookup(vrn, damageDate, insuranceCompany, glassType, vehicle, owner, null, coverageCheck, priceEstimate, true);
    }
  };

  const closeGuidanceModal = () => {
    setShowGuidanceModal(false);
  };
  const handleVrnChange = (value: string) => {
    setVRN(value.toUpperCase());
    setLookupError(null);
    if (hasSearched && !vehicle) {
      setHasSearched(false);
    }
  };

  const isFormValid = vrn.trim().length >= 2 && damageDate && insuranceCompany && glassType;
  const hasValidData = vehicle && owner && !showExistingCase;
  const hasNoCoverage = coverageCheck && !coverageCheck.covered && !coverageCheck.message.includes('manual review');
  const canShowSuccessMessage = hasValidData && !hasNoCoverage;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Vehicle & Damage Information</h2>
        {hasValidData && <Check className="w-5 h-5 text-green-500 ml-auto" />}
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
            Select a scenario to instantly test different VRN lookup outcomes:
          </p>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setScenario('vehicleFound')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'vehicleFound'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
               Vehicle Found
            </button>
            <button
              onClick={() => setScenario('vrnNotFound')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'vrnNotFound'
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
               VRN Not Found
            </button>
            <button
              onClick={() => setScenario('noCoverage')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'noCoverage'
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              No Coverage
            </button>
            <button
              onClick={() => setScenario('existingCaseFound')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'existingCaseFound'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
               Existing Case Found
            </button>
            <button
              onClick={() => setScenario('coverageNeedsReview')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'coverageNeedsReview'
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Coverage Needs Review
            </button>
          </div>
          
          {activeScenario && (
            <div className="mt-3 p-3 bg-white rounded border border-orange-200">
              <p className="text-sm text-orange-700">
                <strong>Active Scenario:</strong> {
                  activeScenario === 'vehicleFound' ? 'Vehicle Found - Shows successful lookup with vehicle and owner details' :
                  activeScenario === 'vrnNotFound' ? 'VRN Not Found - Shows error message when VRN is not in database' :
                  activeScenario === 'noCoverage' ? 'No Coverage - Shows vehicle found but no insurance coverage' :
                  activeScenario === 'existingCaseFound' ? 'Existing Case Found - Shows vehicle details with existing case warning' :
                  activeScenario === 'coverageNeedsReview' ? 'Coverage Needs Review - Shows vehicle found but coverage requires manual review' :
                  'Unknown scenario'
                }
              </p>
            </div>
          )}
        </div>
      )}
      <div className="space-y-6">
        {/* Search Form */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Search Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* VRN Input */}
            <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Registration Number (VRN) <span className="text-red-500">*</span>
          </label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={vrn}
                  onChange={(e) => handleVrnChange(e.target.value)}
                  placeholder="Enter VRN (e.g., AB12 CDE)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                    lookupError ? 'border-red-300 bg-red-50' : 
                    hasValidData ? 'border-green-300 bg-green-50' : 
                    'border-gray-300'
                  }`}
                  disabled={isLooking}
                />
                {hasValidData && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {lookupError && (
                  <X className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
            </div>

            {/* Damage Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Damage Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={damageDate}
                onChange={(e) => setDamageDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLooking}
              />
            </div>

            {/* Insurance Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Insurance Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={insuranceCompany}
                onChange={(e) => setInsuranceCompany(e.target.value)}
                placeholder="e.g., Aviva Insurance"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLooking}
              />
            </div>

            {/* Glass Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Glass Type <span className="text-red-500">*</span>
              </label>
              <select
                value={glassType}
                onChange={(e) => setGlassType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLooking}
              >
                <option value="">Select glass type</option>
                {glassTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
              <button
                onClick={handleLookup}
                disabled={!isFormValid || isLooking}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center min-w-[120px] justify-center"
              >
                {isLooking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
              
                    Search Vehicle & Coverage
                  </>
                )}
              </button>
          </div>

          {/* Validation Messages */}
          {!isFormValid && (vrn.length > 0 || damageDate || insuranceCompany || glassType) && (
              <div className="flex items-center text-sm text-red-600">
                <X className="w-4 h-4 mr-2" />
              <span>Please fill in all required fields</span>
              </div>
            )}
        </div>

        {/* Lookup Error */}
        {lookupError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <X className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800 mb-1">VRN Not Found</h3>
                <p className="text-sm text-red-700 mb-3">{lookupError}</p>
                <div className="text-sm text-red-700">
                  <strong>Common issues:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Check for typos (0 vs O, 1 vs I)</li>
                    <li>Verify spacing and format</li>
                    <li>Ensure the vehicle is registered in our system</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle and Owner Data */}
        {vehicle && owner && (
          <div className="space-y-4">
            

            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Vehicle Details */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center mb-3">
                  <Car className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="font-medium text-gray-900">Vehicle Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">VRN:</span>
                    <span className="font-medium">{vehicle.vrn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Make/Model:</span>
                    <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium">{vehicle.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VIN:</span>
                    <span className="font-medium text-xs">{vehicle.vin}</span>
                  </div>
                </div>
              </div>

              {/* Owner Details */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center mb-3">
                  <User className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="font-medium text-gray-900">Owner Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <div className="font-medium">{owner.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <div className="font-medium">{owner.address}</div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{owner.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-xs">{owner.email}</span>
                  </div>
                </div>
              </div>

              {/* Coverage Check Results */}
              {coverageCheck && (
                <div className={`rounded-lg p-4 border ${
                  coverageCheck.covered 
                    ? 'bg-green-50 border-green-200' 
                    : coverageCheck.message.includes('manual review')
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center mb-3">
                    <Shield className={`w-5 h-5 mr-2 ${
                      coverageCheck.covered ? 'text-green-600' : 
                      coverageCheck.message.includes('manual review') ? 'text-purple-600' : 'text-red-600'
                    }`} />
                    <h3 className={`font-medium ${
                      coverageCheck.covered ? 'text-green-900' : 
                      coverageCheck.message.includes('manual review') ? 'text-purple-900' : 'text-red-900'
                    }`}>
                      Insurance Coverage
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        coverageCheck.covered ? 'text-green-800' : 
                        coverageCheck.message.includes('manual review') ? 'text-purple-800' : 'text-red-800'
                      }`}>
                        {coverageCheck.covered ? 'Covered' : 
                         coverageCheck.message.includes('manual review') ? 'Needs Review' : 'Not Covered'}
                      </span>
                    </div>
                    {coverageCheck.covered && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Coverage:</span>
                          <span className="font-medium">£{coverageCheck.coverageAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deductible:</span>
                          <span className="font-medium">£{coverageCheck.deductible}</span>
                        </div>
                      </>
                    )}
                    <div className="pt-2 border-t border-gray-200">
                      <p className={`text-xs ${
                        coverageCheck.covered ? 'text-green-700' : 
                        coverageCheck.message.includes('manual review') ? 'text-purple-700' : 'text-red-700'
                      }`}>
                        {coverageCheck.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

           

            </div>
          </div>
        )}

        {/* Existing Case Warning */}
        {showExistingCase && existingCase && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800 mb-2">Existing Case Found</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  <strong>Important:</strong> An open case already exists for this vehicle. You must choose how to proceed:
                </p>
                <div className="bg-white rounded-lg p-3 mb-4 border border-yellow-200">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Case ID:</span>
                      <div className="font-medium">{existingCase.id}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <div className="font-medium capitalize">{existingCase.status}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <div className="font-medium">{existingCase.createdDate}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Description:</span>
                      <div className="font-medium">{existingCase.description}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-100 rounded-lg p-3 mb-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Choose an option:</h4>
                  <div className="text-sm text-yellow-700 space-y-2">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                      <div>
                        <strong>Continue Existing Case:</strong> Add to or update the current case
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                      <div>
                        <strong>Create New Case:</strong> Start a separate case for this vehicle
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleContinueExisting}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Continue Existing Case
                  </button>
                  <button
                    onClick={handleCreateNew}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Create New Case
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {canShowSuccessMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-green-800">Ready to Continue</h3>
                <p className="text-sm text-green-700">
                  Vehicle and owner information verified. You can now proceed to the next step.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guidance Modal */}
      {showGuidanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Continue Existing Case
              </h3>
              <p className="text-gray-600 mb-6">
                User is guided to the existing case
              </p>
              <button
                onClick={closeGuidanceModal}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stop Process Button Container - Only show for no coverage scenario */}
      {coverageCheck && !coverageCheck.covered && !coverageCheck.message.includes('manual review') && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border flex justify-center">
          <button
            onClick={onStopProcess}
            className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <StopCircle className="w-4 h-4 mr-2" />
            Stop Process
          </button>
        </div>
      )}
    </div>
  );
};

export default VRNLookupStep;
