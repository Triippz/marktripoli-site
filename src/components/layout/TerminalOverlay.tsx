import { Suspense, lazy } from 'react';
import ErrorBoundary from '../ErrorBoundary';

const Terminal = lazy(() => import('../terminal/Terminal'));

export default function TerminalOverlay() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div />}>
        <Terminal />
      </Suspense>
    </ErrorBoundary>
  );
}

