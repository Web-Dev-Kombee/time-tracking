// Marketing page content
export const MARKETING_HERO = {
  title: 'Time tracking that works for your business',
  description:
    'Track time, manage projects, and create professional invoices. All in one simple app designed for freelancers and small teams.',
};

export const MARKETING_FEATURES = {
  title: 'Everything you need in one place',
  features: [
    {
      title: 'Time Tracking',
      description:
        'Track time on projects with a simple one-click timer. View detailed reports and analyze where your time goes.',
    },
    {
      title: 'Invoice & Billing',
      description:
        'Create professional invoices automatically based on tracked time and expenses. Get paid faster with online payments.',
    },
    {
      title: 'Reports & Analytics',
      description:
        'Gain insights into your business with detailed reports. Track profitability and manage your time more effectively.',
    },
  ],
};

export const MARKETING_CTA = {
  title: 'Ready to get started?',
  description:
    'Join thousands of freelancers and small businesses who trust TimeTrack for their time tracking and invoicing needs.',
  buttonText: 'Start your free trial',
};

export const MARKETING_FOOTER = {
  links: [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/contact', label: 'Contact' },
  ],
  copyright: (year: number) => `© ${year} TimeTrack. All rights reserved.`,
};

export const APP_NAME = 'TimeTrack';
