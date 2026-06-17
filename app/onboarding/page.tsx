"use client";

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-cream-50 dark:bg-ink-800 flex items-center justify-center p-6">
      <OnboardingWizard />
    </div>
  );
}
