import { WithContext, SoftwareApplication, WebPage } from 'schema-dts';

export default function JsonLd() {
    const jsonLd: WithContext<SoftwareApplication | WebPage> = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Ethiopian Salary Calculator 2026',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'ETB',
        },
        description: 'Calculate your net pay, income tax, and pension contributions for 2026 in Ethiopia.',
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '124',
        },
        author: {
            '@type': 'Person',
            name: 'Robera Mekonnen'
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
