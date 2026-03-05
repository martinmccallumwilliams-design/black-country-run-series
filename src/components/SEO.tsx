import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: string;
    structuredData?: object | object[];
    noindex?: boolean;
}

const SITE_URL = 'https://blackcountryrun.co.uk';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-image.png`;

export default function SEO({
    title,
    description,
    canonical,
    ogImage,
    ogType = 'website',
    structuredData,
    noindex = false,
}: SEOProps) {
    const fullTitle = title.includes('Black Country')
        ? title
        : `${title} | Black Country Run Series`;
    const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined;
    const image = ogImage || DEFAULT_OG_IMAGE;

    const schemas = structuredData
        ? Array.isArray(structuredData)
            ? structuredData
            : [structuredData]
        : [];

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            {/* Open Graph */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
            <meta property="og:site_name" content="Black Country Run Series" />
            <meta property="og:locale" content="en_GB" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data */}
            {schemas.map((schema, i) => (
                <script key={i} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}
        </Helmet>
    );
}
