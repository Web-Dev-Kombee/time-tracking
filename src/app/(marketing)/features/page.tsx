import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
 title: "Features - TimeTracker",
 description: "Powerful time tracking and billing features to streamline your workflow",
};

export default function FeaturesPage() {
 return (
  <div className="container max-w-6xl py-12 md:py-16 lg:py-24">
   <div className="text-center mb-12 md:mb-16">
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
     Powerful Time Tracking & Billing
    </h1>
    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
     Our comprehensive feature set helps you track time, manage projects, bill clients, and boost
     productivity.
    </p>
   </div>

   {/* Main Features */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
    <FeatureCard
     title="Time Tracking"
     description="Track time with a single click. Add notes, tags, and categorize your work."
     icon="⏱️"
    />
    <FeatureCard
     title="Project Management"
     description="Create projects, assign tasks, set budgets and deadlines."
     icon="📋"
    />
    <FeatureCard
     title="Client Management"
     description="Manage client information, contacts, and communication in one place."
     icon="👥"
    />
    <FeatureCard
     title="Invoicing"
     description="Generate professional invoices based on tracked time and expenses."
     icon="💰"
    />
    <FeatureCard
     title="Reports & Analytics"
     description="Gain insights with detailed reports on time usage, project profitability, and more."
     icon="📊"
    />
    <FeatureCard
     title="Expense Tracking"
     description="Log and categorize expenses, attach receipts, and bill clients."
     icon="💸"
    />
   </div>

   {/* Feature Spotlight */}
   <div className="border rounded-lg p-6 mb-16">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
     <div>
      <h2 className="text-3xl font-bold mb-4">Seamless Time Tracking</h2>
      <p className="text-muted-foreground mb-6">
       Our intuitive time tracking interface makes it easy to log hours, whether you're working on
       client projects or internal tasks.
      </p>
      <ul className="space-y-2">
       <FeatureItem>One-click timer start/stop</FeatureItem>
       <FeatureItem>Manual time entry</FeatureItem>
       <FeatureItem>Desktop and mobile apps</FeatureItem>
       <FeatureItem>Automatic idle detection</FeatureItem>
       <FeatureItem>Calendar integration</FeatureItem>
      </ul>
     </div>
     <div className="bg-muted rounded-lg p-4 flex items-center justify-center h-[300px]">
      <p className="text-center text-muted-foreground">Time tracking interface mockup</p>
     </div>
    </div>
   </div>

   {/* Feature Comparison */}
   <div className="mb-16">
    <h2 className="text-3xl font-bold text-center mb-8">Compare Plans</h2>
    <div className="overflow-x-auto">
     <table className="w-full border-collapse">
      <thead>
       <tr className="border-b">
        <th className="text-left py-4 px-6">Feature</th>
        <th className="text-center py-4 px-6">Free</th>
        <th className="text-center py-4 px-6">Professional</th>
        <th className="text-center py-4 px-6">Business</th>
       </tr>
      </thead>
      <tbody>
       <tr className="border-b">
        <td className="py-4 px-6">Time Tracking</td>
        <td className="text-center py-4 px-6">✅</td>
        <td className="text-center py-4 px-6">✅</td>
        <td className="text-center py-4 px-6">✅</td>
       </tr>
       <tr className="border-b">
        <td className="py-4 px-6">Client Management</td>
        <td className="text-center py-4 px-6">Up to 3</td>
        <td className="text-center py-4 px-6">Unlimited</td>
        <td className="text-center py-4 px-6">Unlimited</td>
       </tr>
       <tr className="border-b">
        <td className="py-4 px-6">Project Management</td>
        <td className="text-center py-4 px-6">Basic</td>
        <td className="text-center py-4 px-6">Advanced</td>
        <td className="text-center py-4 px-6">Advanced</td>
       </tr>
       <tr className="border-b">
        <td className="py-4 px-6">Invoicing</td>
        <td className="text-center py-4 px-6">❌</td>
        <td className="text-center py-4 px-6">✅</td>
        <td className="text-center py-4 px-6">✅</td>
       </tr>
       <tr className="border-b">
        <td className="py-4 px-6">Team Members</td>
        <td className="text-center py-4 px-6">1</td>
        <td className="text-center py-4 px-6">Up to 5</td>
        <td className="text-center py-4 px-6">Unlimited</td>
       </tr>
       <tr className="border-b">
        <td className="py-4 px-6">Reports</td>
        <td className="text-center py-4 px-6">Basic</td>
        <td className="text-center py-4 px-6">Advanced</td>
        <td className="text-center py-4 px-6">Custom</td>
       </tr>
       <tr className="border-b">
        <td className="py-4 px-6">API Access</td>
        <td className="text-center py-4 px-6">❌</td>
        <td className="text-center py-4 px-6">❌</td>
        <td className="text-center py-4 px-6">✅</td>
       </tr>
      </tbody>
     </table>
    </div>
   </div>

   {/* Call to Action */}
   <div className="text-center">
    <h2 className="text-3xl font-bold mb-6">Ready to boost your productivity?</h2>
    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
     Join thousands of professionals who use TimeTracker to streamline their workflow.
    </p>
    <div className="flex gap-4 justify-center">
     <Link
      href="/api/auth/signup"
      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
     >
      Start for free
     </Link>
     <Link
      href="/demo"
      className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
     >
      View demo
     </Link>
    </div>
   </div>
  </div>
 );
}

function FeatureCard({
 title,
 description,
 icon,
}: {
 title: string;
 description: string;
 icon: string;
}) {
 return (
  <div className="border rounded-lg p-6 transition-all hover:shadow-md">
   <div className="text-4xl mb-4">{icon}</div>
   <h3 className="text-xl font-bold mb-2">{title}</h3>
   <p className="text-muted-foreground">{description}</p>
  </div>
 );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
 return (
  <li className="flex items-start">
   <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
   <span>{children}</span>
  </li>
 );
}
