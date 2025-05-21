import { ArrowRight, BarChart3, Clock, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import { ModeToggle } from '@/components/mode-toggle';
import {
  APP_NAME,
  MARKETING_HERO,
  MARKETING_FEATURES,
  MARKETING_CTA,
  MARKETING_FOOTER,
  MARKETING_NAV,
} from '@/constants';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{APP_NAME}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {MARKETING_NAV.map((item, index) =>
              item.label !== 'Sign up free' ? (
                <Link
                  key={index}
                  href={item.href}
                  className="text-sm font-medium hover:text-primary"
                >
                  {item.label}
                </Link>
              ) : null
            )}
            <ModeToggle />
            <Link
              href="/register"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
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
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {MARKETING_HERO.title.split('your business')[0]}
              <span className="text-primary">your business</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              {MARKETING_HERO.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
              >
                Get started for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="border border-input bg-background px-6 py-3 rounded-md font-medium hover:bg-accent"
              >
                See a demo
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{MARKETING_FEATURES.title}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {MARKETING_FEATURES.features.map((feature, index) => {
                const icons = [
                  <Clock key="clock" className="h-6 w-6 text-primary" />,
                  <FileSpreadsheet key="file" className="h-6 w-6 text-primary" />,
                  <BarChart3 key="chart" className="h-6 w-6 text-primary" />,
                ];

                return (
                  <div key={index} className="bg-card p-6 rounded-lg shadow-sm">
                    <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">{icons[index]}</div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">{MARKETING_CTA.title}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {MARKETING_CTA.description}
            </p>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 inline-flex items-center gap-2"
            >
              {MARKETING_CTA.buttonText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-bold">{APP_NAME}</span>
            </div>
            <div className="flex gap-6">
              {MARKETING_FOOTER.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {MARKETING_FOOTER.copyright(new Date().getFullYear())}
          </div>
        </div>
      </footer>
    </div>
  );
}
