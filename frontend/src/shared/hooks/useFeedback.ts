import { create } from 'zustand';

interface FeedbackItem {
    id: string;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
    onUndo?: () => void;
    duration?: number;
}

interface FeedbackState {
    toasts: FeedbackItem[];
    addToast: (toast: Omit<FeedbackItem, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
        
        const duration = toast.duration || 5000;
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
        }, duration);
    },
    removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }
}));
