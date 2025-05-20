import {
  ArrowRight,
  BarChart3,
  Clock,
  FileSpreadsheet
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">TimeTrack</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/features"
              className="text-sm font-medium hover:text-blue-600"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium hover:text-blue-600"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium hover:text-blue-600"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Sign up free
            </Link>
          </nav>
          <button className="md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Time tracking that works for{" "}
              <span className="text-blue-600">your business</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Track time, manage projects, and create professional invoices. All
              in one simple app designed for freelancers and small teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                Get started for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="border border-gray-300 px-6 py-3 rounded-md font-medium hover:bg-gray-50"
              >
                See a demo
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything you need in one place
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Time Tracking</h3>
                <p className="text-gray-600">
                  Track time on projects with a simple one-click timer. View
                  detailed reports and analyze where your time goes.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                  <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Invoice & Billing</h3>
                <p className="text-gray-600">
                  Create professional invoices automatically based on tracked
                  time and expenses. Get paid faster with online payments.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Reports & Analytics</h3>
                <p className="text-gray-600">
                  Gain insights into your business with detailed reports. Track
                  profitability and manage your time more effectively.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Join thousands of freelancers and small businesses who trust
              TimeTrack for their time tracking and invoicing needs.
            </p>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 inline-flex items-center gap-2"
            >
              Start your free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-bold">TimeTrack</span>
            </div>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Terms
              </Link>
              <Link
                href="/contact"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} TimeTrack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
