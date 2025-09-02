import React from 'react';
import { describe, it, expect } from 'vitest';
import ReactDOMServer from 'react-dom/server';
import AlertOverlay from '../AlertOverlay';

describe('AlertOverlay', () => {
  it('renders nothing when not in alert mode', () => {
    const html = ReactDOMServer.renderToStaticMarkup(<AlertOverlay isAlertMode={false} />);
    expect(html).toBe('');
  });

  it('renders banner when alert mode is active', () => {
    const html = ReactDOMServer.renderToStaticMarkup(<AlertOverlay isAlertMode={true} />);
    expect(html).toContain('ALERT MODE');
  });
});

