'use client';

import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description: string;
  example?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, example, icon, actions }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white">
              {icon}
            </div>
          )}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-primary-700">{title}</h1>
            {example && (
              <span className="help-tooltip">
                <HelpCircle className="h-5 w-5 text-gold-500 hover:text-gold-700 transition-colors" />
                <div className="help-tooltip-content">
                  <div className="font-semibold text-gold-300 mb-1">مثال:</div>
                  {example}
                </div>
              </span>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <p className="text-darkgray leading-relaxed max-w-3xl">{description}</p>
      <div className="gold-divider mt-4" />
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className, title, subtitle }: CardProps) {
  return (
    <div className={cn('institutional-card p-6', className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-bold text-primary-700">{title}</h3>}
          {subtitle && <p className="text-sm text-darkgray mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  variant?: 'primary' | 'gold' | 'sage' | 'wine' | 'steelblue';
  icon?: React.ReactNode;
}

export function StatCard({ label, value, hint, variant = 'primary', icon }: StatCardProps) {
  const variants = {
    primary:   'border-primary-200 bg-gradient-to-br from-primary-50 to-white',
    gold:      'border-gold-200 bg-gradient-to-br from-gold-50 to-white',
    sage:      'border-sage/30 bg-gradient-to-br from-green-50 to-white',
    wine:      'border-wine/30 bg-gradient-to-br from-rose-50 to-white',
    steelblue: 'border-steelblue/30 bg-gradient-to-br from-blue-50 to-white',
  };

  const iconColors = {
    primary:   'text-primary-600',
    gold:      'text-gold-700',
    sage:      'text-sage',
    wine:      'text-wine',
    steelblue: 'text-steelblue',
  };

  return (
    <div className={cn('rounded-xl border-2 p-5 transition-all hover:shadow-md', variants[variant])}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-darkgray uppercase tracking-wide">{label}</span>
        {icon && <span className={iconColors[variant]}>{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-primary-700">{value}</div>
      {hint && <p className="text-xs text-darkgray mt-1.5">{hint}</p>}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'gold' | 'sage' | 'wine' | 'steelblue' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'primary', className }: BadgeProps) {
  const variants = {
    primary:   'bg-primary-100 text-primary-800 border-primary-200',
    gold:      'bg-gold-100 text-gold-800 border-gold-300',
    sage:      'bg-green-100 text-green-800 border-green-200',
    wine:      'bg-rose-100 text-wine border-rose-200',
    steelblue: 'bg-blue-100 text-steelblue border-blue-200',
    gray:      'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border', variants[variant], className)}>
      {children}
    </span>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      {icon && (
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold-50 text-gold-600 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-primary-700 mb-2">{title}</h3>
      {description && <p className="text-sm text-darkgray max-w-md mx-auto mb-4">{description}</p>}
      {action}
    </div>
  );
}

interface DemoDataNoticeProps {
  className?: string;
}

export function DemoDataNotice({ className }: DemoDataNoticeProps) {
  return (
    <div className={cn('flex items-start gap-2 px-3 py-2 bg-gold-50 border border-gold-300 rounded-lg text-xs text-gold-800', className)}>
      <span className="font-bold">⚠</span>
      <span>هذه بيانات افتراضية لأغراض العرض والتجربة، ولا تمثل تقييماً حقيقياً لأي موظف.</span>
    </div>
  );
}
