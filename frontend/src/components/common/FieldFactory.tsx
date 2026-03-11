import React from 'react';
import styles from './FieldFactory.module.css';

export interface FieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  hint?: string;
  fullWidth?: boolean;
}

interface FieldFactoryProps {
  definition: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

/**
 * Componente factoría que renderiza un campo de formulario dinámicamente
 * basándose en una definición JSON (Metadata-Driven).
 */
export const FieldFactory: React.FC<FieldFactoryProps> = ({
  definition,
  value,
  onChange,
  disabled = false,
}) => {
  const { id, label, type, placeholder, required, options, hint, fullWidth } = definition;

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={id}
            className={styles.input}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
          >
            <option value="">Seleccionar...</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className={styles.checkboxWrapper}>
            <input
              id={id}
              type="checkbox"
              className={styles.checkbox}
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
            />
            <label htmlFor={id} className={styles.checkboxLabel}>
              {label}
            </label>
          </div>
        );

      case 'number':
        return (
          <input
            id={id}
            type="number"
            className={styles.input}
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
          />
        );

      default:
        return (
          <input
            id={id}
            type={type === 'date' ? 'date' : 'text'}
            className={styles.input}
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
          />
        );
    }
  };

  return (
    <div className={`${styles.fieldGroup} ${fullWidth ? styles.fullSpan : ''}`}>
      {type !== 'checkbox' && (
        <label htmlFor={id} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {renderInput()}
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
};
