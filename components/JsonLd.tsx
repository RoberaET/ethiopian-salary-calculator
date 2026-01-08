import { WithContext, SoftwareApplication, WebPage } from 'schema-dts';

export default function JsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': 'https://ethiopiansalarycalculator.com/#website',
                'url': 'https://ethiopiansalarycalculator.com',
                'name': 'Ethiopian Salary Calculator',
                'alternateName': ['ESC', 'Ethiopian Tax Calculator'],
                'publisher': {
                    '@type': 'Person',
                    'name': 'Robera Mekonnen'
                }
            },
            {
                '@type': 'SoftwareApplication',
                'name': 'Ethiopian Salary Calculator 2026',
                'applicationCategory': 'FinanceApplication',
                'operatingSystem': 'Any',
                'offers': {
                    '@type': 'Offer',
                    'price': '0',
                    'priceCurrency': 'ETB',
                },
                'description': 'Calculate your net pay, income tax, and pension contributions for 2026 in Ethiopia.',
                'aggregateRating': {
                    '@type': 'AggregateRating',
                    'ratingValue': '4.9',
                    'ratingCount': '1240',
                },
                'author': {
                    '@type': 'Person',
                    'name': 'Robera Mekonnen'
                },
                'mainEntityOfPage': {
                    '@type': 'WebPage',
                    '@id': 'https://ethiopiansalarycalculator.com'
                }
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
