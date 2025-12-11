import { Helmet } from 'react-helmet-async';

interface OrganizationSchemaProps {
  type: 'Organization';
}

interface ProductSchemaProps {
  type: 'Product';
  product: {
    name: string;
    description?: string;
    image?: string;
    price: number;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    rating?: number;
    reviewCount?: number;
    sku?: string;
  };
}

interface BreadcrumbSchemaProps {
  type: 'BreadcrumbList';
  items: Array<{
    name: string;
    url: string;
  }>;
}

type StructuredDataProps = OrganizationSchemaProps | ProductSchemaProps | BreadcrumbSchemaProps;

const OrganizationSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'فروشگاه آنام',
    alternateName: 'Anam Store',
    url: 'https://anamzoroof.ir',
    logo: 'https://anamzoroof.ir/logo.png',
    description: 'فروشگاه آنلاین آنام با سابقه ۱۰ ساله در تولید و عرضه محصولات سرامیکی، آماده فروش انواع ظروف سرامیکی به سراسر کشور است.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'خیابان نامجو ۱۷، محسن نژاد ۱',
      addressLocality: 'مشهد',
      addressCountry: 'IR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+98-938-189-5681',
      contactType: 'customer service',
      availableLanguage: 'Persian',
    },
    sameAs: [
      'https://t.me/anam_zrof',
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

const ProductSchema = ({ product }: { product: ProductSchemaProps['product'] }) => {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: product.image || 'https://anamzoroof.ir/logo.png',
    brand: {
      '@type': 'Brand',
      name: 'آنام',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'IRR',
      availability: product.availability === 'InStock' 
        ? 'https://schema.org/InStock' 
        : product.availability === 'OutOfStock'
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/PreOrder',
      seller: {
        '@type': 'Organization',
        name: 'فروشگاه آنام',
      },
    },
  };

  if (product.sku) {
    schema.sku = product.sku;
  }

  if (product.rating && product.reviewCount && product.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

const BreadcrumbSchema = ({ items }: { items: BreadcrumbSchemaProps['items'] }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

const StructuredData = (props: StructuredDataProps) => {
  switch (props.type) {
    case 'Organization':
      return <OrganizationSchema />;
    case 'Product':
      return <ProductSchema product={props.product} />;
    case 'BreadcrumbList':
      return <BreadcrumbSchema items={props.items} />;
    default:
      return null;
  }
};

export default StructuredData;
