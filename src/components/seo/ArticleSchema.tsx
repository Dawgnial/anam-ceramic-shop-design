import { Helmet } from 'react-helmet-async';

interface ArticleSchemaProps {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  authorName?: string;
}

const ArticleSchema = ({
  title,
  description,
  image,
  datePublished,
  dateModified,
  url,
  authorName = 'فروشگاه آنام',
}: ArticleSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: image,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: 'https://anamzoroof.ir',
    },
    publisher: {
      '@type': 'Organization',
      name: 'فروشگاه آنام',
      logo: {
        '@type': 'ImageObject',
        url: 'https://anamzoroof.ir/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default ArticleSchema;
