import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  variant?: 'full' | 'mark';
}

const SIZE_MAP = {
  sm: { width: 120, height: 50 },
  md: { width: 180, height: 75 },
  lg: { width: 280, height: 115 },
  xl: { width: 360, height: 150 },
  hero: { width: 480, height: 200 },
};

export function UniversityLogo({
  size = 'md',
  className,
  variant = 'full',
}: LogoProps) {
  const dimensions = SIZE_MAP[size];

  return (
    <div className={cn('logo-container inline-flex items-center', className)}>
      <Image
        src="/images/logo.png"
        alt="جامعة نايف العربية للعلوم الأمنية - Naif Arab University for Security Sciences"
        width={dimensions.width}
        height={dimensions.height}
        priority
        className="object-contain"
      />
    </div>
  );
}
