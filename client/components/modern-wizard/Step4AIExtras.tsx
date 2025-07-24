import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Brain, ArrowLeft, Upload, FileText, Link, 
  CheckCircle, X, AlertCircle, Loader2, 
  ExternalLink, Globe, Paperclip 
} from 'lucide-react';
import { FileUpload } from '../FileUpload';
import { UploadResponse } from '@/lib/api';

const formSchema = z.object({
  pitchDeck: z.any().optional(),
  financialModel: z.any().optional(),
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  crunchbaseUrl: z.string().url('Please enter a valid Crunchbase URL').optional().or(z.literal('')),
  websiteUrl: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  skipExtras: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface Step4Props {
  onNext: (data: FormData & { uploadedFiles?: UploadResponse[] }) => void;
  onBack: () => void;
  initialData?: Partial<FormData>;
  onSave?: (data: Partial<FormData>) => void;
  userID: string;
}

const fileTypes = [
  { 
    type: 'pitchDeck', 
    label: 'Pitch Deck', 
    icon: '📊', 
    description: 'PDF or PPTX presentation',
    accept: '.pdf,.pptx,.ppt',
    maxSize: '10MB'
  },
  { 
    type: 'financialModel', 
    label: 'Financial Model', 
    icon: '📈', 
    description: 'Excel spreadsheet with projections',
    accept: '.xlsx,.xls,.csv',
    maxSize: '5MB'
  },
];

export function Step4AIExtras({ onNext, onBack, initialData, onSave, userID }: Step4Props) {
  const [skipMode, setSkipMode] = useState(initialData?.skipExtras || false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResponse[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      linkedinUrl: initialData?.linkedinUrl || '',
      crunchbaseUrl: initialData?.crunchbaseUrl || '',
      websiteUrl: initialData?.websiteUrl || '',
      skipExtras: initialData?.skipExtras || false,
    },
    mode: 'onChange'
  });

  const watchedValues = watch();

  // Autosave functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) {
        onSave(watchedValues);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [watchedValues, onSave]);

  const handleFileUploadSuccess = (result: UploadResponse, fileType: string) => {
    setUploadedFiles(prev => [...prev, { ...result, fileType }]);
    setUploadingFiles(prev => prev.filter(f => f !== fileType));
    setUploadErrors(prev => ({ ...prev, [fileType]: '' }));
  };

  const handleFileUploadError = (error: string, fileType: string) => {
    setUploadErrors(prev => ({ ...prev, [fileType]: error }));
    setUploadingFiles(prev => prev.filter(f => f !== fileType));
  };

  const handleFileUploadStart = (fileType: string) => {
    setUploadingFiles(prev => [...prev, fileType]);
    setUploadErrors(prev => ({ ...prev, [fileType]: '' }));
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormData) => {
    if (skipMode) {
      onNext({ ...data, skipExtras: true, uploadedFiles: [] });
    } else {
      onNext({ ...data, uploadedFiles });
    }
  };

  const handleSkipToggle = () => {
    setSkipMode(!skipMode);
    setValue('skipExtras', !skipMode);
  };

  const extractDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  const validateUrl = (url: string, type: string) => {
    if (!url) return true;
    
    try {
      const urlObj = new URL(url);
      switch (type) {
        case 'linkedin':
          return urlObj.hostname.includes('linkedin.com');
        case 'crunchbase':
          return urlObj.hostname.includes('crunchbase.com');
        default:
          return true;
      }
    } catch {
      return false;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="wizard-card p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧠 Upload files or links to boost accuracy
          </h1>
          <p className="text-gray-600">
            Optional but recommended - helps our AI provide more precise valuations
          </p>
        </div>

        {/* Skip Option */}
        <div className="mb-8 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-800">
                Want to skip the extras?
              </p>
              <p className="text-xs text-indigo-700">
                We can generate your valuation with the info you've already provided
              </p>
            </div>
            <button
              type="button"
              onClick={handleSkipToggle}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                skipMode
                  ? 'bg-indigo-200 text-indigo-800'
                  : 'bg-white text-indigo-700 border border-indigo-200'
              }`}
            >
              {skipMode ? 'Add Details' : 'Skip This Step'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <AnimatePresence>
            {!skipMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-8"
              >
                {/* File Uploads */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {fileTypes.map((fileType) => (
                      <div key={fileType.type} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{fileType.icon}</span>
                            <div>
                              <p className="font-medium text-gray-900">{fileType.label}</p>
                              <p className="text-xs text-gray-600">{fileType.description}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {fileType.maxSize}
                          </span>
                        </div>

                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-indigo-300 transition-colors">
                          {uploadingFiles.includes(fileType.type) ? (
                            <div className="text-center">
                              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Uploading {fileType.label}...</p>
                            </div>
                          ) : uploadedFiles.find(f => f.fileType === fileType.type) ? (
                            <div className="text-center">
                              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <p className="text-sm font-medium text-green-800">
                                {fileType.label} uploaded successfully
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  const index = uploadedFiles.findIndex(f => f.fileType === fileType.type);
                                  if (index !== -1) removeUploadedFile(index);
                                }}
                                className="text-xs text-red-600 hover:text-red-800 mt-1"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 mb-2">
                                Drop your {fileType.label.toLowerCase()} here
                              </p>
                              <input
                                type="file"
                                accept={fileType.accept}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileUploadStart(fileType.type);
                                    // Simulate file upload for now
                                    setTimeout(() => {
                                      handleFileUploadSuccess({
                                        bucket: 'demo-bucket',
                                        key: `demo/${file.name}`,
                                        message: 'File uploaded successfully'
                                      }, fileType.type);
                                    }, 2000);
                                  }
                                }}
                                className="hidden"
                                id={`file-${fileType.type}`}
                              />
                              <label
                                htmlFor={`file-${fileType.type}`}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <Paperclip className="w-4 h-4 mr-2" />
                                Choose File
                              </label>
                            </div>
                          )}

                          {uploadErrors[fileType.type] && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3 flex items-center space-x-2 text-red-600"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">{uploadErrors[fileType.type]}</span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* URL Links */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Link className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Company Links</h3>
                  </div>

                  <div className="space-y-4">
                    {/* LinkedIn URL */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span>LinkedIn Company Page</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('linkedinUrl')}
                          type="url"
                          placeholder="https://linkedin.com/company/your-company"
                          className="wizard-input w-full pr-10"
                        />
                        {watchedValues.linkedinUrl && validateUrl(watchedValues.linkedinUrl, 'linkedin') && (
                          <a
                            href={watchedValues.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      {errors.linkedinUrl && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-red-500"
                        >
                          {errors.linkedinUrl.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Crunchbase URL */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                        <Globe className="w-4 h-4 text-orange-600" />
                        <span>Crunchbase Profile</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('crunchbaseUrl')}
                          type="url"
                          placeholder="https://crunchbase.com/organization/your-company"
                          className="wizard-input w-full pr-10"
                        />
                        {watchedValues.crunchbaseUrl && validateUrl(watchedValues.crunchbaseUrl, 'crunchbase') && (
                          <a
                            href={watchedValues.crunchbaseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      {errors.crunchbaseUrl && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-red-500"
                        >
                          {errors.crunchbaseUrl.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Website URL */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                        <Globe className="w-4 h-4 text-green-600" />
                        <span>Company Website</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('websiteUrl')}
                          type="url"
                          placeholder="https://your-company.com"
                          className="wizard-input w-full pr-10"
                        />
                        {watchedValues.websiteUrl && (
                          <a
                            href={watchedValues.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      {errors.websiteUrl && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-red-500"
                        >
                          {errors.websiteUrl.message}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <div className="flex items-start space-x-3">
                    <Brain className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">How this helps</p>
                      <p className="text-sm text-blue-700">
                        Our AI analyzes your documents and profiles to understand your business model, 
                        market positioning, and growth trajectory for more accurate valuations.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {skipMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-gray-600">
                No problem! We'll generate your valuation with the information you've provided.
              </p>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex space-x-4 pt-6">
            <motion.button
              type="button"
              onClick={onBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="wizard-button-secondary flex items-center space-x-2 px-6 py-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </motion.button>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="wizard-button-primary flex-1 py-3 text-lg font-semibold"
              disabled={uploadingFiles.length > 0}
            >
              {uploadingFiles.length > 0 ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                '🚀 Generate My Valuation'
              )}
            </motion.button>
          </div>
        </form>

        {/* Auto-save indicator */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 Your progress is automatically saved
          </p>
        </div>
      </motion.div>
    </div>
  );
}
