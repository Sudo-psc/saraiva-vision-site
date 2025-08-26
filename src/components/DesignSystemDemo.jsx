import React from 'react';

/**
 * DesignSystemDemo - Visual demonstration of design tokens
 * Shows typography scale, spacing system, and content structure guidelines
 * This component can be added to a /style-guide route for reference
 */
const DesignSystemDemo = () => {
  const typographySizes = [
    { name: 'Display XL', class: 'text-display-xl', size: '56px', usage: 'Landing pages, hero titles' },
    { name: 'Display LG', class: 'text-display-lg', size: '48px', usage: 'Major section headers' },
    { name: 'Display MD', class: 'text-display-md', size: '40px', usage: 'Page headers' },
    { name: 'Display SM', class: 'text-display-sm', size: '36px', usage: 'Section headers (H1)' },
    { name: 'Heading XL', class: 'text-heading-xl', size: '32px', usage: 'H2 headers' },
    { name: 'Heading LG', class: 'text-heading-lg', size: '28px', usage: 'H3 headers' },
    { name: 'Heading MD', class: 'text-heading-md', size: '24px', usage: 'H4 headers' },
    { name: 'Heading SM', class: 'text-heading-sm', size: '22px', usage: 'H5 headers' },
    { name: 'Heading XS', class: 'text-heading-xs', size: '20px', usage: 'H6 headers' },
    { name: 'Body XL', class: 'text-body-xl', size: '18px', usage: 'Large body text' },
    { name: 'Body LG', class: 'text-body-lg', size: '16px', usage: 'Default body text' },
    { name: 'Body', class: 'text-body', size: '14px', usage: 'Small body text' },
    { name: 'Caption', class: 'text-caption', size: '12px', usage: 'Captions, labels' },
    { name: 'Overline', class: 'text-overline', size: '11px', usage: 'Overline text' }
  ];

  const spacingSizes = [
    { name: 'Section 2XL', class: 'py-section-2xl', size: '160px', usage: 'Major page sections' },
    { name: 'Section XL', class: 'py-section-xl', size: '128px', usage: 'Hero, major sections' },
    { name: 'Section LG', class: 'py-section-lg', size: '96px', usage: 'Default sections' },
    { name: 'Section', class: 'py-section', size: '80px', usage: 'Standard sections' },
    { name: 'Section SM', class: 'py-section-sm', size: '64px', usage: 'Compact sections' },
    { name: 'Space 32', class: 'py-32', size: '128px', usage: 'Large gaps' },
    { name: 'Space 24', class: 'py-24', size: '96px', usage: 'Medium gaps' },
    { name: 'Space 16', class: 'py-16', size: '64px', usage: 'Small gaps' },
    { name: 'Space 8', class: 'py-8', size: '32px', usage: 'Tiny gaps' }
  ];

  return (
    <div className="py-section bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Typography Scale */}
        <section className="mb-section">
          <h2 className="text-heading-xl font-bold mb-8">Typography Scale</h2>
          <div className="space-y-6">
            {typographySizes.map((type, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                  <span className="text-body font-medium text-gray-600">
                    {type.name} • {type.size} • {type.usage}
                  </span>
                </div>
                <div className={`${type.class} font-bold text-gray-900`}>
                  The quick brown fox jumps
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Spacing System */}
        <section className="mb-section">
          <h2 className="text-heading-xl font-bold mb-8">8pt Spacing System</h2>
          <div className="space-y-4">
            {spacingSizes.map((space, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                  <span className="text-body font-medium text-gray-600">
                    {space.name} • {space.size} • {space.usage}
                  </span>
                </div>
                <div className="bg-blue-100 rounded">
                  <div className={`${space.class} bg-blue-500 w-4 rounded`}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Content Structure Guidelines */}
        <section className="mb-section">
          <h2 className="text-heading-xl font-bold mb-8">Content Structure Guidelines</h2>
          
          <div className="space-y-8">
            {/* Good Example */}
            <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
              <div className="mb-4">
                <span className="text-body font-medium text-green-700">✅ Good Example</span>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-overline font-medium mb-6">
                  <span className="mr-2">✦</span> Our Services
                </div>
                <h2 className="text-heading-xl font-bold mb-6 max-w-prose mx-auto">
                  Comprehensive Eye Care Solutions
                </h2>
                <p className="text-body-xl leading-loose max-w-prose mx-auto text-slate-600">
                  Expert ophthalmology services with modern technology and personalized care.
                </p>
              </div>
            </div>

            {/* Bad Example */}
            <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
              <div className="mb-4">
                <span className="text-body font-medium text-red-700">❌ Bad Example</span>
              </div>
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4">Our Comprehensive Eye Care Solutions</h2>
                <h3 className="text-2xl font-semibold mb-4">Advanced Technology</h3>
                <p className="text-lg mb-4">
                  We provide expert ophthalmology services using the latest technology and equipment. Our experienced team of doctors and specialists work together to deliver personalized care for all your vision needs. From routine eye exams to complex surgical procedures, we offer a full range of services designed to protect and improve your eyesight.
                </p>
                <p className="text-base">
                  Contact us today to schedule your appointment and experience the difference our comprehensive approach makes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Design Tokens Reference */}
        <section>
          <h2 className="text-heading-xl font-bold mb-8">CSS Variables Reference</h2>
          <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-4 font-sans">Typography</h3>
                <div className="space-y-1">
                  <div>--font-size-display-xl: 3.5rem;</div>
                  <div>--font-size-display-lg: 3rem;</div>
                  <div>--font-size-display-md: 2.5rem;</div>
                  <div>--font-size-display-sm: 2.25rem;</div>
                  <div>--font-size-heading-xl: 2rem;</div>
                  <div>--font-size-body-xl: 1.125rem;</div>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-4 font-sans">Spacing</h3>
                <div className="space-y-1">
                  <div>--space-section-2xl: 10rem;</div>
                  <div>--space-section-xl: 8rem;</div>
                  <div>--space-section-lg: 6rem;</div>
                  <div>--space-section: 5rem;</div>
                  <div>--space-section-sm: 4rem;</div>
                  <div>--space-32: 8rem;</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DesignSystemDemo;