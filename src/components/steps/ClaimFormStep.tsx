import React, { useState } from 'react';
import { FileText, Upload, Check, X, AlertTriangle, MessageSquare, Send, Save, StopCircle, Settings, Eye } from 'lucide-react';
import { ClaimForm, AdditionalClaimInfo } from '../../types/case';

interface ClaimFormStepProps {
  vrn: string;
  damageDate: string;
  insuranceCompany: string;
  glassType: string;
  onClaimFormUpdated: (
    claimForm: ClaimForm | null, 
    action: 'continued'
  ) => void;
  initialAdditionalClaimInfo?: AdditionalClaimInfo;
  onAdditionalClaimInfoUpdated: (additionalClaimInfo: AdditionalClaimInfo) => void;
  setShowClaimFormNavigation: (show: boolean) => void;
  setClaimFormDisablePreviousAndStop: (disable: boolean) => void;
}

const ClaimFormStep: React.FC<ClaimFormStepProps> = ({ 
  vrn,
  damageDate,
  insuranceCompany,
  glassType,
  onClaimFormUpdated,
  initialAdditionalClaimInfo = {},
  onAdditionalClaimInfoUpdated,
  setShowClaimFormNavigation,
  setClaimFormDisablePreviousAndStop
}) => {
  
  // Standard SMS-melding constants
  const SMS_MESSAGE_TEXT = "Vennligst fyll ut skademeldingen via denne lenken: ";
  const CLAIM_FORM_URL = "https://claimform.autoglass.com/create";
  
  // Standard message for manual claim form description
  const standardClaimDescription = `Glasskade rapportert for ${glassType.toLowerCase()} den ${damageDate}. Forsikringsselskap: ${insuranceCompany}. Kunde kontaktet for skadebehandling. Verkstedet har vurdert og godkjent reparasjon.`;
  
  // Skadeårsak options
  const causeOfDamageOptions = [
    'Steinsprut',
    'Ukjent',
    'Hærverk',
    'Ulykke',
    'Andre årsaker'
  ];
  
  // Wear and tear options
  const wearAndTearOptions = [
    'Liten',
    'Normal',
    'Stor'
  ];
  
  const [isChecking, setIsChecking] = useState(false);
  const [claimForm, setClaimForm] = useState<ClaimForm | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [inputMethod, setInputMethod] = useState<'upload' | 'sms' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [documentProcessed, setDocumentProcessed] = useState<boolean | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string>('');
  const [smsPhoneNumber, setSmsPhoneNumber] = useState<string>('');
  const [showSmsInputForm, setShowSmsInputForm] = useState<boolean>(false);
  const [isSendingSms, setIsSendingSms] = useState<boolean>(false);
  const [showDocumentModal, setShowDocumentModal] = useState<boolean>(false);
  
  // Additional claim info fields
  const [causeOfDamage, setCauseOfDamage] = useState<string>(initialAdditionalClaimInfo?.causeOfDamage || '');
  const [wearAndTear, setWearAndTear] = useState<string>(initialAdditionalClaimInfo?.wearAndTear || '');
  const [place, setPlace] = useState<string>(initialAdditionalClaimInfo?.place || '');
  
  // Mock document URL for demonstration
  const MOCK_CLAIM_DOCUMENT_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  // Check for existing claim form on component mount
  React.useEffect(() => {
    handleCheckExistingClaimForm();
  }, []);

  // Update local state when initialAdditionalClaimInfo changes
  React.useEffect(() => {
    setCauseOfDamage(initialAdditionalClaimInfo?.causeOfDamage || '');
    setWearAndTear(initialAdditionalClaimInfo?.wearAndTear || '');
    setPlace(initialAdditionalClaimInfo?.place || '');
  }, [initialAdditionalClaimInfo]);

  // Helper function to update additional claim info
  const updateAdditionalInfo = (updates: Partial<AdditionalClaimInfo>) => {
    const updatedInfo = {
      causeOfDamage,
      wearAndTear,
      place,
      ...updates
    };
    onAdditionalClaimInfoUpdated(updatedInfo);
  };

  const handleCheckExistingClaimForm = async () => {
    setShowClaimFormNavigation(false);
    setIsChecking(true);
    setHasSearched(true);
    
    // Simulate API call to check for existing claim form
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate 40% chance of finding existing claim form
    const hasExistingForm = Math.random() > 0.6;
    
    if (hasExistingForm) {
      const existingForm: ClaimForm = {
        id: 'CLAIM-2024-001',
        vrn: vrn,
        description: `${glassType} skade rapportert ${damageDate}. Kunde kontaktet forsikringsselskap ${insuranceCompany} for dekning.`,
        exists: true,
        damageDate: damageDate,
        location: 'Oslo, Norge',
        insuranceCompany: insuranceCompany,
        glassType: glassType
      };
      setClaimForm(existingForm);
      onClaimFormUpdated(existingForm, 'continued');
      setShowClaimFormNavigation(true);
      setClaimFormDisablePreviousAndStop(true);
    } else {
      setClaimForm(null);
      setShowClaimFormNavigation(false);
      setClaimFormDisablePreviousAndStop(false);
    }
    
    setIsChecking(false);
  };

  const toggleDeveloperMode = () => {
    setIsDeveloperMode(!isDeveloperMode);
    if (isDeveloperMode) {
      // Reset states when exiting developer mode
      setActiveScenario('');
      setClaimForm(null);
      setHasSearched(false);
      setInputMethod(null);
      setUploadedFile(null);
      setIsProcessingDocument(false);
      setDocumentProcessed(null);
      setFormErrors({});
      setShowClaimFormNavigation(false);
      setClaimFormDisablePreviousAndStop(false);
      // Restart the normal flow
      handleCheckExistingClaimForm();
    }
  };

  const setScenario = (scenario: string) => {
    setActiveScenario(scenario);
    setIsChecking(false);
    setHasSearched(true);
    setFormErrors({});
    setIsProcessingDocument(false);
    
    switch (scenario) {
      case 'existingFound':
        const existingForm: ClaimForm = {
          id: 'CLAIM-DEV-001',
          vrn: vrn,
        description: `${glassType} skade rapportert ${damageDate}. Kunde kontaktet forsikringsselskap ${insuranceCompany} for dekning. Testscenario i utviklermodus.`,
        exists: true,
        damageDate: damageDate,
        location: 'Oslo, Norge',
        insuranceCompany: insuranceCompany,
        glassType: glassType
      };
        setClaimForm(existingForm);
        setInputMethod(null);
        setUploadedFile(null);
        setDocumentProcessed(null);
        setShowClaimFormNavigation(true);
        setClaimFormDisablePreviousAndStop(true);
        onClaimFormUpdated(existingForm, 'continued');
        // Set mock additional info for developer mode
        setCauseOfDamage('Ulykke');
        setWearAndTear('Liten');
        setPlace('Oslo sentrum parkeringsområde');
        updateAdditionalInfo({
          causeOfDamage: 'Ulykke',
          wearAndTear: 'Liten',
          place: 'Oslo sentrum parkeringsområde'
        });
        break;
        
      case 'noExisting':
        setClaimForm(null);
        setInputMethod(null);
        setUploadedFile(null);
        setDocumentProcessed(null);
        setShowClaimFormNavigation(false);
        setClaimFormDisablePreviousAndStop(false);
        break;
        
      case 'uploadSuccess':
        setClaimForm(null);
        setInputMethod('upload');
        const mockFile = new File(['mock content'], 'test-claim.pdf', { type: 'application/pdf' });
        setUploadedFile(mockFile);
        setDocumentProcessed(true);
        const uploadForm: ClaimForm = {
          id: 'CLAIM-UPLOAD-' + Date.now(),
          vrn: vrn,
          description: `Dokument lastet opp: ${glassType}-skade ${damageDate}. Forsikring: ${insuranceCompany}. Tilleggsinfo fra dokument. Test i utviklermodus.`,
          exists: false
        };
        setClaimForm(uploadForm);
        setShowClaimFormNavigation(true);
        setClaimFormDisablePreviousAndStop(true);
        onClaimFormUpdated(uploadForm, 'continued');
        // Set mock additional info for developer mode
        setCauseOfDamage('Steinsprut');
        setWearAndTear('Normal');
        setPlace('E6 ved avkjørsel 15');
        updateAdditionalInfo({
          causeOfDamage: 'Steinsprut',
          wearAndTear: 'Normal',
          place: 'E6 ved avkjørsel 15'
        });
        break;
        
      case 'uploadFailed':
        setClaimForm(null);
        setInputMethod('upload');
        const mockFailFile = new File(['mock content'], 'test-claim-poor.pdf', { type: 'application/pdf' });
        setUploadedFile(mockFailFile);
        setDocumentProcessed(false);
        setShowClaimFormNavigation(true);
        setClaimFormDisablePreviousAndStop(true);
        // Set mock additional info for developer mode
        setCauseOfDamage('Andre årsaker');
        setWearAndTear('Liten');
        setPlace('Hjemmeinnkjørsel, Oslo');
        updateAdditionalInfo({
          causeOfDamage: 'Andre årsaker',
          wearAndTear: 'Liten',
          place: 'Hjemmeinnkjørsel, Oslo'
        });
        break;
        
      case 'smsSent':
        setClaimForm(null);
        setInputMethod('sms');
        setShowSmsInputForm(true);
        const smsForm: ClaimForm = {
          id: 'CLAIM-SMS-' + Date.now(),
          vrn: vrn,
          description: `SMS sendt til kunde for å opprette skademelding. Skade: ${glassType} ${damageDate}. Forsikring: ${insuranceCompany}. Test i utviklermodus.`,
          exists: false
        };
        // Don't set claimForm yet - will be set when SMS is actually sent
        setUploadedFile(null);
        setDocumentProcessed(null);
        setSmsPhoneNumber('+47 400 00 000');
        setShowClaimFormNavigation(true);
        setClaimFormDisablePreviousAndStop(true);
        // Set mock additional info for developer mode
        setCauseOfDamage('Hærverk');
        setWearAndTear('Stor');
        setPlace('P-hus Oslo sentrum');
        updateAdditionalInfo({
          causeOfDamage: 'Hærverk',
          wearAndTear: 'Stor',
          place: 'P-hus Oslo sentrum'
        });
        // Don't call onClaimFormUpdated here - will be called when SMS is actually sent
        break;
        
      default:
        break;
    }
  };

  const handleInputMethodSelect = (method: 'upload' | 'sms') => {
    // Skip if in developer mode with active scenario
    if (isDeveloperMode && activeScenario) {
      return;
    }
    setInputMethod(method);
    setFormErrors({});
    setShowClaimFormNavigation(true);
    setClaimFormDisablePreviousAndStop(false);
    
    if (method === 'sms') {
      setShowSmsInputForm(true);
    }
  };

  const handleFileUpload = (file: File) => {
    // Skip if in developer mode
    if (isDeveloperMode && activeScenario) {
      return;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      setFormErrors({ file: 'Ugyldig filformat. Last opp kun PDF, JPG eller PNG.' });
      return;
    }
    
    if (file.size > maxSize) {
      setFormErrors({ file: `Filen er for stor (${(file.size / 1024 / 1024).toFixed(1)}MB). Maksgrense er 10MB.` });
      return;
    }
    
    setFormErrors({});
    setUploadedFile(file);
    processDocument(file);
  };

  const handleTryUploadAgain = () => {
    setUploadedFile(null);
    setDocumentProcessed(null);
    setFormErrors({});
  };

  const processDocument = async (file: File) => {
    // Skip if in developer mode
    if (isDeveloperMode && activeScenario) {
      return;
    }
    
    setShowClaimFormNavigation(false);
    setIsProcessingDocument(true);
    
    // Simulate document processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate 70% document processing success rate
    const success = Math.random() > 0.3;
    setDocumentProcessed(success);
    
    if (success) {
      const processedForm: ClaimForm = {
        id: 'CLAIM-UPLOAD-' + Date.now(),
        vrn: vrn,
        description: `Dokument lastet opp: ${glassType}-skade ${damageDate}. Forsikring: ${insuranceCompany}. Tilleggsinfo fra dokument.`,
        exists: false
      };
      setClaimForm(processedForm);
      onClaimFormUpdated(processedForm, 'continued');
    }
    
    setIsProcessingDocument(false);
    setShowClaimFormNavigation(true);
    setClaimFormDisablePreviousAndStop(true);
  };

  const handleSMSSent = () => {
    // Skip if in developer mode
    if (isDeveloperMode && activeScenario) {
      return;
    }
    
    // Simulate SMS being sent
    const smsForm: ClaimForm = {
      id: 'CLAIM-SMS-' + Date.now(),
      vrn: vrn,
      description: `SMS sendt til kunde for å opprette skademelding. Skade: ${glassType} ${damageDate}. Forsikring: ${insuranceCompany}.`,
      exists: false
    };
    
    setClaimForm(smsForm);
    onClaimFormUpdated(smsForm, 'continued');
  };

  const handleSendSms = async () => {
    // Validate inputs
    const errors: {[key: string]: string} = {};
    
    if (!smsPhoneNumber.trim()) {
      errors.phoneNumber = 'Telefonnummer er påkrevd';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    setShowClaimFormNavigation(false);
    setIsSendingSms(true);
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create SMS claim form
    const smsForm: ClaimForm = {
      id: 'CLAIM-SMS-' + Date.now(),
      vrn: vrn,
      description: `SMS sent to ${smsPhoneNumber}: "${SMS_MESSAGE_TEXT}${CLAIM_FORM_URL}". Skade: ${glassType} on ${damageDate}. Forsikring: ${insuranceCompany}.`,
      exists: false
    };
    
    setClaimForm(smsForm);
    setShowSmsInputForm(false);
    setIsSendingSms(false);
    setShowClaimFormNavigation(true);
    setClaimFormDisablePreviousAndStop(true);
    onClaimFormUpdated(smsForm, 'continued');
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
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-6">
        <FileText className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">Skademelding</h2>
        <Check className="w-5 h-5 text-green-500 ml-auto" />
        <button
          onClick={toggleDeveloperMode}
          className={`ml-4 px-3 py-1 text-sm rounded-lg border transition-colors ${
            isDeveloperMode 
              ? 'bg-orange-100 text-orange-800 border-orange-300' 
              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-1" />
          Utviklermodus
        </button>
      </div>

      {/* Developer Tool */}
      {isDeveloperMode && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Settings className="w-4 h-4 text-orange-600 mr-2" />
            <h3 className="font-medium text-orange-800">Testverktøy for utvikler</h3>
          </div>
          <p className="text-sm text-orange-700 mb-4">
            Velg et scenario for å teste ulike utfall av skademeldingsprosessen:
          </p>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setScenario('existingFound')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'existingFound'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Skademelding funnet
            </button>
            <button
              onClick={() => setScenario('noExisting')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'noExisting'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Ingen skademelding
            </button>
            <button
              onClick={() => setScenario('uploadSuccess')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'uploadSuccess'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Opplasting vellykket
            </button>
            <button
              onClick={() => setScenario('uploadFailed')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'uploadFailed'
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Opplasting feilet
            </button>
            <button
              onClick={() => setScenario('smsSent')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'smsSent'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              SMS sendt
            </button>
          </div>
          
          {activeScenario && (
            <div className="mt-3 p-3 bg-white rounded border border-orange-200">
              <p className="text-sm text-orange-700">
                <strong>Aktivt scenario:</strong> {
                  activeScenario === 'existingFound' ? 'Skademelding funnet - viser valg for videre handling' :
                  activeScenario === 'noExisting' ? 'Ingen skademelding - viser valg av metode (opplasting/SMS)' :
                  activeScenario === 'uploadSuccess' ? 'Opplasting vellykket - viser lastet dokument og behandling' :
                  activeScenario === 'uploadFailed' ? 'Opplasting feilet - viser feilmelding og nytt forsøk' :
                  activeScenario === 'smsSent' ? 'SMS sendt - viser bekreftelse og valg videre' :
                  'Ukjent scenario'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Case Information Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-800 mb-3">Saksinformasjon</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-600">VRN:</span>
            <div className="font-medium text-blue-900">{vrn}</div>
          </div>
          <div>
            <span className="text-blue-600">Skadedato:</span>
            <div className="font-medium text-blue-900">{damageDate}</div>
          </div>
          <div>
            <span className="text-blue-600">Forsikring:</span>
            <div className="font-medium text-blue-900">{insuranceCompany}</div>
          </div>
          <div>
            <span className="text-blue-600">Glasstype:</span>
            <div className="font-medium text-blue-900">{glassType}</div>
          </div>
        </div>
      </div>

      {/* Checking for existing claim form */}
      {isChecking && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">Ingen skademelding funnet</h3>
              <p className="text-sm text-blue-700">
                Ingen skademelding finnes for VRN {vrn}. Velg hvordan du vil oppgi skadedata.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing claim form found */}
      {hasSearched && claimForm && claimForm.exists && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-green-800 mb-2">Existing Claim Form Found</h3>
                <p className="text-sm text-green-700 mb-4">
                  Flott! En skademelding for dette kjøretøyet ble automatisk funnet og lastet inn.
                </p>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Skadedato:</span>
                      <div className="font-medium text-gray-900">{claimForm.damageDate}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Sted:</span>
                      <div className="font-medium text-gray-900">{claimForm.location}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Forsikringsselskap:</span>
                      <div className="font-medium text-gray-900">{claimForm.insuranceCompany}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Glasstype:</span>
                      <div className="font-medium text-gray-900">{claimForm.glassType}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={() => setShowDocumentModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Vis dokument
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* No existing claim form - show input method selection */}
      {hasSearched && !claimForm && !inputMethod && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 mb-1">Ingen skademelding funnet</h3>
                <p className="text-sm text-yellow-700">
                  Ingen skademelding finnes for VRN {vrn}. Velg hvordan du vil oppgi skadedata.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Velg metode</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Upload Option */}
              <div 
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => handleInputMethodSelect('upload')}
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Last opp skademelding</h4>
                  <p className="text-sm text-gray-600 mb-3">Last opp en eksisterende skademelding for behandling</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>- Raskere behandling</li>
                    <li>- Automatisk datauttrekk</li>
                    <li>- Støtter PDF, JPG, PNG</li>
                  </ul>
                </div>
              </div>

              {/* SMS Option */}
              <div 
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => handleInputMethodSelect('sms')}
              >
                <div className="text-center">
                  <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Send SMS til kunde</h4>
                  <p className="text-sm text-gray-600 mb-3">Send SMS til kunden for å opprette skademelding via plattformen</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>- Kunden fyller ut selv</li>
                    <li>- Automatisk datavalidering</li>
                    <li>- Reduserer verkstedarbeid</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Method */}
      {inputMethod === 'upload' && (
        <div className="space-y-6">
          <div className="flex items-center">
            <button
              onClick={() => setInputMethod(null)}
              className="text-blue-600 hover:text-blue-800 text-sm mr-4"
            >
              ← Tilbake til valg
            </button>
            <h3 className="text-lg font-medium text-gray-900">Last opp skademelding</h3>
          </div>

          {!uploadedFile && (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Last opp skademelding</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Dra og slipp filen her, eller klikk for å velge
                </p>
                
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleInputChange}
                  className="hidden"
                  id="claim-form-upload"
                />
                <label
                  htmlFor="claim-form-upload"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Velg fil
                </label>
              </div>
            </div>
          )}

          {uploadedFile && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">{uploadedFile.name}</p>
                      <p className="text-xs text-green-600">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isProcessingDocument && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                    <div>
                      <h3 className="font-medium text-blue-800">Behandler dokument</h3>
                      <p className="text-sm text-blue-700">
                        Behandler det opplastede dokumentet...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {documentProcessed === true && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-800">Opplasting vellykket</h3>
                      <p className="text-sm text-green-700">
                        Dokumentet ble lastet opp. Verifiser og fyll inn manglende informasjon nedenfor.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {documentProcessed === false && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <X className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-800">Opplasting feilet</h3>
                      <p className="text-sm text-red-700 mb-4">
                        Dokumentet kunne ikke behandles. Prøv å laste opp igjen eller legg inn informasjon manuelt.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleTryUploadAgain}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Prøv opplasting på nytt
                        </button>
                        <button
                          onClick={handleTryUploadAgain}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Bytt fil
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {formErrors.file && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <X className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                <p className="text-sm text-red-700">{formErrors.file}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SMS Method */}
      {inputMethod === 'sms' && (
        <div className="space-y-6">
          <div className="flex items-center">
            <button
              onClick={() => setInputMethod(null)}
              className="text-blue-600 hover:text-blue-800 text-sm mr-4"
            >
              ← Tilbake til valg
            </button>
            <h3 className="text-lg font-medium text-gray-900">SMS sendt til kunde</h3>
          </div>

          {showSmsInputForm ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-800">Send SMS til kunde</h4>
              </div>
              <p className="text-sm text-blue-700 mb-6">
                Skriv inn kundens telefonnummer og tilpass meldingen før sending.
              </p>

              <div className="space-y-4">
                {/* Phone Number Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kundens telefonnummer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={smsPhoneNumber}
                    onChange={(e) => setSmsPhoneNumber(e.target.value)}
                    placeholder="f.eks. +47 400 00 000"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isSendingSms}
                  />
                  {formErrors.phoneNumber && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.phoneNumber}</p>
                  )}
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS-melding
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 min-h-[100px] flex items-center">
                    <p className="text-sm">
                      {SMS_MESSAGE_TEXT}
                      <a 
                        href={CLAIM_FORM_URL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {CLAIM_FORM_URL}
                      </a>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Dette er standardmeldingen som sendes til kunden.
                  </p>
                </div>

                {/* Send Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSendSms}
                    disabled={isSendingSms}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSendingSms ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sender...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send SMS
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <Send className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 mb-2">SMS sendt</h4>
                  <p className="text-sm text-green-700 mb-4">
                    En SMS er sendt til kunden med lenke for å opprette skademelding.
                  </p>
                  
                  {/* SMS Details */}
                  <div className="bg-white rounded-lg p-3 border border-green-200 mb-4">
                    <div className="text-sm text-green-700 space-y-2">
                      <div>
                        <span className="font-medium">Telefon:</span> {smsPhoneNumber}
                      </div>
                      <div>
                        <span className="font-medium">Melding:</span> {SMS_MESSAGE_TEXT}
                        <a 
                          href={CLAIM_FORM_URL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {CLAIM_FORM_URL}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <h5 className="font-medium text-green-800 mb-2">Dette skjer videre:</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>- Kunden mottar SMS med sikker lenke</li>
                      <li>- Kunden fyller ut skademeldingen på plattformen</li>
                      <li>- Data fra skjemaet vises automatisk i saken</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Additional Manual Input Fields */}
      {(hasSearched || inputMethod === 'upload' || inputMethod === 'sms') && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tilleggsinformasjon</h3>
          <p className="text-sm text-gray-600 mb-6">
            Gi flere detaljer om skaden og omstendighetene.
          </p>
          
          <div className="space-y-4">
            {/* Skadeårsak */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skadeårsak <span className="text-red-500">*</span>
              </label>
              <select
                value={causeOfDamage}
                onChange={(e) => {
                  setCauseOfDamage(e.target.value);
                  updateAdditionalInfo({ causeOfDamage: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Velg skadeårsak</option>
                {causeOfDamageOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Wear and Tear */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forhånds slitasje <span className="text-red-500">*</span>
              </label>
              <select
                value={wearAndTear}
                onChange={(e) => {
                  setWearAndTear(e.target.value);
                  updateAdditionalInfo({ wearAndTear: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Velg nivå av slitasje</option>
                {wearAndTearOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Place */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skadested <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={place}
                onChange={(e) => {
                  setPlace(e.target.value);
                  updateAdditionalInfo({ place: e.target.value });
                }}
                placeholder="Hvor skjedde skaden? (f.eks. motorvei, parkeringshus, innkjørsel)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Skademelding (dokument)</h3>
              </div>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 p-4">
              <iframe
                src={MOCK_CLAIM_DOCUMENT_URL}
                className="w-full h-full border border-gray-300 rounded"
                title="Skademelding (dokument)"
              />
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDocumentModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Lukk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimFormStep;














