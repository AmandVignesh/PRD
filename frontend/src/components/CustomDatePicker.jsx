import React, { useState, useEffect, useRef } from 'react';

/**
 * Helper to format a Date object to YYYY-MM-DD in the local timezone.
 */
function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * CustomDatePicker Component
 * Replaces the native browser date input with a custom styled calendar dropdown.
 * Includes quick select options (Today, Tomorrow, Clear) and a navigable mini-calendar grid.
 *
 * @param {string} value - Selected date string (YYYY-MM-DD)
 * @param {function} onChange - Callback function triggered on date selection
 * @param {boolean} disabled - Disabled state
 */
export default function CustomDatePicker({ value, onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // States for calendar navigation (local view year/month)
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  // Reset calendar view to selected date (or today) when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const activeDate = value ? new Date(value + 'T00:00:00') : new Date();
      setViewMonth(activeDate.getMonth());
      setViewYear(activeDate.getFullYear());
    }
  }, [isOpen, value]);

  // Close dropdown on click outside
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
    if (!disabled) setIsOpen(!isOpen);
  };

  const selectDate = (date) => {
    if (date === null) {
      onChange('');
    } else {
      onChange(formatDateLocal(date));
    }
    setIsOpen(false);
  };

  // Quick Select handlers
  const handleSelectToday = () => selectDate(new Date());
  const handleSelectTomorrow = () => {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    selectDate(tom);
  };
  const handleClear = () => selectDate(null);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Calendar math
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday, 1 = Monday...

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to check if a day is the currently selected date
  const isSelected = (day) => {
    if (!value) return false;
    const current = new Date(viewYear, viewMonth, day);
    return formatDateLocal(current) === value;
  };

  // Helper to check if a day is today
  const isToday = (day) => {
    const current = new Date(viewYear, viewMonth, day);
    return formatDateLocal(current) === formatDateLocal(today);
  };

  // Format button label text
  const getButtonLabel = () => {
    if (!value) return 'Add due date';

    const todayStr = formatDateLocal(today);
    const tom = new Date();
    tom.setDate(today.getDate() + 1);
    const tomStr = formatDateLocal(tom);

    if (value === todayStr) return 'Today';
    if (value === tomStr) return 'Tomorrow';

    try {
      const d = new Date(value + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return value;
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
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
          <span>📅</span>
          <span>{getButtonLabel()}</span>
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

      {/* Dropdown Calendar Panel */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 sm:right-auto w-72 mt-1.5 p-3.5 bg-slate-900/95 border border-slate-800/90 rounded-xl shadow-2xl backdrop-blur-md animate-fadeIn">
          
          {/* Quick Select Options */}
          <div className="grid grid-cols-3 gap-1.5 pb-3 border-b border-slate-800/50 mb-3 text-[10px] font-bold tracking-wider text-center uppercase">
            <button
              type="button"
              onClick={handleSelectToday}
              className="py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg cursor-pointer transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleSelectTomorrow}
              className="py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg cursor-pointer transition-colors"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg cursor-pointer transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Month Navigator Header */}
          <div className="flex justify-between items-center mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs font-semibold text-slate-200 select-none">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 mb-1 select-none">
            {weekdays.map((wd) => (
              <span key={wd} className="w-8 h-8 flex items-center justify-center">{wd}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Empty cells offset for first day of month */}
            {Array(firstDayIndex)
              .fill(null)
              .map((_, i) => (
                <span key={`empty-${i}`} className="w-8 h-8" />
              ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const selected = isSelected(day);
              const todayFlag = isToday(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => selectDate(new Date(viewYear, viewMonth, day))}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all duration-150 cursor-pointer ${
                    selected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : todayFlag
                      ? 'border border-indigo-500 text-indigo-400 bg-indigo-500/10'
                      : 'text-slate-350 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
