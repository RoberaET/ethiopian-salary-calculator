/**
 * Ethiopian Salary Calculator - Layout Component
 * Original Author: ROBERA MEKONNEN
 * Year: 2025
 * 
 * This layout component handles SEO metadata and structured data.
 * If you use this code, please provide proper attribution to the original author.
 */

import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ethiopian Salary Calculator 2025 | Free Tax & Net Pay Tool',
  description: 'Calculate your Ethiopian salary with 2025 tax brackets. Free PAYE calculator for accurate net pay, pension & tax deductions. Try now!',
  keywords: 'Ethiopian salary calculator, Ethiopia tax calculator, Ethiopian income tax calculator, PAYE Ethiopia, net salary Ethiopia, tax brackets Ethiopia 2025, Addis Ababa salary calculator, Ethiopian payroll calculator, HR tools Ethiopia, salary calculator Addis Ababa',
  authors: [{ name: 'Ethiopian Salary Calculator' }],
  creator: 'Ethiopian Salary Calculator',
  publisher: 'Ethiopian Salary Calculator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ethiopiansalarycalculator.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ethiopian Salary Calculator 2025 | Free Tax & Net Pay Tool',
    description: 'Calculate your Ethiopian salary with 2025 tax brackets. Free PAYE calculator for accurate net pay, pension & tax deductions.',
    url: 'https://ethiopiansalarycalculator.vercel.app',
    siteName: 'Ethiopian Salary Calculator',
    images: [
      {
        url: '/images/ReactorTech.png',
        width: 1200,
        height: 630,
        alt: 'Ethiopian Salary Calculator Interface - Free Tax Calculator Tool',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ethiopian Salary Calculator 2025 | Free Tax & Net Pay Tool',
    description: 'Calculate your Ethiopian salary with 2025 tax brackets. Free PAYE calculator for accurate net pay, pension & tax deductions.',
    images: ['/images/ReactorTech.png'],
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
  const ogUpdatedTime = new Date().toISOString()
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="geo.region" content="ET" />
        <meta name="geo.placename" content="Ethiopia" />
        <meta name="ICBM" content="9.1450, 40.4897" />
        <meta name="theme-color" content="#667eea" />
        <meta name="msapplication-TileColor" content="#667eea" />

        {/* Additional meta tags for better SEO */}
        <meta property="og:updated_time" content={ogUpdatedTime} />
        <meta name="twitter:creator" content="@EthiopianSalaryCalc" />
        <meta name="twitter:site" content="@EthiopianSalaryCalc" />
        
        {/* Font preloading is handled by Next/font (GeistSans/GeistMono) */}
        
        {/* Structured Data - WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Ethiopian Salary Calculator",
              "description": "Calculate Ethiopian salary, income tax (PAYE), and net pay with 2025 tax brackets",
              "url": "https://ethiopiansalarycalculator.vercel.app",
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
                    "text": "Our Ethiopian income tax calculator uses the official PAYE rates from Proclamation No. 1395/2025. This tax calculator provides accurate results for all employees working in Ethiopia."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What tax brackets does Ethiopia use in 2025?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The Ethiopia tax calculator applies these progressive rates: 0-2,000 ETB (0%), 2,001-4,000 ETB (15%), 4,001-7,000 ETB (20%), 7,001-10,000 ETB (25%), 10,001-14,000 ETB (30%), and 14,001+ ETB (35%)."
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
        
        {/* Breadcrumb Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://ethiopiansalarycalculator.vercel.app"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Ethiopian Salary Calculator",
                  "item": "https://ethiopiansalarycalculator.vercel.app"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Tax Calculator 2025",
                  "item": "https://ethiopiansalarycalculator.vercel.app"
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
          <nav aria-label="Breadcrumb" className="bg-gray-50 dark:bg-gray-800 py-2 px-4">
            <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="/" className="hover:text-blue-600">Home</a></li>
              <li className="text-gray-400">/</li>
              <li><a href="/" className="hover:text-blue-600">Ethiopian Salary Calculator</a></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 dark:text-gray-100">Tax Calculator 2025</li>
            </ol>
          </nav>
          {children}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
