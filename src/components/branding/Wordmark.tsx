import { cn } from '@/lib/utils';

interface JadeerWordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
  variant?: 'light' | 'dark';
}

export function JadeerWordmark({
  size = 'md',
  className,
  showTagline = true,
  variant = 'dark',
}: JadeerWordmarkProps) {
  const sizeClasses = {
    sm: { name: 'text-xl', tagline: 'text-xs' },
    md: { name: 'text-3xl', tagline: 'text-sm' },
    lg: { name: 'text-5xl', tagline: 'text-base' },
    xl: { name: 'text-6xl md:text-7xl', tagline: 'text-lg' },
  }[size];

  const colorClasses = {
    light: { name: 'text-white', tagline: 'text-gold-200' },
    dark: { name: 'text-primary-700', tagline: 'text-gold-700' },
  }[variant];

  return (
    <div className={cn('flex flex-col', className)}>
      <h1 className={cn('font-bold tracking-tight', sizeClasses.name, colorClasses.name)}>
        منصة <span className="text-gold-600">جدير</span>
      </h1>
      {showTagline && (
        <p className={cn('mt-1 font-medium', sizeClasses.tagline, colorClasses.tagline)}>
          منصة مؤسسية لقياس الجدارة القيادية
        </p>
      )}
    </div>
  );
}
