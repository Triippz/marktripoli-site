import React from 'react';
import { describe, it, expect } from 'vitest';
import ReactDOMServer from 'react-dom/server';
import CareerDataDisplay from '../CareerDataDisplay';
import type { CareerMarker } from '../../../../features/career/types';

describe('CareerDataDisplay', () => {
  const marker: CareerMarker = {
    id: 'x', name: 'Test', position: 'Engineer', category: 'job', type: 'job', codename: 'EAGLE',
    location: { lat: 0, lng: 0 }
  };

  it('renders marker count and status', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <CareerDataDisplay markerCount={5} selectedMarker={null} onResetView={() => {}} />
    );
    expect(html).toContain('MARKERS: 5');
    expect(html).toContain('STATUS');
  });

  it('renders selected marker codename when provided', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <CareerDataDisplay markerCount={5} selectedMarker={marker} onResetView={() => {}} />
    );
    expect(html).toContain('EAGLE');
  });
});

