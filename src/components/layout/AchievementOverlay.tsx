import { Suspense, lazy } from 'react';
import ErrorBoundary from '../ErrorBoundary';

const AchievementSystem = lazy(() => import('../gamification/AchievementSystem'));

export default function AchievementOverlay() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div />}>
        <AchievementSystem />
      </Suspense>
    </ErrorBoundary>
  );
}

