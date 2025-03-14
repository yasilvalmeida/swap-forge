import { XCircle } from 'lucide-react';
import React, { useState, useRef, KeyboardEvent } from 'react';
import { Input } from './input';

interface TagsInputProps {
  name: string;
  value: string[];
  onChange: (tags: string[]) => void;
  onBlur: () => void;
  placeholder: string;
  maxTags: number;
}

export const TagsInput: React.FC<TagsInputProps> = ({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  maxTags,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ','].includes(e.key)) {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (
      trimmedValue &&
      !value.includes(trimmedValue) &&
      value.length < maxTags
    ) {
      onChange([...value, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange(newTags);
  };

  return (
    <div className='mb-3 flex flex-col gap-1'>
      <div className='flex flex-wrap gap-2'>
        {(value || []).map((tag, index) => (
          <div
            key={index}
            className='border-1 text-xs flex items-center rounded-full border-gray-200 p-1'
          >
            <span className='flex w-full flex-row justify-between gap-2'>
              {tag}
              <XCircle
                onClick={(e) => {
                  e.preventDefault();
                  removeTag(index);
                }}
                className='left-1 top-3 h-4 w-4 cursor-pointer text-gray-400 hover:text-yellow-400'
              />
            </span>
          </div>
        ))}
      </div>
      {(value || [])?.length < maxTags - 1 && (
        <Input
          type='text'
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={onBlur}
          placeholder={placeholder}
          ref={inputRef}
          className='w-full rounded border border-gray-300 p-1'
        />
      )}
    </div>
  );
};
