import React from 'react';
import { ChangeEvent, useState } from 'react';

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: readonly string[];
}

export default function AutocompleteInput({
  label,
  value,
  onChange,
  suggestions,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue) {
      const filtered = suggestions.filter((s) =>
        s.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
  };

  return (
    <label className="block relative">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => value && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border
                  focus:border-yellow-400 focus:ring focus:ring-yellow-400
                  focus:ring-opacity-50"
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion) => (
            <li
              key={suggestion}
              onClick={() => handleSelect(suggestion)}
              className="px-3 py-2 hover:bg-yellow-50 cursor-pointer"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}
