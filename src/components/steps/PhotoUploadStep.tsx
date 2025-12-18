import React, { useState } from 'react';
import { Camera, Upload, X, Check, AlertCircle, Info, Trash2, Settings } from 'lucide-react';
import { Photo } from '../../types/case';

interface PhotoUploadStepProps {
  onPhotosUploaded: (photos: Photo[], isComplete: boolean, photosSkipped?: boolean, photosSkippedReason?: string) => void;
  initialPhotos?: Photo[];
  initialPhotosSkipped?: boolean;
  initialPhotosSkippedReason?: string;
}

const PhotoUploadStep: React.FC<PhotoUploadStepProps> = ({ 
  onPhotosUploaded, 
  initialPhotos = [], 
  initialPhotosSkipped = false, 
  initialPhotosSkippedReason = '' 
}) => {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploadErrors, setUploadErrors] = useState<{[key: string]: string}>({});
  const [skipPhotos, setSkipPhotos] = useState<boolean>(initialPhotosSkipped);
  const [skipReason, setSkipReason] = useState<string>(initialPhotosSkippedReason);
  const [skipReasonError, setSkipReasonError] = useState<string>('');
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<string>('');

  // Example images for each required photo type
  const placeholderImages = {
    overview: 'https://i.imgur.com/DxEqaxl.jpg',
    glass_closeup: 'https://i.imgur.com/7V69aYo.jpg',
    damage_closeup: 'https://i.imgur.com/6aHVpSH.jpg'
  };

  const requiredPhotoTypes = [
    { 
      type: 'overview' as const, 
      title: 'Kjøretøy – oversiktsbilde', 
      description: 'Helhetsbilde av kjøretøyet som viser skadeområdet',
      tips: 'Ta bilde på avstand slik at hele kjøretøyet og skadeområdet vises',
      required: true
    },
    { 
      type: 'glass_closeup' as const, 
      title: 'Glass – nærbilde', 
      description: 'Nærbilde av skadet glass',
      tips: 'Fokuser på glasskaden, sørg for godt lys og tydelige sprekker/steinsprut',
      required: true
    },
    { 
      type: 'damage_closeup' as const, 
      title: 'Skade – detalj', 
      description: 'Detaljbilde av selve skaden',
      tips: 'Gå tett på for å vise type og omfang av skaden',
      required: true
    },
    { 
      type: 'extra_documentation' as const, 
      title: 'Ekstra dokumentasjon', 
      description: 'Andre relevante bilder eller dokumentasjon',
      tips: 'Ta med andre relevante bilder/dokumenter som underbygger skaden',
      required: false
    }
  ];

  const toggleDeveloperMode = () => {
    setIsDeveloperMode(!isDeveloperMode);
    if (isDeveloperMode) {
      // Reset states when exiting developer mode
      setActiveScenario('');
      setPhotos([]);
      setUploadErrors({});
      setSkipPhotos(false);
      setSkipReason('');
      setSkipReasonError('');
      onPhotosUploaded([], false, false, '');
    }
  };

  const setScenario = (scenario: string) => {
    setActiveScenario(scenario);
    setUploadErrors({});
    setSkipReasonError('');
    
    switch (scenario) {
      case 'allPhotosUploaded':
        const mockPhotos: Photo[] = requiredPhotoTypes.filter(req => req.required).map((photoType, index) => ({
          id: `mock-${photoType.type}-${Date.now()}`,
          type: photoType.type,
          file: new File(['mock content'], `mock-${photoType.type}.jpg`, { type: 'image/jpeg' }),
          preview: placeholderImages[photoType.type as keyof typeof placeholderImages] || 'https://via.placeholder.com/300x200'
        }));
        setPhotos(mockPhotos);
        setSkipPhotos(false);
        setSkipReason('');
        onPhotosUploaded(mockPhotos, true, false, '');
        break;
        
      case 'uploadFailed':
        setPhotos([]);
        setSkipPhotos(false);
        setSkipReason('');
        setUploadErrors({
          'overview': 'Filen er for stor (12.5MB). Maksgrense er 10MB.',
          'glass_closeup': 'Ugyldig filformat. Last opp JPG, PNG eller WebP.',
          'damage_closeup': 'Opplasting feilet for dette bildet. Prøv igjen.'
        });
        onPhotosUploaded([], false, false, '');
        break;
        
      case 'noPhotos':
        setPhotos([]);
        setSkipPhotos(false);
        setSkipReason('');
        onPhotosUploaded([], false, false, '');
        break;
        
      case 'skippedPhotos':
        setPhotos([]);
        setSkipPhotos(true);
        setSkipReason('Kunden avslo fotodokumentasjon av personvernhensyn');
        onPhotosUploaded([], true, true, 'Kunden avslo fotodokumentasjon av personvernhensyn');
        break;
        
      default:
        break;
    }
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return `Ugyldig filformat for ${file.name}. Last opp kun JPG, PNG eller WebP.`;
    }
    
    if (file.size > maxSize) {
      return `Filen ${file.name} er for stor (${(file.size / 1024 / 1024).toFixed(1)}MB). Maksimumsstørrelse er 10MB.`;
    }
    
    return null;
  };

  const handleFileUpload = (file: File, photoType: Photo['type']) => {
    if (!file || !photoType) return;

    // Skip processing if in developer mode with active scenario
    if (isDeveloperMode && activeScenario) {
      return;
    }

    const error = validateFile(file);
    if (error) {
      setUploadErrors(prev => ({ ...prev, [photoType]: error }));
      return;
    }

    // Clear any previous error for this photo type
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[photoType];
      return newErrors;
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      const newPhoto: Photo = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: photoType,
        file,
        preview: e.target?.result as string
      };
      
      setPhotos(prev => {
        // Fjern any existing photo of this type and add the new one
        const filtered = prev.filter(photo => photo.type !== photoType);
        const updated = [...filtered, newPhoto];
        onPhotosUploaded(updated, checkPhotosCompletion(updated), skipPhotos, skipReason);
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleFileUpload = (files: FileList, photoType: Photo['type']) => {
    if (!files || files.length === 0 || !photoType) return;

    // Skip processing if in developer mode with active scenario
    if (isDeveloperMode && activeScenario) {
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate all files first
    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    // Set errors if any
    if (errors.length > 0) {
      setUploadErrors(prev => ({ ...prev, [photoType]: errors.join('; ') }));
      return;
    }

    // Clear any previous error for this photo type
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[photoType];
      return newErrors;
    });

    // Process valid files
    let processedCount = 0;
    const newPhotos: Photo[] = [];

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto: Photo = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + processedCount,
          type: photoType,
          file,
          preview: e.target?.result as string
        };
        
        newPhotos.push(newPhoto);
        processedCount++;

        // When all files are processed, update state
        if (processedCount === validFiles.length) {
          setPhotos(prev => {
            const updated = [...prev, ...newPhotos];
            onPhotosUploaded(updated, checkPhotosCompletion(updated), skipPhotos, skipReason);
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (photoId: string) => {
    setPhotos(prev => {
      const updated = prev.filter(photo => photo.id !== photoId);
      onPhotosUploaded(updated, checkPhotosCompletion(updated), skipPhotos, skipReason);
      return updated;
    });
    
    // Clear any error for this photo type if no photos of this type remain
    const photoToRemove = photos.find(p => p.id === photoId);
    if (photoToRemove) {
      const remainingPhotosOfType = photos.filter(p => p.type === photoToRemove.type && p.id !== photoId);
      if (remainingPhotosOfType.length === 0) {
        setUploadErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[photoToRemove.type];
          return newErrors;
        });
      }
    }
  };

  const clearUploadError = (photoType: Photo['type']) => {
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[photoType];
      return newErrors;
    });
  };

  const triggerFileInput = (photoType: Photo['type']) => {
    const inputId = `photo-upload-${photoType}`;
    const inputElement = document.getElementById(inputId) as HTMLInputElement;
    if (inputElement) {
      inputElement.click();
    }
  };

  const getPhotosByType = (type: Photo['type']) => {
    return photos.filter(photo => photo.type === type);
  };

  const checkPhotosCompletion = (photosList: Photo[]): boolean => {
    if (skipPhotos) {
      return skipReason.trim() !== '';
    }
    return requiredPhotoTypes.filter(req => req.required).every(req => 
      photosList.some(photo => photo.type === req.type)
    );
  };

  const isStepComplete = (): boolean => {
    if (skipPhotos) {
      return skipReason.trim() !== '';
    }
    return requiredPhotoTypes.filter(req => req.required).every(req => getPhotosByType(req.type).length > 0);
  };

  const handleSkipPhotosChange = (checked: boolean) => {
    setSkipPhotos(checked);
    setSkipReasonError('');
    
    if (checked) {
      // Clear photos when skipping
      setPhotos([]);
      setUploadErrors({});
      onPhotosUploaded([], false, true, skipReason);
    } else {
      // Clear skip reason when not skipping
      setSkipReason('');
      onPhotosUploaded(photos, checkPhotosCompletion(photos), false, '');
    }
  };

  const handleSkipReasonChange = (reason: string) => {
    setSkipReason(reason);
    setSkipReasonError('');
    
    if (skipPhotos) {
      const isComplete = reason.trim() !== '';
      onPhotosUploaded([], isComplete, true, reason);
    }
  };

  const validateSkipReason = (): boolean => {
    if (skipPhotos && skipReason.trim() === '') {
      setSkipReasonError('Vennligst oppgi en begrunnelse for å hoppe over bilder');
      return false;
    }
    return true;
  };

  const getCompletionStatus = () => {
    if (skipPhotos) {
      return skipReason.trim() !== '' ? 'Hoppet over' : '0/4';
    }
    const requiredTypes = requiredPhotoTypes.filter(req => req.required);
    const completed = requiredTypes.filter(req => getPhotosByType(req.type).length > 0).length;
    return `${completed}/${requiredTypes.length}`;
  };

  const handleDrag = (e: React.DragEvent, photoType: Photo['type']) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, photoType: Photo['type']) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file, photoType);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-6">
        <Camera className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">Fotodokumentasjon</h2>
        <div className="ml-auto flex items-center space-x-2">
          <span className="text-sm text-gray-600">Fremdrift: {getCompletionStatus()}</span>
          {isStepComplete() && <Check className="w-5 h-5 text-green-500" />}
        </div>
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
            Velg et scenario for å teste ulike utfall for bildeopplasting:
          </p>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setScenario('allPhotosUploaded')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'allPhotosUploaded'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Alle bilder lastet opp
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
              onClick={() => setScenario('noPhotos')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'noPhotos'
                  ? 'bg-gray-100 text-gray-800 border-gray-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Ingen bilder
            </button>
            <button
              onClick={() => setScenario('skippedPhotos')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'skippedPhotos'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Bilder hoppet over
            </button>
          </div>
          
          {activeScenario && (
            <div className="mt-3 p-3 bg-white rounded border border-orange-200">
              <p className="text-sm text-orange-700">
                <strong>Aktivt scenario:</strong> {
                  activeScenario === 'allPhotosUploaded' ? 'Alle bilder lastet opp - viser komplett fotodokumentasjon' :
                  activeScenario === 'uploadFailed' ? 'Opplasting feilet - viser filvalideringsfeil for flere bildetyper' :
                  activeScenario === 'noPhotos' ? 'Ingen bilder - starttilstand uten opplastinger' :
                  activeScenario === 'skippedPhotos' ? 'Bilder hoppet over - viser begrunnelse' :
                  'Ukjent scenario'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Krav til bilder</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>- Ta klare, godt belyste bilder av alle påkrevde områder</li>
              <li>- Sørg for at skaden er tydelig synlig på nærbilder</li>
              <li>- Ta også oversiktsbilder som viser hele kjøretøyet</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Skip Photos Option */}
      <div className="mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="skip-photos"
              checked={skipPhotos}
              onChange={(e) => handleSkipPhotosChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <div className="ml-3 flex-1">
              <label htmlFor="skip-photos" className="text-sm font-medium text-gray-700">
                Fotodokumentasjon er ikke nødvendig i denne saken
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Kryss av hvis bilder ikke kreves for denne saken
              </p>
            </div>
          </div>
            
          {skipPhotos && (
            <div className="mt-4 ml-7">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Begrunnelse for å hoppe over bilder <span className="text-red-500">*</span>
              </label>
              <textarea
                value={skipReason}
                onChange={(e) => handleSkipReasonChange(e.target.value)}
                onBlur={validateSkipReason}
                placeholder="Forklar hvorfor bilder hoppes over i denne saken..."
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  skipReasonError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {skipReasonError && (
                <p className="text-sm text-red-600 mt-1">{skipReasonError}</p>
              )}
              {skipReason.trim() && !skipReasonError && (
                <div className="mt-2 flex items-center text-green-600 text-sm">
                  <Check className="w-4 h-4 mr-1" />
                  Begrunnelse lagt inn
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Photo Upload Sections */}
      {!skipPhotos && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requiredPhotoTypes.map((photoType, index) => {
            const existingPhotos = getPhotosByType(photoType.type);
            const hasPhotos = existingPhotos.length > 0;
            const hasError = uploadErrors[photoType.type];
            const isMultiFile = photoType.type === 'extra_documentation';

            return (
              <div key={photoType.type} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {photoType.title}
                      {!photoType.required && <span className="text-sm text-gray-500 ml-2">(Valgfritt)</span>}
                    </h3>
                    <p className="text-sm text-gray-600">{photoType.description}</p>
                  </div>
                  {hasPhotos && <Check className="w-5 h-5 text-green-500" />}
                </div>

                {/* Tips */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-600">
                    <strong>Tips:</strong> {photoType.tips}
                  </p>
                </div>

                {/* Error Display */}
                {hasError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start">
                      <X className="w-4 h-4 text-red-600 mr-2 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-red-700 mb-3">{hasError}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => clearUploadError(photoType.type)}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            Prøv igjen
                          </button>
                          <button
                            onClick={() => {
                              clearUploadError(photoType.type);
                              triggerFileInput(photoType.type);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Velg en annen fil
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Multi-file handling for extra documentation */}
                {isMultiFile ? (
                  <div className="space-y-4">
                    {/* Display existing photos */}
                    {hasPhotos && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">
                          Opplastede bilder ({existingPhotos.length})
                        </h4>
                        {existingPhotos.map((photo) => (
                          <div key={photo.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <img
                                  src={photo.preview}
                                  alt={photo.file.name}
                                  className="w-16 h-16 object-cover rounded border"
                                />
                                <div>
                                  <p className="text-sm font-medium text-green-800">
                                    {photo.file.name}
                                  </p>
                           
                                </div>
                              </div>
                              <button
                                onClick={() => removePhoto(photo.id)}
                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                                title="Fjern"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload more files */}
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors"
                      onDragEnter={(e) => handleDrag(e, photoType.type)}
                      onDragLeave={(e) => handleDrag(e, photoType.type)}
                      onDragOver={(e) => handleDrag(e, photoType.type)}
                      onDrop={(e) => handleDrop(e, photoType.type)}
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {hasPhotos ? 'Last opp flere bilder' : `Last opp ${photoType.title}`}
                        </h4>
                        <p className="text-xs text-gray-500 mb-3">
                          Dra og slipp filene dine her, eller klikk for å velge
                        </p>
                        
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleMultipleFileUpload(e.target.files, photoType.type);
                            }
                            e.target.value = '';
                          }}
                          className="hidden"
                          id={`photo-upload-multiple-${photoType.type}`}
                        />
                        <label
                          htmlFor={`photo-upload-multiple-${photoType.type}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {hasPhotos ? 'Last opp flere' : 'Velg filer'}
                        </label>
                        
                      
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Single file handling for other photo types */
                  hasPhotos ? (
                    <div className="space-y-4">
                      {/* Photo Preview */}
                      <div className="relative">
                        <img
                          src={existingPhotos[0].preview}
                          alt={photoType.title}
                          className="w-full h-48 object-contain bg-gray-100 rounded-lg border"
                        />
                      </div>
                      
                      {/* File Info */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Check className="w-4 h-4 text-green-600 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-green-800">
                                Bilde lastet opp
                              </p>
                            
                            </div>
                          </div>
                          <button
                            onClick={() => removePhoto(existingPhotos[0].id)}
                            className="flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Fjern
                          </button>
                        </div>
                      </div>

                      {/* Replace Photo */}
                      <div className="text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, photoType.type);
                            }
                            e.target.value = '';
                          }}
                          className="hidden"
                          id={`photo-replace-${photoType.type}`}
                        />
                        <label
                          htmlFor={`photo-replace-${photoType.type}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Bytt bilde
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors"
                      onDragEnter={(e) => handleDrag(e, photoType.type)}
                      onDragLeave={(e) => handleDrag(e, photoType.type)}
                      onDragOver={(e) => handleDrag(e, photoType.type)}
                      onDrop={(e) => handleDrop(e, photoType.type)}
                    >
                     {/* Example Image */}
                     {placeholderImages[photoType.type as keyof typeof placeholderImages] && (
                       <div className="mb-4">
                       
                         <img
                           src={placeholderImages[photoType.type as keyof typeof placeholderImages]}
                           alt={`Example ${photoType.title}`}
                           className="w-full h-32 object-cover rounded border border-gray-200 mb-3"
                         />
                       </div>
                     )}
                     
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          Last opp {photoType.title}
                        </h4>
                        <p className="text-sm text-gray-500 mb-4">
                          Dra og slipp filen her, eller klikk for å velge
                        </p>
                        
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, photoType.type);
                            }
                            e.target.value = '';
                          }}
                          className="hidden"
                          id={`photo-upload-${photoType.type}`}
                        />
                        <label
                          htmlFor={`photo-upload-${photoType.type}`}
                          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Velg fil
                        </label>
                        
                     
                      </div>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Status Messages */}
      <div className="mt-6 space-y-4">
        {/* Missing Photos Warning */}
        {!skipPhotos && !isStepComplete() && photos.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Mangler påkrevde bilder</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Last opp alle påkrevde bilder for å fullføre dette steget
                </p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {requiredPhotoTypes
                    .filter(req => req.required && getPhotosByType(req.type).length === 0)
                    .map((req) => (
                      <li key={req.type} className="flex items-center">
                        <X className="w-4 h-4 mr-2" />
                        <strong>{req.title}</strong>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {!skipPhotos && isStepComplete() && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-green-800">Alle bilder lastet opp</h4>
                <p className="text-sm text-green-700">
                  Alle påkrevde bilder er lastet opp
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Skip Photos Success Message */}
        {skipPhotos && skipReason.trim() && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-green-800">Bilder hoppet over</h4>
                <p className="text-sm text-green-700">
                  Bilder er hoppet over i denne saken. Begrunnelse: {skipReason}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUploadStep;
