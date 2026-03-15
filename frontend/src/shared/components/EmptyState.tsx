import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
    illustration?: React.ReactNode;
    icon?: React.ReactNode; // Alias for illustration
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    action?: React.ReactNode; // For custom buttons/actions
    educationalTip?: string;
}

export function EmptyState({ 
    illustration,
    icon,
    title, 
    description, 
    actionLabel, 
    onAction,
    action,
    educationalTip 
}: EmptyStateProps) {
    const finalIllustration = icon || illustration;

    return (
        <div className={styles.container}>
            <div className={styles.illustration}>
                {finalIllustration || <div className={styles.placeholderIcon} />}
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
            
            {educationalTip && (
                <div className={styles.tip}>
                    <span className={styles.tipBadge}>¿Sabías que?</span>
                    <p>{educationalTip}</p>
                </div>
            )}

            {(action || (actionLabel && onAction)) && (
                <div className={styles.actions}>
                    {action || (
                         <button 
                            className={styles.defaultActionBtn}
                            onClick={onAction}
                        >
                            {actionLabel}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
