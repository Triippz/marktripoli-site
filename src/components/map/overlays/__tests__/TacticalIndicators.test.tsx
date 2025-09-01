import React from 'react';
import { describe, it, expect } from 'vitest';
import ReactDOMServer from 'react-dom/server';
import TacticalIndicators from '../TacticalIndicators';

describe('TacticalIndicators', () => {
  it('renders zoom level with one decimal place', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <TacticalIndicators zoomLevel={5.234} />
    );
    expect(html).toContain('ZOOM: 5.2x');
  });

  it('renders default zoom when not provided', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <TacticalIndicators />
    );
    expect(html).toContain('ZOOM: 4.0x');
  });
});

