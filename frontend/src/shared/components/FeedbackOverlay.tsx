import { useFeedbackStore } from '../hooks/useFeedback';
import { ArrowCounterClockwise, X } from "@phosphor-icons/react";
import styles from './FeedbackOverlay.module.css';

export function FeedbackOverlay() {
    const { toasts, removeToast } = useFeedbackStore();

    if (toasts.length === 0) return null;

    return (
        <div className={styles.container}>
            {toasts.map((toast) => (
                <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
                    <span className={styles.message}>{toast.message}</span>
                    <div className={styles.actions}>
                        {toast.onUndo && (
                            <button 
                                className={styles.btnUndo} 
                                onClick={() => {
                                    toast.onUndo?.();
                                    removeToast(toast.id);
                                }}
                            >
                                <ArrowCounterClockwise size={16} />
                                DESHACER
                            </button>
                        )}
                        <button className={styles.btnClose} onClick={() => removeToast(toast.id)}>
                            <X size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
