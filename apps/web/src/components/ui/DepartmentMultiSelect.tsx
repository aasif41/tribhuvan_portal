import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, X, Building2 } from 'lucide-react';
import { PROGRAMS as FALLBACK_PROGRAMS } from '@tribhuvan/shared';
import api from '../../services/api';

interface DepartmentMultiSelectProps {
  value: string; // Comma-separated string or single department name
  onChange: (newValue: string) => void;
  label?: string;
  required?: boolean;
}

export function DepartmentMultiSelect({
  value,
  onChange,
  label = 'Department / Program(s)',
  required = false,
}: DepartmentMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [programsList, setProgramsList] = useState<{ name: string; code: string }[]>(FALLBACK_PROGRAMS);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse comma-separated value into array of selected department names
  const selectedDepartments = value
    ? value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  useEffect(() => {
    api
      .get('/programs')
      .then((res) => {
        if (res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setProgramsList(res.data.data);
        }
      })
      .catch(() => {
        // Fallback to static programs
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDepartment = (deptName: string) => {
    let updated: string[];
    if (selectedDepartments.includes(deptName)) {
      updated = selectedDepartments.filter((d) => d !== deptName);
    } else {
      updated = [...selectedDepartments, deptName];
    }
    onChange(updated.join(', '));
  };

  const removeDepartment = (deptName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = selectedDepartments.filter((d) => d !== deptName);
    onChange(updated.join(', '));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-[#5a6a80] mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Main Select Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[42px] border bg-[#f7f5f0] border-[#d4c9b0]/50 rounded-lg px-3 py-2 text-[13px] text-[#1a2744] cursor-pointer hover:border-[#c8922a]/70 transition-colors flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <Building2 size={15} className="text-[#9a917e] shrink-0" />

          {selectedDepartments.length === 0 ? (
            <span className="text-[#9a917e] text-xs">Select department / program(s)...</span>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {selectedDepartments.map((dept) => (
                <span
                  key={dept}
                  className="inline-flex items-center gap-1 bg-[#0d1f3c] text-[#f0ece4] text-[11px] px-2 py-0.5 rounded-md font-medium shadow-xs"
                >
                  <span className="truncate max-w-[180px]">{dept}</span>
                  <button
                    type="button"
                    onClick={(e) => removeDepartment(dept, e)}
                    className="hover:text-[#c8922a] transition-colors focus:outline-none"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <ChevronDown
          size={16}
          className={`text-[#9a917e] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#c8922a]' : ''
          }`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#d4c9b0]/60 rounded-lg shadow-xl max-h-60 overflow-y-auto p-1 text-xs">
          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9a917e] border-b border-gray-100 mb-1 flex justify-between items-center">
            <span>Choose Departments / Programs</span>
            <span className="text-[10px] text-[#c8922a] font-normal">
              {selectedDepartments.length} selected
            </span>
          </div>

          {programsList.map((p) => {
            const isSelected = selectedDepartments.includes(p.name);
            return (
              <div
                key={p.code}
                onClick={() => toggleDepartment(p.name)}
                className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#0d1f3c]/5 text-[#0d1f3c] font-semibold'
                    : 'hover:bg-gray-50 text-gray-700 font-normal'
                }`}
              >
                <div className="flex items-center gap-2 pr-2">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#0d1f3c] border-[#0d1f3c] text-[#f0ece4]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </div>
                  <span className="text-[12px]">{p.name}</span>
                </div>
                <span className="text-[10px] text-[#9a917e] uppercase font-mono px-1.5 py-0.5 bg-gray-100 rounded">
                  {p.code}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
