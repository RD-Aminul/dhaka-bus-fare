import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, PlusCircle } from 'lucide-react';
import { getStopEnglishName } from '../data/englishNames';
import { normalizeBangla, enToBnNumber } from '../utils/fareEngine';

export default function SearchableSelect({
  label,
  value,
  onChange,
  options = [], // [{ value, label, labelEn, km, badge }] or string[]
  placeholder = 'স্টপ খুঁজুন / Search stop...',
  icon: Icon,
  disabled = false,
  lang = 'bn',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Normalize options to a standard object array
  const formattedOptions = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'string') {
        const en = getStopEnglishName(opt);
        return {
          value: opt,
          label: opt,
          labelEn: en !== opt ? en : '',
          raw: opt
        };
      }
      const en = opt.labelEn || getStopEnglishName(opt.label || opt.name || opt.value);
      return {
        value: opt.value || opt.name || opt.label,
        label: opt.label || opt.name || opt.value,
        labelEn: en !== (opt.label || opt.name || opt.value) ? en : (opt.labelEn || ''),
        km: opt.km !== undefined ? opt.km : null,
        badge: opt.badge || null,
        subText: opt.subText || null,
        raw: opt
      };
    });
  }, [options]);

  // Selected Option Object
  const selectedOption = useMemo(() => {
    return formattedOptions.find(opt => opt.value === value) || null;
  }, [formattedOptions, value]);

  // Filter options by English or Bengali query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return formattedOptions;
    const qLower = searchQuery.toLowerCase().trim();
    const qNorm = normalizeBangla(searchQuery);

    return formattedOptions.filter(opt => {
      const bnMatch = normalizeBangla(opt.label).includes(qNorm);
      const enMatch = (opt.labelEn || '').toLowerCase().includes(qLower);
      const valMatch = (opt.value || '').toLowerCase().includes(qLower);
      const subMatch = (opt.subText || '').toLowerCase().includes(qLower);
      return bnMatch || enMatch || valMatch || subMatch;
    });
  }, [formattedOptions, searchQuery]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Reset highlight on query change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current && listRef.current.children[highlightedIndex]) {
      listRef.current.children[highlightedIndex].scrollIntoView({
        block: 'nearest'
      });
    }
  }, [highlightedIndex, isOpen]);

  // Open dropdown
  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    setSearchQuery('');
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  // Select item
  const handleSelect = (opt) => {
    onChange(opt.value, opt);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        handleOpen();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1 < filteredOptions.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 >= 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Helper for primary & secondary text based on active language
  const getDisplayTexts = (opt) => {
    if (!opt) return { primary: '', secondary: '' };
    if (lang === 'en') {
      const primary = opt.labelEn || opt.label;
      const secondary = opt.labelEn && opt.label !== opt.labelEn ? opt.label : '';
      return { primary, secondary };
    } else {
      const primary = opt.label;
      const secondary = opt.labelEn && opt.label !== opt.labelEn ? opt.labelEn : '';
      return { primary, secondary };
    }
  };

  const selectedTexts = getDisplayTexts(selectedOption);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1 select-none">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <div
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        className={`w-full min-h-[44px] px-3 py-2 bg-slate-50 border rounded-xl flex items-center justify-between gap-2 cursor-pointer transition select-none ${
          isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white'
            : 'border-slate-200 hover:border-slate-300 hover:bg-white'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          {Icon && <Icon className="w-4 h-4 text-emerald-600 shrink-0" />}
          
          {selectedOption ? (
            <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
              <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                {selectedTexts.primary}
              </span>
              {selectedTexts.secondary && (
                <span className="text-[11px] sm:text-xs text-slate-500 truncate hidden sm:inline font-normal">
                  ({selectedTexts.secondary})
                </span>
              )}
              {selectedOption.km !== null && (
                <span className="text-[10px] sm:text-xs font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium shrink-0 ml-auto">
                  {lang === 'bn' ? enToBnNumber(selectedOption.km) : selectedOption.km} {lang === 'en' ? 'km' : 'কিমি'}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 text-xs sm:text-sm truncate">
              {placeholder}
            </span>
          )}
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
      </div>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          
          {/* Search Input Box */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={lang === 'en' ? "Type in English or Bangla (e.g. Mirpur or মিরপুর)..." : "বাংলা বা ইংরেজিতে লিখুন (e.g. Mirpur বা মিরপুর)..."}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-md transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div 
            ref={listRef}
            className="max-h-60 overflow-y-auto divide-y divide-slate-100/70 p-1"
          >
            {/* Quick Option to select custom typed stop if not exact match */}
            {searchQuery.trim() && !filteredOptions.some(o => o.label.toLowerCase() === searchQuery.trim().toLowerCase() || (o.labelEn && o.labelEn.toLowerCase() === searchQuery.trim().toLowerCase())) && (
              <div
                onClick={() => handleSelect({ 
                  value: searchQuery.trim(), 
                  label: searchQuery.trim(), 
                  labelEn: searchQuery.trim(), 
                  km: null,
                  badge: lang === 'en' ? 'Custom' : 'কাস্টম' 
                })}
                className="m-1 p-2.5 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/80 hover:bg-emerald-100 cursor-pointer flex items-center gap-2 text-emerald-900 transition"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">
                    {lang === 'en' ? `Use "${searchQuery.trim()}" as custom stop` : `"${searchQuery.trim()}" কাস্টম স্টপ হিসেবে সিলেক্ট করুন`}
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    {lang === 'en' ? 'Automatic distance & fare calculation' : 'স্বয়ংক্রিয় দূরত্ব ও ভাড়া হিসাব হবে'}
                  </div>
                </div>
              </div>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;
                const { primary, secondary } = getDisplayTexts(opt);

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-2 transition ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : isHighlighted
                        ? 'bg-slate-100/80 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs sm:text-sm font-semibold truncate">
                          {primary}
                        </span>
                        {secondary && (
                          <span className="text-[11px] text-slate-500 font-normal truncate">
                            ({secondary})
                          </span>
                        )}
                        {opt.badge && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded shrink-0 ml-1">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.subText && (
                        <span className="text-[11px] text-slate-400 truncate mt-0.5">
                          {opt.subText}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {opt.km !== null && (
                        <span className="text-[11px] font-mono text-slate-500">
                          {lang === 'bn' ? enToBnNumber(opt.km) : opt.km} {lang === 'en' ? 'km' : 'কিমি'}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                {lang === 'en' 
                  ? `No stops found matching "${searchQuery}"`
                  : `"${searchQuery}" নামে কোনো স্টপ পাওয়া যায়নি`
                }
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
