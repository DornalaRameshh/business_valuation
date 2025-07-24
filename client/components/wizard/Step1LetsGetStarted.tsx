import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Rocket, AlertCircle } from "lucide-react";

const formSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  country: z.string().min(1, "Please select your country"),
  industry: z.string().min(1, "Please select your industry"),
  stage: z.string().min(1, "Please select your business stage"),
  hasLaunched: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface Step1Props {
  onNext: (data: FormData) => void;
  initialData?: Partial<FormData>;
}

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "India",
  "Singapore",
  "Japan",
  "South Korea",
  "China",
  "Brazil",
  "Mexico",
  "Argentina",
  "Chile",
  "South Africa",
  "Israel",
  "UAE",
  "Other",
];

const industries = [
  "SaaS/Software",
  "E-commerce",
  "FinTech",
  "HealthTech",
  "EdTech",
  "Gaming",
  "AI/Machine Learning",
  "Cybersecurity",
  "Marketing Technology",
  "HR Technology",
  "Real Estate Technology",
  "Food & Beverage",
  "Fashion & Lifestyle",
  "Travel & Tourism",
  "Transportation & Logistics",
  "Energy & CleanTech",
  "Hardware & IoT",
  "Biotech",
  "Media & Entertainment",
  "Consulting & Services",
  "Other",
];

const stages = [
  {
    value: "idea",
    label: "Idea",
    description: "Early concept, researching the market",
  },
  {
    value: "mvp",
    label: "MVP",
    description: "Building minimum viable product",
  },
  {
    value: "revenue",
    label: "Revenue",
    description: "Making first sales, finding product-market fit",
  },
  {
    value: "scaling",
    label: "Scaling",
    description: "Growing fast, expanding operations",
  },
];

export function Step1LetsGetStarted({ onNext, initialData }: Step1Props) {
  const [error, setError] = useState<string>("");

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
      hasLaunched: initialData?.hasLaunched || false,
    },
    mode: "onChange",
  });

  const selectedCountry = watch("country");
  const selectedIndustry = watch("industry");
  const selectedStage = watch("stage");
  const hasLaunched = watch("hasLaunched");

  const onSubmit = (data: FormData) => {
    setError("");
    onNext(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-green-50 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center mb-4">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Let's get to know your startup
          </CardTitle>
          <p className="text-slate-600 mt-2">Just the basics first 😊</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Business Name */}
            <div className="space-y-2">
              <Label
                htmlFor="businessName"
                className="text-slate-700 font-medium"
              >
                What's your company called? ✨
              </Label>
              <Input
                id="businessName"
                placeholder="Enter your amazing business name..."
                className="border-slate-300 focus:border-blue-400 focus:ring-blue-200 transition-all duration-200"
                {...register("businessName")}
              />
              {errors.businessName && (
                <p className="text-sm text-red-500">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">
                Where are you based? 🌍
              </Label>
              <Select
                value={selectedCountry}
                onValueChange={(value) =>
                  setValue("country", value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-400 transition-all duration-200">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">
                What industry best describes your business? 🏢
              </Label>
              <Select
                value={selectedIndustry}
                onValueChange={(value) =>
                  setValue("industry", value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-400 transition-all duration-200">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-red-500">
                  {errors.industry.message}
                </p>
              )}
            </div>

            {/* Business Stage */}
            <div className="space-y-4">
              <Label className="text-slate-700 font-medium">
                How far along are you? 🚀
              </Label>
              <RadioGroup
                value={selectedStage}
                onValueChange={(value) =>
                  setValue("stage", value, { shouldValidate: true })
                }
                className="grid grid-cols-1 gap-3"
              >
                {stages.map((stage) => (
                  <div
                    key={stage.value}
                    className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <RadioGroupItem value={stage.value} id={stage.value} />
                    <div className="flex-1">
                      <Label
                        htmlFor={stage.value}
                        className="font-medium text-slate-800 cursor-pointer"
                      >
                        {stage.label}
                      </Label>
                      <p className="text-sm text-slate-600">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
              {errors.stage && (
                <p className="text-sm text-red-500">{errors.stage.message}</p>
              )}
            </div>

            {/* Product Launch Status */}
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-slate-200">
              <div>
                <Label
                  htmlFor="hasLaunched"
                  className="text-slate-700 font-medium"
                >
                  Have you launched your product yet? 🎉
                </Label>
                <p className="text-sm text-slate-600">
                  This helps us understand your stage better
                </p>
              </div>
              <Switch
                id="hasLaunched"
                checked={hasLaunched}
                onCheckedChange={(checked) => setValue("hasLaunched", checked)}
              />
            </div>

            {/* Next Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={!isValid}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Next: Financial Snapshot →
              </Button>
              <p className="text-center text-xs text-slate-500 mt-2">
                All information is secure and private 🔒
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
