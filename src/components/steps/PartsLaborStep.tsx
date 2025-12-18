import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  Settings, 
  AlertTriangle, 
  PenTool, 
  FileText, 
  Upload, 
  X, 
  Shield 
} from 'lucide-react';
import { RepairItem, RepairCategory, PriceAgreementResult } from '../../types/case';

// Foreslåtte reparasjonsposter basert på glasstype
const getSuggestedRepairItems = (glassType: string): RepairItem[] => {
  const baseId = Date.now();
  
  switch (glassType.toLowerCase()) {
    case 'windscreen':
      return [
        {
          id: `${baseId}-1`,
          category: 'Glass',
          articleNumber: 'WS-001',
          quantity: 1,
          unitPrice: 280.00,
          discount: 0,
          suggested: true
        },
        {
          id: `${baseId}-2`,
          category: 'Rutelim',
          articleNumber: 'ADH-001',
          quantity: 1,
          unitPrice: 25.00,
          discount: 0,
          suggested: true
        },
        {
          id: `${baseId}-3`,
          category: 'Arbeid monteringspris',
          articleNumber: '',
          quantity: 1,
          unitPrice: 120.00,
          discount: 0,
          suggested: true
        },
        {
          id: `${baseId}-4`,
          category: 'Miljøavgift',
          articleNumber: 'ENV-001',
          quantity: 1,
          unitPrice: 15.00,
          discount: 0,
          suggested: true
        }
      ];
    
    case 'side window':
      return [
        {
          id: `${baseId}-1`,
          category: 'Glass',
          articleNumber: 'SW-001',
          quantity: 1,
          unitPrice: 150.00,
          discount: 0,
          suggested: true
        },
        {
          id: `${baseId}-2`,
          category: 'Arbeid monteringspris',
          articleNumber: '',
          quantity: 1,
          unitPrice: 80.00,
          discount: 0,
          suggested: true
        },
        {
          id: `${baseId}-3`,
          category: 'Miljøavgift',
          articleNumber: 'ENV-001',
          quantity: 1,
          unitPrice: 10.00,
          discount: 0,
          suggested: true
        }
      ];
    
    case 'rear window':
      return [
        {
          id: `${baseId}-1`,
          category: 'Glass',
          articleNumber: 'RW-001',
          quantity: 1,
          unitPrice: 220.00,
          discount: 0,
          suggested: true
        },
        {
          id: `${baseId}-2`,
          category: 'Rutelim',
          articleNumber: 'ADH-002',
          quantity: 1,
          unitPrice: 20.00,
          discount: 0,
          suggested: true
        },
        {
          id: `${baseId}-3`,
          category: 'Arbeid monteringspris',
          articleNumber: '',
          quantity: 1,
          unitPrice: 100.00,
          discount: 0,
          suggested: true
        },
        {
          id: `${baseId}-4`,
          category: 'Miljøavgift',
          articleNumber: 'ENV-001',
          quantity: 1,
          unitPrice: 12.00,
          discount: 0,
          suggested: true
        }
      ];
    
    case 'sunroof':
      return [
        {
          id: `${baseId}-1`,
          category: 'Glass',
          articleNumber: 'SR-001',
          quantity: 1,
          unitPrice: 320.00,
          discount: 0,
          suggested: true
        },
        {
          id: `${baseId}-2`,
          category: 'Tilbehør',
          articleNumber: 'SR-SEAL-001',
          quantity: 1,
          unitPrice: 45.00,
          discount: 0,
          suggested: true
        },
        {
          id: `${baseId}-3`,
          category: 'Arbeid Timepris',
          articleNumber: '',
          quantity: 2,
          unitPrice: 75.00,
          discount: 0,
          suggested: true
        },
        {
          id: `${baseId}-4`,
          category: 'Miljøavgift',
          articleNumber: 'ENV-001',
          quantity: 1,
          unitPrice: 15.00,
          discount: 0,
          suggested: true
        }
      ];
    
    default:
      // Default items for unknown glass types
      return [
        {
          id: `${baseId}-1`,
          category: 'Glass',
          articleNumber: 'GL-001',
          quantity: 1,
          unitPrice: 200.00,
          discount: 0,
          suggested: true
        },
        {
          id: `${baseId}-2`,
          category: 'Arbeid monteringspris',
          articleNumber: '',
          quantity: 1,
          unitPrice: 90.00,
          discount: 0,
          suggested: true
        }
      ];
  }
};

interface PartsLaborStepProps {
  glassType: string;
  customerEgenandel: number;
  initialRepairItems: RepairItem[];
  onRepairItemsUpdated: (items: RepairItem[]) => void;
  initialCalibrationNeeded: boolean;
  onCalibrationNeededUpdated: (needed: boolean) => void;
  initialCalibrationSignature: string;
  onCalibrationSignatureUpdated: (signature: string) => void;
  initialCalibrationDocument: File | null;
  onCalibrationDocumentUpdated: (document: File | null) => void;
  initialJobPerformedDate: string;
  onJobPerformedDateUpdated: (date: string) => void;
}

const PartsLaborStep: React.FC<PartsLaborStepProps> = ({
  glassType,
  customerDeductible = 250,
  initialRepairItems,
  onRepairItemsUpdated,
  initialCalibrationNeeded,
  onCalibrationNeededUpdated,
  initialCalibrationSignature,
  onCalibrationSignatureUpdated,
  initialCalibrationDocument,
  onCalibrationDocumentUpdated,
  initialJobPerformedDate,
  onJobPerformedDateUpdated,
}) => {
  
  // Internal state management
  const [repairItems, setRepairItems] = useState<RepairItem[]>(initialRepairItems || []);
  const [calibrationNeeded, setCalibrationNeeded] = useState<boolean>(initialCalibrationNeeded);
  const [calibrationSignature, setCalibrationSignature] = useState<string>(initialCalibrationSignature || '');
  const [calibrationDocument, setCalibrationDocument] = useState<File | null>(initialCalibrationDocument);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jobPerformedDate, setJobPerformedDate] = useState<string>(initialJobPerformedDate || '');
  
  const [calibrationFileError, setCalibrationFileError] = useState<string>('');
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<string>('');

  // VAT rate (25%)
  const VAT_RATE = 0.25;

  // Update job performed date when it changes
  useEffect(() => {
    onJobPerformedDateUpdated(jobPerformedDate);
  }, [jobPerformedDate, onJobPerformedDateUpdated]);

  // Load suggested repair items when component mounts or glass type changes
  useEffect(() => {
    // Only load suggested items if no items exist yet (first time or after reset)
    if (initialRepairItems.length === 0) {
      setIsLoading(true);
      
      // Simulate loading time for better UX
      setTimeout(() => {
        const suggestedItems = getSuggestedRepairItems(glassType);
        setRepairItems(suggestedItems);
        onRepairItemsUpdated(suggestedItems);
        setIsLoading(false);
      }, 1000);
    }
  }, [glassType, initialRepairItems.length, onRepairItemsUpdated]);
  
  const repairCategories: RepairCategory[] = [
    'Glass',
    'Tilbehør',
    'Sensor / Sensorgel',
    'Arbeid monteringspris',
    'Arbeid Timepris',
    'Rutelim',
    'Verkstedmateriell',
    'Miljøavgift',
    'Statisk Kalibrering',
    'Dynamisk Kalibrering',
    'Lys/regnsensor Kalibrering',
    'Kombinert Kalibrering',
    'Dab-antenne',
    'Annet',
    'Fraktsone 1',
    'Fraktsone 2',
    'Fraktsone 3',
    'Fraktsone 4',
    'Glass med avvikende rabatt'
  ];

  // Helper functions
  const getTotalPrice = (): number => {
    return repairItems.reduce((total, item) => {
      const discountedPrice = item.unitPrice * (1 - item.discount / 100);
      return total + (discountedPrice * item.quantity);
    }, 0);
  };

  const getCalculatedTotals = () => {
    const subtotal = getTotalPrice();
    const vatAmount = subtotal * VAT_RATE;
    const totalWithVat = subtotal + vatAmount;
    const finalTotal = totalWithVat - customerDeductible;
    
    return {
      subtotal,
      vatAmount,
      totalWithVat,
      deductible: customerDeductible,
      finalTotal
    };
  };

  const addItem = () => {
    const newItem: RepairItem = {
      id: Date.now().toString(),
      category: 'Glass',
      articleNumber: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      suggested: false
    };
    const updatedItems = [...repairItems, newItem];
    setRepairItems(updatedItems);
    onRepairItemsUpdated(updatedItems);
  };

  const updateItem = (id: string, updates: Partial<RepairItem>) => {
    const updatedItems = repairItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setRepairItems(updatedItems);
    onRepairItemsUpdated(updatedItems);
  };

  const removeItem = (id: string) => {
    const updatedItems = repairItems.filter(item => item.id !== id);
    setRepairItems(updatedItems);
    onRepairItemsUpdated(updatedItems);
  };

  const handleCalibrationNeededChange = (needed: boolean) => {
    setCalibrationNeeded(needed);
    onCalibrationNeededUpdated(needed);
  };

  const handleCalibrationSignatureChange = (signature: string) => {
    setCalibrationSignature(signature);
    onCalibrationSignatureUpdated(signature);
  };

  const handleCalibrationDocumentChange = (document: File | null) => {
    setCalibrationDocument(document);
    onCalibrationDocumentUpdated(document);
  };

  const toggleDeveloperMode = () => {
    setIsDeveloperMode(!isDeveloperMode);
    if (isDeveloperMode) {
      // Reset states when exiting developer mode
      setActiveScenario('');
      setCalibrationDocument(null);
      setCalibrationFileError('');
      handleCalibrationDocumentChange(null);
    }
  };

  const setScenario = (scenario: string) => {
    setActiveScenario(scenario);
    
    switch (scenario) {
      case 'uploadSuccess':
        const mockFile = new File(['mock content'], 'calibration-cert.pdf', { type: 'application/pdf' });
        setCalibrationDocument(mockFile);
        setCalibrationFileError('');
        handleCalibrationDocumentChange(mockFile);
        break;
      case 'uploadFailed':
        setCalibrationDocument(null);
        setCalibrationFileError('Kunne ikke laste opp dokumentet, prøv igjen.');
        handleCalibrationDocumentChange(null);
        break;
      case 'noDocument':
        setCalibrationDocument(null);
        setCalibrationFileError('');
        handleCalibrationDocumentChange(null);
        break;
      default:
        break;
    }
  };

  const validateRepairItems = (): string[] => {
    const errors: string[] = [];
    
    if (repairItems.length === 0) {
      errors.push('Minst én reparasjonspost er nødvendig');
    }

    repairItems.forEach((item, index) => {
      if (item.quantity <= 0) {
        errors.push(`Post ${index + 1}: Antall må være større enn 0`);
      }
      if (item.unitPrice < 0) {
        errors.push(`Post ${index + 1}: Enhetspris kan ikke være negativ`);
      }
    });

    return errors;
  };

  const isCalibrationSectionComplete = (): boolean => {
    if (!calibrationNeeded) return true;
    return calibrationSignature.trim() !== '';
  };

  const handleCalibrationDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Skip processing if in developer mode with active scenario
    if (isDeveloperMode && activeScenario) {
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    let error: string | null = null;
    if (file.size > maxSize) {
      error = 'Filstørrelsen må være under 10MB';
    } else if (!allowedTypes.includes(file.type)) {
      error = 'Filen må være i PDF-, JPG- eller PNG-format';
    }

    if (error) {
      setCalibrationFileError(error);
      handleCalibrationDocumentChange(null);
      return;
    }

    setCalibrationFileError('');
    handleCalibrationDocumentChange(file);
  };

  const removeCalibrationDocument = () => {
    handleCalibrationDocumentChange(null);
    setCalibrationFileError('');
  };

  const handleClearCalibrationError = () => {
    setCalibrationFileError('');
    handleCalibrationDocumentChange(null);
  };

  const isDataValid = (): boolean => {
    const repairItemErrors = validateRepairItems();
    const calibrationComplete = isCalibrationSectionComplete();
    
    return repairItemErrors.length === 0 && calibrationComplete;
  };

  return (
    <div className=" mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900"> Deler og arbeid</h2>
            <p className="text-sm text-gray-600">Legg til reparasjonsposter og angi kalibreringsbehov</p>
          </div>
        </div>

        {/* Repair Items Section */}
        <div className="mb-8" style={{ display: isLoading ? 'none' : 'block' }}>
          <div className="flex items-center mb-4">
            <div>
            </div>
          </div>

          {repairItems.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen reparasjonsposter</h3>
              <p className="text-gray-600 mb-4">Start med å legge til første reparasjonspost</p>
              <button
                onClick={addItem}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Legg til første post
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {repairItems.map((item, index) => {
                const discountedPrice = item.unitPrice * (1 - item.discount / 100);
                const totalPrice = discountedPrice * item.quantity;

                return (
                  <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-5 h-5  flex items-center justify-center text-xs font-medium mr-2"> 
                          {index + 1}
                        </div> 
                     
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Fjern post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                      {/* Kategori */}
                      <div className="lg:col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Kategori <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(item.id, { category: e.target.value as RepairCategory })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        >
                          {repairCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      {/* Artikkelnummer */}
                      <div className="lg:col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Artikkelnummer
                        </label>
                        <input
                          type="text"
                          value={item.articleNumber || ''}
                          onChange={(e) => updateItem(item.id, { articleNumber: e.target.value })} 
                          placeholder="Skriv inn artikkelnummer"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>


                      {/* Antall */}
                      <div className="lg:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Antall <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Enhetspris */}
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Enhetspris (kr) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Discount */}
                      <div className="lg:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Rabatt (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => updateItem(item.id, { discount: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Sum per post */}
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Sum per post
                        </label>
                        <div className="bg-white rounded p-2 border border-gray-200 ">
                          <div className="flex justify-between items-center text-xs">
                            <div className="text-right">
                              {item.discount > 0 && (
                                <div className="text-gray-400 line-through">
                                  kr{(item.unitPrice * item.quantity).toFixed(2)}
                                </div>
                              )}
                              <div className="font-semibold text-gray-900">
                                kr{totalPrice.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legg til post Button */}
          {repairItems.length > 0 && (
            <button
              onClick={addItem}
              className="flex items-center justify-center px-6 py-3 mt-4 text-base bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Legg til post
            </button>
          )}

          {/* Total */}
          {repairItems.length > 0 && (
            <div className="mt-4 flex justify-end">
              <div className="bg-gray-50 rounded-lg p-4 min-w-64">
                {(() => {
                  const totals = getCalculatedTotals();
                  return (
                    <>
                      {/* Sum of parts and labor */}
                      <div className="flex justify-between items-center text-sm text-gray-700 mb-2"> 
                        <span>Delsum:</span>
                        <span>kr{totals.subtotal.toFixed(2)}</span>
                      </div>
                      
                      {/* VAT */}
                      <div className="flex justify-between items-center text-sm text-gray-700 mb-2">
                        <span>MVA (25%):</span>
                        <span>kr{totals.vatAmount.toFixed(2)}</span>
                      </div>
                      
                      {/* Deductible (if applicable) */}
                      <div className="flex justify-between items-center text-sm text-red-600 mb-2">
                        <span>Egenandel:</span>
                        <span>-kr{totals.deductible.toFixed(2)}</span>
                      </div>
                      
                      {/* Separator line */}
                      <div className="border-t border-gray-300 my-3"></div>
                      
                      {/* Final Total */}
                      <div className="flex justify-between items-center">
                        <h4 className="text-base font-semibold text-gray-900">Sum kr betale:</h4>
                        <div className="text-xl font-bold text-gray-900">
                          kr{totals.finalTotal.toFixed(2)}
                        </div>
                      </div>
                    </>
                  );
                })()}
                </div>
            </div>
          )}
        </div>

        {/* Kalibreringsinformasjon Section */}
        <div className="border-t pt-6">
          <div className="flex items-center mb-4">
          
            <div>
              <h3 className="text-lg font-medium text-gray-900"> Kalibreringsinformasjon</h3>
              <p className="text-sm text-gray-600">Angi om reparasjonen krever kalibrering</p>
            </div>
            <button
              onClick={toggleDeveloperMode}
              className={`ml-auto px-3 py-1 text-sm rounded-lg border transition-colors ${
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
                <h3 className="font-medium text-orange-800">Testverktkry for utvikler</h3>
              </div>
              <p className="text-sm text-orange-700 mb-4">
                Velg et scenario for raskt kr teste ulike utfall for kalibreringsopplasting:
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
                  onClick={() => setScenario('noDocument')}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    activeScenario === 'noDocument'
                      ? 'bg-gray-100 text-gray-800 border-gray-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Ingen dokument
                </button>
              </div>
              
              {activeScenario && (
                <div className="mt-3 p-3 bg-white rounded border border-orange-200">
                  <p className="text-sm text-orange-700">
                    <strong>Aktivt scenario:</strong> {
                      activeScenario === 'uploadSuccess' ? 'Opplasting vellykket - viser lastet dokument med detaljer' :
                      activeScenario === 'uploadFailed' ? 'Opplasting feilet - viser filvalideringsfeil med mulighet for nytt forsøk' :
                      activeScenario === 'noDocument' ? 'Ingen dokument - viser starttilstand uten opplasting' :
                      'Ukjent scenario'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {/* Calibration Required Toggle */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
            
                <div className="ml-3">
                  <label htmlFor="calibration-needed" className="text-sm font-medium text-gray-700">
             
                    Krever denne reparasjonen kalibreringkr
                  </label>
                      <input
                  type="checkbox"
                  id="calibration-needed"
                  checked={calibrationNeeded}
                  onChange={(e) => handleCalibrationNeededChange(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded ml-3 "
                />
                  <p className="text-xs text-gray-500 mt-1">
                    Huk av hvis glassbyttet pkrvirker ADAS-systemer, kameraer eller sensorer
                  </p>
                </div>
              </div>
              
              {!calibrationNeeded && (
                <div className="mt-3 ml-7 flex items-center text-green-600 text-sm">
                  <Check className="w-4 h-4 mr-1" />
                  Ingen kalibrering nkrdvendig - seksjonen er komplett
                </div>
              )}
            </div>

            {/* Calibration Details - Only show when calibration is needed */}
            {calibrationNeeded && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center text-purple-800 mb-3">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="font-medium"> Kalibrering kreves - fullfør feltene</span>
                </div>

                {/* Signature Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <PenTool className="w-4 h-4 inline mr-1" />
                    Tekniker-signatur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={calibrationSignature}
                    onChange={(e) => handleCalibrationSignatureChange(e.target.value)}
                    placeholder="Skriv inn navn/signatur til tekniker"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      calibrationSignature.trim() ? 'border-green-300 bg-green-50' : 'border-gray-300'
                    }`}
                  />
                  {calibrationSignature.trim() ? (
                    <div className="mt-1 flex items-center text-green-600 text-sm">
                      <Check className="w-3 h-3 mr-1" />
                      Signatur lagt inn
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">
                      Påkrevd: Navn eller signatur til teknikeren som utfører kalibreringen
                    </p>
                  )}
                </div>

                {/* Document Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Kalibreringsdokument (valgfritt)
                  </label>
                  
                  {calibrationDocument ? (
                    <div className="bg-white border border-gray-300 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                               {calibrationDocument.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(calibrationDocument.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={removeCalibrationDocument}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Fjern dokument"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <div className="text-sm text-gray-600 mb-2">
                          Last opp kalibreringssertifikat eller dokumentasjon
                        </div>
                        <div className="text-xs text-gray-400 mb-3">
                          PDF, JPG, PNG (maks 10MB)
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleCalibrationDocumentUpload}
                          className="hidden"
                          id="calibration-document-upload"
                        />
                        <label
                          htmlFor="calibration-document-upload"
                          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Velg fil
                        </label>
                      </div>
                    </div>
                  )}

                  {calibrationFileError && (
                    <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <X className="w-4 h-4 text-red-600 mr-2" />
                        <p className="text-sm text-red-700">{calibrationFileError}</p>
                        <button
                          onClick={handleClearCalibrationError}
                          className="ml-3 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          Prøv igjen
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Completion Status */}
                {isCalibrationSectionComplete() && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center text-green-800">
                      <Check className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium"> Kalibreringsseksjon fullført</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Job Performed Date Section */}
        <div className="mt-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
             
              <div>
                <label htmlFor="job-performed-date" className="text-sm font-medium text-gray-700">
                  Dato utført
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Når ble reparasjonsarbeidet fullført?
                </p> 
              </div>
            </div>
            <input
              type="date"
              id="job-performed-date"
              value={jobPerformedDate}
              onChange={(e) => setJobPerformedDate(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
              {jobPerformedDate && (
                <div className="mt-2 flex items-center text-green-600 text-sm">
                  <Check className="w-4 h-4 mr-1" />
                  Utførelsesdato registrert: {new Date(jobPerformedDate).toLocaleDateString()}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Data Validation Status */}
      {!isDataValid() && repairItems.length > 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <div className="font-medium mb-2">Fullfør følgende for å fullføre dette steget:</div>
              <ul className="list-disc list-inside space-y-1">
                {validateRepairItems().map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
                {calibrationNeeded && !calibrationSignature.trim() && (
                  <li>Kalibreringssignatur er påkrevd når kalibrering er nødvendig</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartsLaborStep;
