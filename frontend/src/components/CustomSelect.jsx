import React, { useState, useEffect, useRef } from 'react';

/**
 * CustomSelect Component
 * Replaces the native browser select element with a custom styled dropdown.
 * Eliminates "AI-generated" or default OS styling and integrates with the dark theme.
 *
 * @param {Array} options - Array of { value, label, icon }
 * @param {string|number} value - Selected value
 * @param {function} onChange - Change callback
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Optional container styling overrides
 */
export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select option',
  disabled = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } }); // Mimics standard event structure
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 rounded-xl text-left text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer ${
          isOpen ? 'border-indigo-500/80 ring-1 ring-indigo-500/30' : ''
        }`}
      >
        <span className="truncate flex items-center space-x-2">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${isOpen ? 'transform rotate-180 text-indigo-400' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Options Panel */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-slate-900/95 border border-slate-800/90 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden py-1 divide-y divide-slate-800/40 focus:outline-none animate-fadeIn duration-100">
          {options.length === 0 ? (
            <div className="px-3.5 py-2 text-xs text-slate-500 italic">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center space-x-2 px-3.5 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/90 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-850 hover:text-slate-100'
                  }`}
                >
                  {option.icon && <span className="shrink-0">{option.icon}</span>}
                  <span className="flex-1 truncate">{option.label}</span>
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
