import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-brand-text"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 border rounded-lg text-sm bg-white
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold
            ${error ? 'border-red-400 focus:ring-red-400/50 focus:border-red-400' : 'border-gray-200'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-brand-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
