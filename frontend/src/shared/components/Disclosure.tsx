import { useState } from 'react';
import { CaretDown, CaretUp, Info } from "@phosphor-icons/react";
import styles from './Disclosure.module.css';

interface DisclosureProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    educationalHint?: string;
}

export function Disclosure({ title, children, defaultOpen = false, educationalHint }: DisclosureProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`${styles.container} ${isOpen ? styles.open : ''}`}>
            <button 
                type="button" 
                className={styles.header} 
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={styles.titleGroup}>
                    {educationalHint && <Info size={18} className={styles.hintIcon} />}
                    <span className={styles.title}>{title}</span>
                </div>
                {isOpen ? <CaretUp size={18} /> : <CaretDown size={18} />}
            </button>
            
            {isOpen && (
                <div className={styles.content}>
                    {educationalHint && (
                        <p className={styles.hintText}>{educationalHint}</p>
                    )}
                    {children}
                </div>
            )}
        </div>
    );
}
