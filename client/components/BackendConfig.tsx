import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Check, AlertTriangle, Globe, Monitor } from 'lucide-react';

interface BackendConfigProps {
  onBackendChange?: (url: string) => void;
}

export function BackendConfig({ onBackendChange }: BackendConfigProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [selectedMode, setSelectedMode] = useState<'local' | 'custom' | 'demo'>('local');

  const backendOptions = [
    {
      mode: 'local' as const,
      name: 'Local Development',
      url: 'http://127.0.0.1:8000',
      description: 'Connect to local FastAPI server',
      icon: Monitor,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      mode: 'demo' as const,
      name: 'Demo Mode',
      url: 'demo',
      description: 'Use mock data for demonstration',
      icon: Globe,
      color: 'text-green-600 bg-green-50 border-green-200'
    }
  ];

  useEffect(() => {
    const savedMode = localStorage.getItem('backendMode');
    const savedUrl = localStorage.getItem('customBackendUrl');

    // Auto-detect environment and suggest appropriate mode
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (savedMode) {
      setSelectedMode(savedMode as any);
    } else {
      // Default to demo mode for cloud deployments
      setSelectedMode(isDevelopment ? 'local' : 'demo');
    }

    if (savedUrl) {
      setCustomUrl(savedUrl);
    }
  }, []);

  const handleModeChange = (mode: 'local' | 'custom' | 'demo', url?: string) => {
    setSelectedMode(mode);
    const finalUrl = url || (mode === 'custom' ? customUrl : backendOptions.find(o => o.mode === mode)?.url || '');
    
    localStorage.setItem('backendMode', mode);
    if (mode === 'custom') {
      localStorage.setItem('customBackendUrl', customUrl);
    }
    
    onBackendChange?.(finalUrl);
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>

      {/* Configuration Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Backend Configuration
              </h3>
              
              <div className="space-y-3 mb-6">
                {backendOptions.map((option) => (
                  <button
                    key={option.mode}
                    onClick={() => handleModeChange(option.mode)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedMode === option.mode
                        ? option.color
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <option.icon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{option.name}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                          <div className="text-xs text-gray-500 font-mono">{option.url}</div>
                        </div>
                      </div>
                      {selectedMode === option.mode && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}

                {/* Custom URL Option */}
                <div className={`p-4 rounded-xl border-2 ${
                  selectedMode === 'custom'
                    ? 'text-purple-600 bg-purple-50 border-purple-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Custom Backend</div>
                        <div className="text-sm text-gray-600">Connect to your own backend URL</div>
                      </div>
                    </div>
                    {selectedMode === 'custom' && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://your-backend.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => handleModeChange('custom')}
                      disabled={!customUrl}
                      className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Use Custom URL
                    </button>
                  </div>
                </div>
              </div>

              {/* Environment-specific help */}
              {window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <div className="flex items-start space-x-2">
                    <Globe className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <strong>Cloud Deployment Detected:</strong> Demo Mode is recommended as browsers block
                      requests from HTTPS sites to localhost. To use your local backend, add CORS headers
                      or deploy your backend to a cloud service.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <div className="flex items-start space-x-2">
                    <Monitor className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-800">
                      <strong>Local Development:</strong> You can connect directly to your FastAPI server
                      running on localhost:8000.
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
