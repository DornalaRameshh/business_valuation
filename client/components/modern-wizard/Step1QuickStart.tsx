import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ChevronDown,
  Flag,
  Building2,
  Rocket,
  Check,
  X,
  HelpCircle,
} from "lucide-react";

const formSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  country: z.string().min(1, "Please select your country"),
  industry: z.string().min(1, "Please select your industry"),
  stage: z.string().min(1, "Please select your business stage"),
  isLaunched: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface Step1Props {
  onNext: (data: FormData) => void;
  initialData?: Partial<FormData>;
  onSave?: (data: Partial<FormData>) => void;
}

const countries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
];

const industries = [
  { value: "saas", label: "SaaS/Software", icon: "💻" },
  { value: "ecommerce", label: "E-commerce", icon: "🛒" },
  { value: "fintech", label: "FinTech", icon: "💳" },
  { value: "healthtech", label: "HealthTech", icon: "🏥" },
  { value: "edtech", label: "EdTech", icon: "📚" },
  { value: "ai", label: "AI/Machine Learning", icon: "🤖" },
  { value: "biotech", label: "Biotech", icon: "🧬" },
  { value: "cleantech", label: "CleanTech", icon: "🌱" },
  { value: "gaming", label: "Gaming", icon: "🎮" },
  { value: "other", label: "Other", icon: "📦" },
];

const stages = [
  {
    value: "idea",
    label: "Idea",
    description: "Concept stage, validating the idea",
    icon: "💡",
  },
  {
    value: "mvp",
    label: "MVP",
    description: "Building minimum viable product",
    icon: "🔧",
  },
  {
    value: "launched",
    label: "Launched",
    description: "Product is live, getting traction",
    icon: "🚀",
  },
  {
    value: "growth",
    label: "Growth",
    description: "Scaling and expanding",
    icon: "📈",
  },
];

export function Step1QuickStart({ onNext, initialData, onSave }: Step1Props) {
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: initialData?.businessName || "",
      country: initialData?.country || "",
      industry: initialData?.industry || "",
      stage: initialData?.stage || "",
      isLaunched: initialData?.isLaunched || false,
    },
    mode: "onChange",
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

  const selectedCountry = countries.find(
    (c) => c.name === watchedValues.country,
  );
  const selectedIndustry = industries.find(
    (i) => i.value === watchedValues.industry,
  );
  const selectedStage = stages.find((s) => s.value === watchedValues.stage);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const onSubmit = (data: FormData) => {
    onNext(data);
  };

  const handleCountrySelect = (country: (typeof countries)[0]) => {
    setValue("country", country.name, { shouldValidate: true });
    setShowCountryDropdown(false);
    setCountrySearch("");
  };

  const handleIndustrySelect = (industry: (typeof industries)[0]) => {
    setValue("industry", industry.value, { shouldValidate: true });
    setShowIndustryDropdown(false);
  };

  const handleStageSelect = (stage: (typeof stages)[0]) => {
    setValue("stage", stage.value, { shouldValidate: true });
    setShowStageDropdown(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="wizard-card p-6"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3"
          >
            <Rocket className="w-6 h-6 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            👋 Let's get started!
          </h1>
          <p className="text-sm text-gray-600">
            Quick basics - takes less than 2 minutes
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Business Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-900">
              Business Name
            </label>
            <input
              {...register("businessName")}
              placeholder="e.g., InferAI"
              className="wizard-input w-full"
            />
            {errors.businessName && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-red-500"
              >
                {errors.businessName.message}
              </motion.p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-1 relative">
            <label className="block text-sm font-medium text-gray-900">
              Country
            </label>
            <button
              type="button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="wizard-input w-full flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                {selectedCountry ? (
                  <>
                    <span className="text-lg">{selectedCountry.flag}</span>
                    <span>{selectedCountry.name}</span>
                  </>
                ) : (
                  <span className="text-gray-500">Select your country</span>
                )}
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>

            <AnimatePresence>
              {showCountryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 max-h-60 overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span className="text-gray-900">{country.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {errors.country && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-red-500"
              >
                {errors.country.message}
              </motion.p>
            )}
          </div>

          {/* Industry */}
          <div className="space-y-1 relative">
            <label className="block text-sm font-medium text-gray-900">
              Industry
            </label>
            <button
              type="button"
              onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
              className="wizard-input w-full flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                {selectedIndustry ? (
                  <>
                    <span className="text-lg">{selectedIndustry.icon}</span>
                    <span>{selectedIndustry.label}</span>
                  </>
                ) : (
                  <span className="text-gray-500">
                    What industry best describes your business?
                  </span>
                )}
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>

            <AnimatePresence>
              {showIndustryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {industries.map((industry) => (
                    <button
                      key={industry.value}
                      type="button"
                      onClick={() => handleIndustrySelect(industry)}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg">{industry.icon}</span>
                      <span className="text-gray-900">{industry.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {errors.industry && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-red-500"
              >
                {errors.industry.message}
              </motion.p>
            )}
          </div>

          {/* Business Stage */}
          <div className="space-y-1 relative">
            <label className="block text-sm font-medium text-gray-900">
              Business Stage
            </label>
            <button
              type="button"
              onClick={() => setShowStageDropdown(!showStageDropdown)}
              className="wizard-input w-full flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                {selectedStage ? (
                  <>
                    <span className="text-lg">{selectedStage.icon}</span>
                    <span>{selectedStage.label}</span>
                  </>
                ) : (
                  <span className="text-gray-500">How far along are you?</span>
                )}
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>

            <AnimatePresence>
              {showStageDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50"
                >
                  {stages.map((stage) => (
                    <button
                      key={stage.value}
                      type="button"
                      onClick={() => handleStageSelect(stage)}
                      className="w-full flex items-start space-x-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-lg mt-0.5">{stage.icon}</span>
                      <div className="text-left">
                        <div className="text-gray-900 font-medium">
                          {stage.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {stage.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {errors.stage && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-red-500"
              >
                {errors.stage.message}
              </motion.p>
            )}
          </div>

          {/* Product Launched */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">
              Product Launched?
            </label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() =>
                  setValue("isLaunched", false, { shouldValidate: true })
                }
                className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl border-2 transition-all ${
                  watchedValues.isLaunched === false
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="text-lg">🚫</span>
                <span className="font-medium text-sm">No</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setValue("isLaunched", true, { shouldValidate: true })
                }
                className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl border-2 transition-all ${
                  watchedValues.isLaunched === true
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="text-lg">✅</span>
                <span className="font-medium text-sm">Yes</span>
              </button>
            </div>
          </div>

          {/* Next Button */}
          <motion.button
            type="submit"
            disabled={!isValid}
            whileHover={{ scale: isValid ? 1.02 : 1 }}
            whileTap={{ scale: isValid ? 0.98 : 1 }}
            className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
              isValid
                ? "wizard-button-primary"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            → Next
          </motion.button>
        </form>

        {/* Auto-save indicator */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            🔒 Auto-saved
          </p>
        </div>
      </motion.div>
    </div>
  );
}
