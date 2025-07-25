import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { ModernWizardApp } from "@/components/modern-wizard/ModernWizardApp";

export default function Index() {
  const [showWizard, setShowWizard] = useState(false);

  if (showWizard) {
    return <ModernWizardApp />;
  }

  return <LandingPage onGetStarted={() => setShowWizard(true)} />;
}
