import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Step1QuickStart } from "./Step1QuickStart";
import { Step2FinancialSnapshot } from "./Step2FinancialSnapshot";
import { Step3ProductTraction } from "./Step3ProductTraction";
import { Step4AIExtras } from "./Step4AIExtras";
import { ConfirmationStep } from "./ConfirmationStep";
import { BackendConfig } from "../BackendConfig";
import { CheckCircle, Circle } from "lucide-react";
import { fastapiService } from "@/lib/fastapi";

interface WizardData {
  step1?: any;
  step2?: any;
  step3?: any;
  step4?: any;
}

const steps = [
  { id: 1, name: "Quick Start", shortName: "Basics" },
  { id: 2, name: "Financial Snapshot", shortName: "Finances" },
  { id: 3, name: "Product & Traction", shortName: "Traction" },
  { id: 4, name: "AI-Powered Extras", shortName: "Extras" },
];

export function ModernWizardApp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [userID] = useState(
    `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  );
  const [isComplete, setIsComplete] = useState(false);
  const [currentBackendMode, setCurrentBackendMode] = useState<string>("demo");

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("wizardData");
      const savedStep = localStorage.getItem("currentStep");
      const savedBackendMode = localStorage.getItem("backendMode");
      const savedBackendUrl = localStorage.getItem("customBackendUrl");

      if (savedData) {
        setWizardData(JSON.parse(savedData));
      }

      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10));
      }

      // Initialize backend URL based on saved preferences or environment
      if (savedBackendMode === "custom" && savedBackendUrl) {
        fastapiService.setBackendUrl(savedBackendUrl);
        setCurrentBackendMode("Custom Backend");
      } else if (savedBackendMode === "demo") {
        fastapiService.setBackendUrl("demo");
        setCurrentBackendMode("Demo Mode");
      } else if (savedBackendMode === "local") {
        fastapiService.setBackendUrl("http://127.0.0.1:8000");
        setCurrentBackendMode("Local Backend");
      } else {
        // Auto-detect based on environment
        const isDevelopment =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";
        const defaultUrl = isDevelopment ? "http://127.0.0.1:8000" : "demo";
        fastapiService.setBackendUrl(defaultUrl);
        setCurrentBackendMode(isDevelopment ? "Local Backend" : "Demo Mode");

        // Save the default choice
        localStorage.setItem("backendMode", isDevelopment ? "local" : "demo");
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("wizardData", JSON.stringify(wizardData));
      localStorage.setItem("currentStep", currentStep.toString());
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }, [wizardData, currentStep]);

  const updateWizardData = (stepKey: keyof WizardData, data: any) => {
    setWizardData((prev) => ({ ...prev, [stepKey]: data }));
  };

  const handleStep1Next = (data: any) => {
    updateWizardData("step1", data);
    setCurrentStep(2);
  };

  const handleStep2Next = (data: any) => {
    updateWizardData("step2", data);
    setCurrentStep(3);
  };

  const handleStep3Next = (data: any) => {
    updateWizardData("step3", data);
    setCurrentStep(4);
  };

  const handleStep4Next = (data: any) => {
    updateWizardData("step4", data);
    setIsComplete(true);
  };

  const handleBack = (targetStep: number) => {
    setCurrentStep(targetStep);
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep || isComplete) return "completed";
    if (stepId === currentStep) return "current";
    return "pending";
  };

  const getProgressPercentage = () => {
    if (isComplete) return 100;
    return ((currentStep - 1) / (steps.length - 1)) * 100;
  };

  // Clear saved data when starting fresh
  const clearSavedData = () => {
    localStorage.removeItem("wizardData");
    localStorage.removeItem("currentStep");
    setWizardData({});
    setCurrentStep(1);
    setIsComplete(false);
  };

  // Handle backend URL changes
  const handleBackendChange = (url: string) => {
    fastapiService.setBackendUrl(url);
    setCurrentBackendMode(
      url === "demo"
        ? "Demo Mode"
        : url === "http://127.0.0.1:8000"
          ? "Local Backend"
          : "Custom Backend",
    );
    console.log("Backend URL changed to:", url);
  };

  if (isComplete) {
    return (
      <ConfirmationStep
        wizardData={wizardData}
        onStartOver={clearSavedData}
        userID={userID}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                AI-Powered Startup Valuation
              </h1>
              <p className="text-xs text-gray-600">
                Step {currentStep} of {steps.length}
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-600 mb-1">
                {Math.round(getProgressPercentage())}% Complete
              </div>
              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage()}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const isLast = index === steps.length - 1;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div className={`progress-step ${status}`}>
                      {status === "completed" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>

                    <div className="ml-2 hidden sm:block">
                      <div
                        className={`text-xs font-medium ${
                          status === "current"
                            ? "text-blue-600"
                            : status === "completed"
                              ? "text-green-600"
                              : "text-gray-500"
                        }`}
                      >
                        {step.name}
                      </div>
                    </div>

                    <div className="ml-2 sm:hidden">
                      <div
                        className={`text-xs font-medium ${
                          status === "current"
                            ? "text-blue-600"
                            : status === "completed"
                              ? "text-green-600"
                              : "text-gray-500"
                        }`}
                      >
                        {step.shortName}
                      </div>
                    </div>
                  </div>

                  {!isLast && (
                    <div
                      className={`flex-1 h-px mx-3 transition-colors duration-300 ${
                        status === "completed" ? "bg-green-300" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <Step1QuickStart
                onNext={handleStep1Next}
                initialData={wizardData.step1}
                onSave={(data) => updateWizardData("step1", data)}
              />
            )}

            {currentStep === 2 && (
              <Step2FinancialSnapshot
                onNext={handleStep2Next}
                onBack={() => handleBack(1)}
                initialData={wizardData.step2}
                onSave={(data) => updateWizardData("step2", data)}
              />
            )}

            {currentStep === 3 && (
              <Step3ProductTraction
                onNext={handleStep3Next}
                onBack={() => handleBack(2)}
                initialData={wizardData.step3}
                onSave={(data) => updateWizardData("step3", data)}
              />
            )}

            {currentStep === 4 && (
              <Step4AIExtras
                onNext={handleStep4Next}
                onBack={() => handleBack(3)}
                initialData={wizardData.step4}
                onSave={(data) => updateWizardData("step4", data)}
                userID={userID}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-3">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-4">
              <span>🔒 Your data is secure and private</span>
              <span>•</span>
              <span>⚡ Auto-saved as you go</span>
              <span>•</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentBackendMode === "Demo Mode"
                    ? "bg-blue-100 text-blue-700"
                    : currentBackendMode === "Local Backend"
                      ? "bg-green-100 text-green-700"
                      : "bg-purple-100 text-purple-700"
                }`}
              >
                {currentBackendMode}
              </span>
            </div>

            <button
              onClick={clearSavedData}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>

      {/* Backend Configuration */}
      <BackendConfig onBackendChange={handleBackendChange} />
    </div>
  );
}
