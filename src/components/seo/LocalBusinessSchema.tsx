import { Helmet } from 'react-helmet-async';

const LocalBusinessSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'فروشگاه آنام',
    image: 'https://anamzoroof.ir/logo.png',
    '@id': 'https://anamzoroof.ir',
    url: 'https://anamzoroof.ir',
    telephone: '+98-938-189-5681',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'خیابان نامجو ۱۷، محسن نژاد ۱',
      addressLocality: 'مشهد',
      addressRegion: 'خراسان رضوی',
      postalCode: '',
      addressCountry: 'IR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 36.2972,
      longitude: 59.6067,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Saturday',
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
      ],
      opens: '09:00',
      closes: '21:00',
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

export default LocalBusinessSchema;
