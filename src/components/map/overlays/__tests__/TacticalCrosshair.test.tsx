import React from 'react';
import { describe, it, expect } from 'vitest';
import ReactDOMServer from 'react-dom/server';
import TacticalCrosshair from '../TacticalCrosshair';

describe('TacticalCrosshair', () => {
  const dims = { width: 800, height: 600 };
  const coords = { lat: 42.1234, lng: -71.5678 };

  it('renders nothing when cursorPoint is null', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <TacticalCrosshair cursorPoint={null} currentCoords={coords} containerDimensions={dims} />
    );
    expect(html).toBe('');
  });

  it('renders coordinates box when cursorPoint is provided', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <TacticalCrosshair cursorPoint={{ x: 100, y: 200 }} currentCoords={coords} containerDimensions={dims} />
    );
    expect(html).toContain('COORDINATES');
    expect(html).toContain('LAT: 42.1234°');
    expect(html).toContain('LNG: -71.5678°');
  });
});

