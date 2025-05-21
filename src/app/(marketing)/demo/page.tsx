import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export const metadata = {
  title: 'Demo - TimeTracker',
  description: 'See TimeTracker in action with our interactive demo',
};

export default function DemoPage() {
  return (
    <div className="container max-w-6xl py-12 md:py-16 lg:py-24">
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          See TimeTracker in Action
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore our key features and see how TimeTracker can streamline your workflow
        </p>
      </div>

      <div className="mb-16">
        <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden relative mb-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium mb-4">Demo Video</p>
            <p className="text-muted-foreground">Interactive demo video placeholder</p>
          </div>
        </div>
        <div className="flex justify-center">
          <Button size="lg" asChild>
            <Link href="/api/auth/signup">Try it yourself</Link>
          </Button>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Feature Preview</h2>

        <Tabs defaultValue="time-tracking" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
          </TabsList>

          <TabsContent value="time-tracking" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Effortless Time Tracking</h3>
                <p className="text-muted-foreground mb-6">
                  Track time with a single click. Add detailed notes, categorize by client or
                  project, and monitor your productivity in real-time.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>One-click timer start/stop</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Automatic idle detection</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Detailed time entry notes</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Calendar view integration</span>
                  </li>
                </ul>
              </div>
              <div className="bg-muted rounded-lg p-4 h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Time tracking interface screenshot</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Project Management</h3>
                <p className="text-muted-foreground mb-6">
                  Create projects, set budgets, track deadlines, and monitor progress. Assign team
                  members and keep everyone on the same page.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Project dashboard with key metrics</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Budget tracking and alerts</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Team member assignment</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Progress visualization</span>
                  </li>
                </ul>
              </div>
              <div className="bg-muted rounded-lg p-4 h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Project management interface screenshot</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Powerful Reporting</h3>
                <p className="text-muted-foreground mb-6">
                  Generate insightful reports to analyze time usage, project profitability, team
                  productivity, and more. Export to various formats.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Customizable dashboard widgets</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Visual data representations</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Export to PDF, CSV, Excel</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Scheduled report delivery</span>
                  </li>
                </ul>
              </div>
              <div className="bg-muted rounded-lg p-4 h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Reports interface screenshot</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invoicing" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Seamless Invoicing</h3>
                <p className="text-muted-foreground mb-6">
                  Create professional invoices from tracked time and expenses. Customize templates,
                  set payment terms, and accept online payments.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>One-click invoice generation</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Customizable invoice templates</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Payment status tracking</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Online payment integration</span>
                  </li>
                </ul>
              </div>
              <div className="bg-muted rounded-lg p-4 h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Invoicing interface screenshot</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="border rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground">
            Start your 14-day free trial today. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-primary font-bold">1</span>
            </div>
            <h3 className="font-medium mb-2">Create an account</h3>
            <p className="text-sm text-muted-foreground">Sign up for free in less than a minute</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-primary font-bold">2</span>
            </div>
            <h3 className="font-medium mb-2">Set up your workspace</h3>
            <p className="text-sm text-muted-foreground">Add your clients and projects</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-primary font-bold">3</span>
            </div>
            <h3 className="font-medium mb-2">Start tracking time</h3>
            <p className="text-sm text-muted-foreground">Begin tracking your hours immediately</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button size="lg" asChild>
            <Link href="/api/auth/signup">Start your free trial</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
