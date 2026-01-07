import React, { useState } from 'react';
import { Camera, Upload, X, Check, AlertCircle, Info, Trash2, Settings, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Photo } from '../../types/case';

interface ImageExample {
  title: string;
  exampleImageUrl: string;
  description: string;
  tips: string[];
}

interface ImageExampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  examples: ImageExample[];
}

const ImageExampleModal: React.FC<ImageExampleModalProps> = ({
  isOpen,
  onClose,
  examples
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const currentExample = examples[currentIndex];
  const totalExamples = examples.length;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalExamples - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < totalExamples - 1 ? prev + 1 : 0));
  };

  const handleClose = () => {
    setCurrentIndex(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block w-full max-w-3xl overflow-hidden text-left align-middle transition-all transform bg-white rounded-xl shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">
                {currentExample.title} - Example
              </h3>
              <p className="text-sm text-gray-700 mt-1">
                {currentIndex + 1} of {totalExamples}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-700 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-white"
            >
              <X className="h-8 w-8" />
            </button>
          </div>

          <div className="px-6 py-6">
            <p className="text-sm text-gray-700 mb-4">
              {currentExample.description}
            </p>

            <div className="mb-6 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md relative">
              <img
                src={currentExample.exampleImageUrl}
                alt={`${currentExample.title} Example`}
                className="w-full h-auto object-contain bg-gray-50"
              />

              {totalExamples > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
                    aria-label="Previous example"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
                    aria-label="Next example"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                Key Requirements
              </h4>
              <ul className="space-y-2">
                {currentExample.tips.map((tip, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="flex gap-2">
              {examples.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex
                      ? 'bg-blue-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to example ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  type PhotoType = NonNullable<Photo['type']>;

  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploadErrors, setUploadErrors] = useState<Partial<Record<PhotoType, string>>>({});
  const [skipPhotos, setSkipPhotos] = useState<boolean>(initialPhotosSkipped);
  const [skipReason, setSkipReason] = useState<string>(initialPhotosSkippedReason);
  const [skipReasonError, setSkipReasonError] = useState<string>('');
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<string>('');
  const [isExamplesOpen, setIsExamplesOpen] = useState<boolean>(false);

  // Example images for each required photo type
  const placeholderImages = {
       overview: 'https://i.imgur.com/DxEqaxl.jpg',
    glass_closeup: 'https://i.imgur.com/7V69aYo.jpg',
    damage_closeup: 'https://i.imgur.com/6aHVpSH.jpg'
  };

  const imageExamples: ImageExample[] = [
    {
      title: 'Vehicle Overview',
      exampleImageUrl: placeholderImages.overview,
      description: 'Capture a full view of the vehicle that clearly shows the damaged glass area and the surrounding context.',
      tips: [
        'Stand back to include the whole vehicle and the damaged area in one shot',
        'Ensure the vehicle is centered and well lit with minimal glare',
        'Avoid cutting off corners or important parts of the vehicle'
      ]
    },
    {
      title: 'Glass Close-up',
      exampleImageUrl: placeholderImages.glass_closeup,
      description: 'Zoom in on the damaged glass so chips, cracks, or impacts are easily visible.',
      tips: [
        'Focus on the damaged section of the glass with steady hands',
        'Take the photo straight-on to avoid reflections',
        'Use good lighting so cracks and chips are clear'
      ]
    },
    {
      title: 'Damage Detail',
      exampleImageUrl: placeholderImages.damage_closeup,
      description: 'Provide a detailed view that highlights the exact nature and extent of the damage.',
      tips: [
        'Move in close while keeping the damage sharp and in focus',
        'Show scale by including a small object or ruler if helpful',
        'Capture multiple angles if needed to show depth or spread'
      ]
    }
  ];

  const requiredPhotoTypes: Array<{ type: PhotoType; title: string; description: string; tips: string; required: boolean }> = [
    { 
      type: 'overview', 
      title: 'Vehicle Overview', 
      description: 'Full view of the vehicle showing the damaged area',
      tips: 'Focus on showing the entire vehicle and damaged glass area',
      required: true
    },
    { 
      type: 'glass_closeup', 
      title: 'Glass Close-up', 
      description: 'Close-up view of the damaged glass',
      tips: 'Focus on the glass damage with a clear visibility of cracks or chips',
      required: true
    },
    { 
      type: 'damage_closeup', 
      title: 'Damage Detail', 
      description: 'Detailed view of the specific damage area',
      tips: 'Get very close to show the exact nature and extent of the damage',
      required: true
    },
    { 
      type: 'extra_documentation', 
      title: 'Additional Documentation', 
      description: 'Any additional photos or documentation',
      tips: 'Other relevant files related to the case',
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
          'overview': 'Upload failed for this photo. Please try again.',
          'glass_closeup': 'Upload failed for this photo. Please try again.',
          'damage_closeup': 'Upload failed for this photo. Please try again.'
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
        setSkipReason('Customer declined photo documentation due to privacy concerns');
        onPhotosUploaded([], true, true, 'Customer declined photo documentation due to privacy concerns');
        break;
        
      default:
        break;
    }
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file format for ${file.name}. Please upload JPG, PNG, or WebP files only.`;
    }
    
    if (file.size > maxSize) {
      return `File ${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`;
    }
    
    return null;
  };

  const handleFileUpload = (file: File, photoType: PhotoType) => {
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
        // Remove any existing photo of this type and add the new one
        const filtered = prev.filter(photo => photo.type !== photoType);
        const updated = [...filtered, newPhoto];
        onPhotosUploaded(updated, checkPhotosCompletion(updated), skipPhotos, skipReason);
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleFileUpload = (files: FileList, photoType: PhotoType) => {
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
    if (photoToRemove && photoToRemove.type) {
      const photoType = photoToRemove.type as PhotoType;
      const remainingPhotosOfType = photos.filter(p => p.type === photoType && p.id !== photoId);
      if (remainingPhotosOfType.length === 0) {
        setUploadErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[photoType];
          return newErrors;
        });
      }
    }
  };

  const clearUploadError = (photoType: PhotoType) => {
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[photoType];
      return newErrors;
    });
  };

  const triggerFileInput = (photoType: PhotoType) => {
    const inputId = `photo-upload-${photoType}`;
    const inputElement = document.getElementById(inputId) as HTMLInputElement;
    if (inputElement) {
      inputElement.click();
    }
  };

  const getPhotosByType = (type: PhotoType) => {
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
      setSkipReasonError('Please provide a reason for skipping photos');
      return false;
    }
    return true;
  };

  const getCompletionStatus = () => {
    if (skipPhotos) {
      return skipReason.trim() !== '' ? 'Skipped' : '0/4';
    }
    const requiredTypes = requiredPhotoTypes.filter(req => req.required);
    const completed = requiredTypes.filter(req => getPhotosByType(req.type).length > 0).length;
    return `${completed}/${requiredTypes.length}`;
  };

  const handleDrag = (e: React.DragEvent, photoType: PhotoType) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, photoType: PhotoType) => {
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
        <h2 className="text-xl font-semibold text-gray-900">Photo Documentation</h2>
        <div className="ml-auto flex items-center space-x-2">
          <span className="text-sm text-gray-600">Progress: {getCompletionStatus()}</span>
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
            Select a scenario to instantly test different photo upload outcomes:
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
              All Photos Uploaded
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
              onClick={() => setScenario('noPhotos')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'noPhotos'
                  ? 'bg-gray-100 text-gray-800 border-gray-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              No Photos
            </button>
            <button
              onClick={() => setScenario('skippedPhotos')}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeScenario === 'skippedPhotos'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Skipped Photos
            </button>
          </div>
          
          {activeScenario && (
            <div className="mt-3 p-3 bg-white rounded border border-orange-200">
              <p className="text-sm text-orange-700">
                <strong>Active Scenario:</strong> {
                  activeScenario === 'allPhotosUploaded' ? 'All Photos Uploaded - Shows completed photo documentation with all required photos' :
                  activeScenario === 'uploadFailed' ? 'Upload Failed - Shows file validation errors for multiple photo types' :
                  activeScenario === 'noPhotos' ? 'No Photos - Shows initial state with empty photo sections' :
                  activeScenario === 'skippedPhotos' ? 'Skipped Photos - Shows photos skipped with reason provided' :
                  'Unknown scenario'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start justify-between items-center gap-4">
          <div className="flex">
            <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Photo Requirements</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Take clear, well-lit photos of all required areas</li>
                <li>• Ensure damage is clearly visible in close-up shots</li>
                <li>• Include overview shots showing vehicle context</li>
              </ul>
            </div>
          </div>
          <button
            onClick={() => setIsExamplesOpen(true)}
            type="button"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            View photo examples
          </button>
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
                No photo documentation is needed for this case
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Check this if photos are not required for this specific case
              </p>
            </div>
          </div>
          
          {skipPhotos && (
            <div className="mt-4 ml-7">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for skipping photos <span className="text-red-500">*</span>
              </label>
              <textarea
                value={skipReason}
                onChange={(e) => handleSkipReasonChange(e.target.value)}
                onBlur={validateSkipReason}
                placeholder="Please explain why photos are being skipped for this case..."
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
                  Reason provided
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
                      {!photoType.required && <span className="text-sm text-gray-500 ml-2">(Optional)</span>}
                    </h3>
                    <p className="text-sm text-gray-600">{photoType.description}</p>
                  </div>
                  {hasPhotos && <Check className="w-5 h-5 text-green-500" />}
                </div>

                {/* Tips */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>Tips:</strong> {photoType.tips}
                  </p>
                </div>

                {/* Multi-file handling for extra documentation */}
                {isMultiFile ? (
                  <div className="space-y-4">
                    {/* Display existing photos */}
                    {hasPhotos && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">
                          Uploaded Photos ({existingPhotos.length})
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
                                title="Remove"
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
                      className="border-2 border-dashed border-gray-300 rounded-lg p-20 hover:border-gray-400 transition-colors"
                      onDragEnter={(e) => handleDrag(e, photoType.type)}
                      onDragLeave={(e) => handleDrag(e, photoType.type)}
                      onDragOver={(e) => handleDrag(e, photoType.type)}
                      onDrop={(e) => handleDrop(e, photoType.type)}
                    >
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className=" text-lg font-medium text-gray-900 mb-2">
                          {hasPhotos ? 'Upload Additional Photos' : `Upload ${photoType.title}`}
                        </h4>
                        <p className="text-sm text-gray-500 mb-3">
                          Drag and drop your files here, or click to select
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
                          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {hasPhotos ? 'Add More' : 'Choose Files'}
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
                      <div className=" border border-green-500 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Check className="w-4 h-4 text-green-700 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-green-800">
                                Photo Uploaded
                              </p>
                            
                            </div>
                          </div>
                          <button
                            onClick={() => removePhoto(existingPhotos[0].id)}
                            className="flex items-center px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-900 transition-colors"
                          >
                            <Trash2 className="w-5 h-5 " /> 
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
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Replace Photo
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-20 hover:border-gray-400 transition-colors  "
                      onDragEnter={(e) => handleDrag(e, photoType.type)}
                      onDragLeave={(e) => handleDrag(e, photoType.type)}
                      onDragOver={(e) => handleDrag(e, photoType.type)}
                      onDrop={(e) => handleDrop(e, photoType.type)}
                    >
                     {/* Example Image */}
                     
                     
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          Upload {photoType.title}
                        </h4>
                        <p className="text-sm text-gray-500 mb-4">
                          Drag and drop your file here, or click to select
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
                          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-800 cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </label>
                        
                     
                      </div>
                    </div>
                  )
                )}

                {/* Error Display */}
                {hasError && (
                  <div className="border border-red-500 rounded-lg p-3 mt-4">
                    <div className="flex items-start">
                      <X className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-red-700 mb-3">{hasError}</p>
                        <div className="flex space-x-8">
                          <button
                            onClick={() => clearUploadError(photoType.type)}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            Try Again
                          </button>
                          <button
                            onClick={() => {
                              clearUploadError(photoType.type);
                              triggerFileInput(photoType.type);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Choose Another File
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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
          <div className=" border border-yellow-500 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-500 mb-2">Missing Required Photos</h4>
                <p className="text-sm text-yellow-500 mb-3">
                  Please upload all required photos to complete this step
                </p>
                <ul className="text-sm text-yellow-500 space-y-1">
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
          <div className=" border border-green-500 rounded-lg p-4">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-green-800">All Photos Uploaded</h4>
                <p className="text-sm text-green-700">
                  All required photos have been successfully uploaded
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
                <h4 className="font-medium text-green-800">Photos Skipped</h4>
                <p className="text-sm text-green-700">
                  Photos have been skipped for this case. Reason: {skipReason}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <ImageExampleModal
        isOpen={isExamplesOpen}
        onClose={() => setIsExamplesOpen(false)}
        examples={imageExamples}
      />
    </div>
  );
};

export default PhotoUploadStep;
