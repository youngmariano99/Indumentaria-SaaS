import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    icon?: React.ReactNode;
    loading?: boolean;
    educational?: boolean; // Si es true, puede incluir efectos visuales que guíen al usuario
    fullWidth?: boolean;
}

export function Button({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    icon, 
    loading, 
    educational,
    fullWidth,
    className = '',
    ...props 
}: ButtonProps) {
    const buttonClasses = [
        styles.button,
        styles[variant],
        styles[size],
        educational ? styles.educational : '',
        fullWidth ? styles.fullWidth : '',
        className
    ].join(' ');

    return (
        <button 
            className={buttonClasses} 
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <span className={styles.spinner} />
            ) : (
                <>
                    {icon && <span className={styles.icon}>{icon}</span>}
                    <span className={styles.label}>{children}</span>
                </>
            )}
        </button>
    );
}
