interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="h-2 w-full flex">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`
            flex-1 transition-all duration-300
            ${i < current - 1 ? 'bg-green' : ''}
            ${i === current - 1 ? 'bg-blue' : ''}
            ${i > current - 1 ? 'bg-grey-light' : ''}
          `}
        />
      ))}
    </div>
  );
}
