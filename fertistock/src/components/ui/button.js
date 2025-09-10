// components/ui/button.js
import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils'; // Fix: Changed import path

const Button = forwardRef(
    (
        {
            variant = 'default',
            size = 'default',
            className,
            children,
            asChild = false,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? React.Fragment : 'button';
        return (
            <Comp
                className={cn(
                    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                    variant === 'default' &&
                        'bg-primary text-primary-foreground hover:bg-primary/90',
                    variant === 'destructive' &&
                        'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                    variant === 'outline' &&
                        'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
                    variant === 'secondary' &&
                        'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                    variant === 'ghost' &&
                        'text-foreground hover:bg-accent hover:text-accent-foreground',
                    variant === 'link' && 'text-primary underline-offset-4 hover:underline',
                    size === 'default' && 'px-4 py-2',
                    size === 'sm' && 'px-3 py-1.5',
                    size === 'lg' && 'px-6 py-3',
                    size === 'icon' && 'h-9 w-9 p-0',
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </Comp>
        );
    }
);
Button.displayName = 'Button';

export { Button };