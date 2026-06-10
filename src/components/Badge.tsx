import React from 'react';

type BadgeVariant = 'blue' | 'green' | 'orange' | 'purple' | 'gray' | 'red';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', size = 'sm' }) => (
  <span className={`badge badge-${size} badge-${variant}`}>
    {children}
  </span>
);
