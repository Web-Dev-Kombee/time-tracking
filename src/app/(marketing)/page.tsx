import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function HomePage() {
 return (
  <>
   {/* Hero Section */}
   <section className="py-16 md:py-24 lg:py-32 bg-accent">
    <div className="container mx-auto max-w-6xl px-4 md:px-6">
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
       <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
        Track Time, <br />
        Bill Clients, <br />
        Grow Your Business
       </h1>
       <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Effortlessly track time, manage projects, create invoices, and maximize productivity.
       </p>
       <div className="flex flex-wrap gap-4">
        <Button size="lg" asChild>
         <Link href="/api/auth/signup">Start for free</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
         <Link href="/demo">View demo</Link>
        </Button>
       </div>
      </div>
      <div className="bg-muted rounded-lg p-4 h-[400px] flex items-center justify-center order-first lg:order-last">
       <p className="text-center text-muted-foreground">App dashboard mockup</p>
      </div>
     </div>
    </div>
   </section>

   {/* Features Section */}
   <section className="py-16 md:py-24">
    <div className="container mx-auto max-w-6xl px-4 md:px-6">
     <div className="text-center mb-12">
      <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
       Everything you need to manage your time, projects, and billing in one place.
      </p>
     </div>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="border rounded-lg p-6">
       <div className="mb-4 text-primary text-4xl">⏱️</div>
       <h3 className="text-xl font-bold mb-2">Time Tracking</h3>
       <p className="text-muted-foreground">
        Track time with a single click. Add notes, tags, and categorize your work.
       </p>
      </div>
      <div className="border rounded-lg p-6">
       <div className="mb-4 text-primary text-4xl">📋</div>
       <h3 className="text-xl font-bold mb-2">Project Management</h3>
       <p className="text-muted-foreground">
        Create projects, set budgets, track deadlines and monitor progress.
       </p>
      </div>
      <div className="border rounded-lg p-6">
       <div className="mb-4 text-primary text-4xl">💰</div>
       <h3 className="text-xl font-bold mb-2">Invoicing</h3>
       <p className="text-muted-foreground">
        Generate professional invoices based on tracked time and expenses.
       </p>
      </div>
     </div>
     <div className="text-center mt-8">
      <Button variant="outline" asChild>
       <Link href="/features">
        View all features <ArrowRight className="ml-2 h-4 w-4" />
       </Link>
      </Button>
     </div>
    </div>
   </section>

   {/* Testimonials */}
   <section className="py-16 md:py-24 bg-muted">
    <div className="container mx-auto max-w-6xl px-4 md:px-6">
     <div className="text-center mb-12">
      <h2 className="text-3xl font-bold mb-4">Trusted by Professionals</h2>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
       Join thousands of freelancers and businesses who use TimeTracker every day.
      </p>
     </div>
     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-card rounded-lg p-6">
       <p className="mb-4">
        "TimeTracker has transformed how I manage my client work. Billing is now a breeze!"
       </p>
       <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary/10 mr-3"></div>
        <div>
         <p className="font-medium">Sarah Johnson</p>
         <p className="text-sm text-muted-foreground">Freelance Designer</p>
        </div>
       </div>
      </div>
      <div className="bg-card rounded-lg p-6">
       <p className="mb-4">
        "We've increased our billing accuracy by 32% since switching to TimeTracker."
       </p>
       <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary/10 mr-3"></div>
        <div>
         <p className="font-medium">James Wilson</p>
         <p className="text-sm text-muted-foreground">Agency Owner</p>
        </div>
       </div>
      </div>
      <div className="bg-card rounded-lg p-6">
       <p className="mb-4">
        "The reporting features help me understand where my team's time is going."
       </p>
       <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary/10 mr-3"></div>
        <div>
         <p className="font-medium">Maria Rodriguez</p>
         <p className="text-sm text-muted-foreground">Project Manager</p>
        </div>
       </div>
      </div>
     </div>
    </div>
   </section>

   {/* Pricing CTA */}
   <section className="py-16 md:py-24">
    <div className="container mx-auto max-w-6xl px-4 md:px-6">
     <div className="text-center mb-12">
      <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
       Choose the right plan for your business and start your 14-day free trial today.
      </p>
     </div>
     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <div className="border rounded-lg p-6">
       <h3 className="text-lg font-medium mb-2">Free</h3>
       <div className="mb-4">
        <span className="text-4xl font-bold">$0</span>
        <span className="text-muted-foreground">/month</span>
       </div>
       <ul className="space-y-2 mb-6">
        <li className="flex items-center">
         <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
         <span>Basic time tracking</span>
        </li>
        <li className="flex items-center">
         <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
         <span>Up to 3 clients</span>
        </li>
        <li className="flex items-center">
         <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
         <span>Single user</span>
        </li>
       </ul>
       <Button className="w-full" variant="outline" asChild>
        <Link href="/api/auth/signup">Start for free</Link>
       </Button>
      </div>

      <div className="border rounded-lg p-6 bg-accent shadow-md relative">
       <div className="absolute top-0 right-0 bg-primary text-primary-foreground py-1 px-3 rounded-bl-lg rounded-tr-lg text-xs font-medium">
        Popular
       </div>
       <h3 className="text-lg font-medium mb-2">Professional</h3>
       <div className="mb-4">
        <span className="text-4xl font-bold">$12</span>
        <span className="text-muted-foreground">/month</span>
       </div>
       <ul className="space-y-2 mb-6">
        <li className="flex items-center">
         <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
         <span>Unlimited time tracking</span>
        </li>
        <li className="flex items-center">
         <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
         <span>Unlimited clients</span>
        </li>
        <li className="flex items-center">
         <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
         <span>Invoicing</span>
        </li>
        <li className="flex items-center">
         <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
         <span>Up to 5 team members</span>
        </li>
       </ul>
       <Button className="w-full" asChild>
        <Link href="/api/auth/signup?plan=pro">Start free trial</Link>
       </Button>
      </div>

      <div className="border rounded-lg p-6">
       <h3 className="text-lg font-medium mb-2">Business</h3>
       <div className="mb-4">
        <span className="text-4xl font-bold">$29</span>
        <span className="text-muted-foreground">/month</span>
       </div>
       <ul className="space-y-2 mb-6">
        <li className="flex items-center">
         <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
         <span>All Pro features</span>
        </li>
        <li className="flex items-center">
         <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
         <span>Unlimited team members</span>
        </li>
        <li className="flex items-center">
         <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
         <span>API access</span>
        </li>
        <li className="flex items-center">
         <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
         <span>Priority support</span>
        </li>
       </ul>
       <Button className="w-full" variant="outline" asChild>
        <Link href="/api/auth/signup?plan=business">Start free trial</Link>
       </Button>
      </div>
     </div>
     <div className="text-center">
      <p className="text-muted-foreground mb-4">Need a custom plan?</p>
      <Button variant="link" asChild>
       <Link href="/contact?type=enterprise">Contact us for enterprise pricing</Link>
      </Button>
     </div>
    </div>
   </section>
  </>
 );
}
