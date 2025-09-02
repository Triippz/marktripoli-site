interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="p-6 text-red-400 font-mono">{error}</div>
  );
}