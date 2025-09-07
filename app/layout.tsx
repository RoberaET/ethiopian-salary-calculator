import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ethiopian Salary Calculator 2024 - Free Tax & Net Pay Calculator | Ethiopia PAYE',
  description: 'Free Ethiopian salary calculator 2024. Calculate your net pay, income tax (PAYE), and pension contributions with current Ethiopia tax brackets. Instant accurate results.',
  keywords: 'Ethiopian salary calculator, Ethiopia tax calculator, Ethiopian income tax calculator, PAYE Ethiopia, net salary Ethiopia, tax brackets Ethiopia 2024',
  authors: [{ name: 'Ethiopian Salary Calculator' }],
  creator: 'Ethiopian Salary Calculator',
  publisher: 'Ethiopian Salary Calculator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ethiopian-salary-calculator.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ethiopian Salary Calculator 2024 - Free Tax Calculator',
    description: 'Calculate your Ethiopian net salary with our free tax calculator. Current PAYE rates and tax brackets.',
    url: 'https://ethiopian-salary-calculator.vercel.app',
    siteName: 'Ethiopian Salary Calculator',
    images: [
      {
        url: '/images/calculator-preview.jpg',
        width: 1200,
        height: 630,
        alt: 'Ethiopian Salary Calculator Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ethiopian Salary Calculator 2024',
    description: 'Free Ethiopian tax calculator with 2024 PAYE rates',
    images: ['/images/calculator-preview.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: '/images/ReactorTech.png',
    shortcut: '/images/ReactorTech.png',
    apple: '/images/ReactorTech.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Additional SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="geo.region" content="ET" />
        <meta name="geo.placename" content="Ethiopia" />
        <meta name="ICBM" content="9.1450, 40.4897" />
        <meta name="theme-color" content="#667eea" />
        <meta name="msapplication-TileColor" content="#667eea" />
        
        {/* Font preloading is handled by Next/font (GeistSans/GeistMono) */}
        
        {/* Structured Data - WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Ethiopian Salary Calculator",
              "description": "Calculate Ethiopian salary, income tax (PAYE), and net pay with 2024 tax brackets",
              "url": "https://ethiopian-salary-calculator.vercel.app",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Any",
              "browserRequirements": "Requires JavaScript",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "ETB"
              },
              "featureList": [
                "Ethiopian salary calculation",
                "PAYE tax calculation",
                "Pension contribution calculation",
                "Net salary calculation",
                "Tax bracket visualization",
                "Overtime pay calculation",
                "Allowance management",
                "Deduction tracking"
              ],
              "author": {
                "@type": "Organization",
                "name": "Ethiopian Salary Calculator"
              },
              "areaServed": "Ethiopia",
              "knowsLanguage": ["en", "am"]
            })
          }}
        />
        
        {/* FAQ Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How accurate is this Ethiopian salary calculator?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our Ethiopian income tax calculator uses the official PAYE rates from Proclamation No. 979/2016. This tax calculator provides accurate results for all employees working in Ethiopia."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What tax brackets does Ethiopia use in 2024?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The Ethiopia tax calculator applies these progressive rates: 0-600 ETB (0%), 601-1,650 ETB (10%), 1,651-3,200 ETB (15%), 3,201-5,250 ETB (20%), 5,251-7,800 ETB (25%), and 7,801+ ETB (30%)."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How is pension contribution calculated?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Pension contribution is calculated as 7% of your gross salary. This is a mandatory pension contribution required by Ethiopian labor law."
                  }
                }
              ]
            })
          }}
        />
        
        {/* Google Analytics 4 */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="hidden">
            <ol>
              <li><a href="/">Ethiopian Salary Calculator</a></li>
              <li>Tax Calculator</li>
            </ol>
          </nav>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
