import { useSkipNavigation } from '../hooks/useKeyboardNavigation';

export function SkipNavigation() {
  const { skipLinkRef, skip } = useSkipNavigation();

  return (
    <a
      ref={skipLinkRef}
      href="#main-content"
      className="skip-link"
      onClick={(e) => {
        e.preventDefault();
        skip();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          skip();
        }
      }}
    >
      Skip to main content
    </a>
  );
}

interface SkipTargetProps {
  id: string;
  children?: React.ReactNode;
  className?: string;
}

export function SkipTarget({ id, children, className = '' }: SkipTargetProps) {
  const { targetRef } = useSkipNavigation();

  return (
    <div
      id={id}
      ref={targetRef}
      className={className}
      tabIndex={-1}
    >
      {children}
    </div>
  );
}