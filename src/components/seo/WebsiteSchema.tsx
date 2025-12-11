import { Helmet } from 'react-helmet-async';

const WebsiteSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'فروشگاه آنام',
    alternateName: 'Anam Store',
    url: 'https://anamzoroof.ir',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://anamzoroof.ir/shop?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
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

export default WebsiteSchema;
