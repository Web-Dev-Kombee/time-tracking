import { CheckCircle2, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const metadata = {
  title: "Pricing - TimeTracker",
  description: "Choose the right plan for your time tracking and billing needs",
};

export default function PricingPage() {
  return (
    <div className="container max-w-6xl py-12 md:py-16 lg:py-24">
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Choose the right plan for your business. All plans include a 14-day
          free trial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Free Tier */}
        <div className="border rounded-lg p-6 flex flex-col h-full">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Free</h3>
            <div className="mb-2">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-muted-foreground">
              Basic time tracking for freelancers just starting out
            </p>
          </div>
          <ul className="space-y-3 mb-8">
            <PricingFeature>Unlimited time tracking</PricingFeature>
            <PricingFeature>Up to 3 clients</PricingFeature>
            <PricingFeature>Up to 5 projects</PricingFeature>
            <PricingFeature>Basic reporting</PricingFeature>
            <PricingFeature>Single user</PricingFeature>
          </ul>
          <div className="mt-auto">
            <a
              href="/api/auth/signup"
              className="block w-full py-2 px-4 text-center rounded-md bg-primary font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get started
            </a>
          </div>
        </div>

        {/* Professional Tier */}
        <div className="border rounded-lg p-6 flex flex-col h-full relative bg-accent shadow-lg">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground py-1 px-3 rounded-bl-lg rounded-tr-lg text-xs font-medium">
            Most popular
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Professional</h3>
            <div className="mb-2">
              <span className="text-4xl font-bold">$12</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-muted-foreground">
              Everything freelancers need to manage clients and get paid
            </p>
          </div>
          <ul className="space-y-3 mb-8">
            <PricingFeature>Unlimited time tracking</PricingFeature>
            <PricingFeature>Unlimited clients</PricingFeature>
            <PricingFeature>Unlimited projects</PricingFeature>
            <PricingFeature>Invoice generation</PricingFeature>
            <PricingFeature>Expense tracking</PricingFeature>
            <PricingFeature>Advanced reporting</PricingFeature>
            <PricingFeature>Up to 5 team members</PricingFeature>
          </ul>
          <div className="mt-auto">
            <a
              href="/api/auth/signup?plan=pro"
              className="block w-full py-2 px-4 text-center rounded-md bg-primary font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start free trial
            </a>
          </div>
        </div>

        {/* Business Tier */}
        <div className="border rounded-lg p-6 flex flex-col h-full">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Business</h3>
            <div className="mb-2">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-muted-foreground">
              Advanced features for growing businesses and agencies
            </p>
          </div>
          <ul className="space-y-3 mb-8">
            <PricingFeature>Everything in Professional</PricingFeature>
            <PricingFeature>Unlimited team members</PricingFeature>
            <PricingFeature>Team permissions</PricingFeature>
            <PricingFeature>Custom branding</PricingFeature>
            <PricingFeature>Client portal</PricingFeature>
            <PricingFeature>API access</PricingFeature>
            <PricingFeature>Priority support</PricingFeature>
          </ul>
          <div className="mt-auto">
            <a
              href="/api/auth/signup?plan=business"
              className="block w-full py-2 px-4 text-center rounded-md bg-primary font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start free trial
            </a>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">Enterprise</h2>
        <p className="text-lg mb-6">
          Need a custom solution for your larger team or specific requirements?
          Our enterprise plan offers custom features and dedicated support.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ul className="space-y-3">
            <PricingFeature>Custom implementation</PricingFeature>
            <PricingFeature>Dedicated account manager</PricingFeature>
            <PricingFeature>SSO and advanced security</PricingFeature>
          </ul>
          <ul className="space-y-3">
            <PricingFeature>Custom integrations</PricingFeature>
            <PricingFeature>Training and onboarding</PricingFeature>
            <PricingFeature>SLA and premium support</PricingFeature>
          </ul>
        </div>
        <div className="mt-6">
          <a
            href="/contact?type=enterprise"
            className="inline-flex py-2 px-4 rounded-md bg-background border font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Contact sales
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Can I change my plan later?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade, downgrade, or cancel your plan at any time
              from your account settings.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">How does the free trial work?</h3>
            <p className="text-muted-foreground">
              Your 14-day free trial includes all features of the plan you
              choose. No credit card required until your trial ends.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">
              What payment methods do you accept?
            </h3>
            <p className="text-muted-foreground">
              We accept all major credit cards, PayPal, and bank transfers for
              annual plans.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">
              Is there an annual billing option?
            </h3>
            <p className="text-muted-foreground">
              Yes, you can save 20% by choosing annual billing on any paid plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingFeature({
  children,
  tooltip,
}: {
  children: React.ReactNode;
  tooltip?: string;
}) {
  return (
    <li className="flex items-start">
      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
      <span className="flex items-center">
        {children}
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
    </li>
  );
}
