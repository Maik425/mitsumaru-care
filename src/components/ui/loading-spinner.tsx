import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export function LoadingSpinner({
  size = 'md',
  className,
  text,
}: LoadingSpinnerProps) {
  return (
    <div className='flex flex-col items-center justify-center gap-2'>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-gray-900',
          sizeClasses[size],
          className
        )}
      />
      {text && <p className='text-sm text-gray-600 animate-pulse'>{text}</p>}
    </div>
  );
}

// フルスクリーン用のローディングスピナー
export function FullScreenLoadingSpinner({
  text = '読み込み中...',
}: {
  text?: string;
}) {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <LoadingSpinner size='xl' text={text} />
    </div>
  );
}

// インライン用のローディングスピナー
export function InlineLoadingSpinner({
  size = 'sm',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <LoadingSpinner size={size} className={cn('inline-block', className)} />
  );
}

