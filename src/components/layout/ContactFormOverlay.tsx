import { Suspense, lazy } from 'react';
import ErrorBoundary from '../ErrorBoundary';

const EncryptedContactForm = lazy(() => import('../contact/EncryptedContactForm'));

interface ContactFormOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactFormOverlay({ isOpen, onClose }: ContactFormOverlayProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div />}>
        <EncryptedContactForm isOpen={isOpen} onClose={onClose} />
      </Suspense>
    </ErrorBoundary>
  );
}

