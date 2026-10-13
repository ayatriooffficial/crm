'use client';

import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDownIcon, CloseIcon, PlusIcon } from '@/components/icons';
import { cx } from '@/lib/cx';

/*
 * Two menu skins seen in the screenshots:
 *  - "list": react-select style (Type, Group, Users, Tags, State) with a
 *    light-blue highlighted row.
 *  - "card": the Billing Profile menu — rounded, grey hover, optional
 *    secondary line per option.
 */
const MENU_SKINS = {
  list: {
    menu: 'rounded bg-white py-1 shadow-menu',
    option: 'px-4 py-2.5',
    active: 'bg-option-active',
    selected: 'bg-brand text-white',
  },
  card: {
    menu: 'rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/5',
    option: 'rounded-md px-4 py-2',
    active: 'bg-gray-100',
    selected: 'font-medium text-brand',
  },
};

const MIN_COMFORTABLE_SPACE = 240;

/**
 * Accessible single/multi select with optional search and "Add New".
 * Calls `onChange(nextValue, name)`; value is a string (single) or array (multiple).
 */
function Select({
  id,
  name,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  multiple = false,
  searchable = false,
  separator = false,
  variant = 'list',
  invalid = false,
  onCreate,
  createLabel = 'Add New',
  maxMenuHeight = '23rem',
  prefix,
  ...aria
}) {
  const fallbackId = useId();
  const baseId = id ?? fallbackId;
  const listboxId = `${baseId}-listbox`;

  const rootRef = useRef(null);
  const controlRef = useRef(null);
  const listRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropUp, setDropUp] = useState(false);

  const skin = MENU_SKINS[variant];

  const selectedValues = useMemo(() => {
    if (multiple) return value ?? [];
    return value == null || value === '' ? [] : [value];
  }, [multiple, value]);

  const optionMap = useMemo(() => new Map(options.map((option) => [option.value, option])), [options]);

  const visibleOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const hidden = multiple ? new Set(selectedValues) : null;
    return options.filter(
      (option) => !hidden?.has(option.value) && (!needle || option.label.toLowerCase().includes(needle)),
    );
  }, [options, query, multiple, selectedValues]);

  const selectedOption = multiple ? null : optionMap.get(value);
  const chips = multiple ? selectedValues.map((v) => optionMap.get(v)).filter(Boolean) : null;

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
  }, []);

  const openMenu = () => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const menuPx = parseFloat(maxMenuHeight) * rootPx;
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < Math.min(menuPx, MIN_COMFORTABLE_SPACE) && rect.top > spaceBelow);
    }
    const selectedIndex = multiple ? -1 : options.findIndex((option) => option.value === value);
    setActiveIndex(Math.max(selectedIndex, 0));
    setOpen(true);
  };

  // Close on any pointer press outside the component.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, close]);

  // Keep the highlighted option visible without scrolling the page.
  useEffect(() => {
    const list = listRef.current;
    if (!open || !list || activeIndex < 0) return;
    const item = list.querySelector(`[data-index="${activeIndex}"]`);
    if (!item) return;
    if (item.offsetTop < list.scrollTop) {
      list.scrollTop = item.offsetTop;
    } else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
    }
  }, [open, activeIndex]);

  const selectOption = (option) => {
    if (multiple) {
      onChange([...selectedValues, option.value], name);
      setQuery('');
      setActiveIndex((index) => Math.min(index, visibleOptions.length - 2));
    } else {
      onChange(option.value, name);
      close();
    }
    controlRef.current?.focus();
  };

  const removeValue = (removed) => {
    onChange(
      selectedValues.filter((v) => v !== removed),
      name,
    );
  };

  const handleCreate = (label) => {
    onCreate(label);
    close();
    controlRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    const last = visibleOptions.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (open) setActiveIndex((index) => Math.min(index + 1, last));
        else openMenu();
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (open) setActiveIndex((index) => Math.max(index - 1, 0));
        else openMenu();
        break;
      case 'Home':
      case 'End':
        if (open) {
          event.preventDefault();
          setActiveIndex(event.key === 'Home' ? 0 : last);
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (open && visibleOptions[activeIndex]) selectOption(visibleOptions[activeIndex]);
        else if (!open) openMenu();
        break;
      case ' ':
        if (searchable) break;
        event.preventDefault();
        if (open && visibleOptions[activeIndex]) selectOption(visibleOptions[activeIndex]);
        else if (!open) openMenu();
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
        break;
      case 'Tab':
        if (open) close();
        break;
      case 'Backspace':
        if (multiple && searchable && !query && selectedValues.length) {
          removeValue(selectedValues[selectedValues.length - 1]);
        }
        break;
      default:
    }
  };

  const handleControlClick = (event) => {
    if (event.target.closest('[data-chip-remove]')) return;
    controlRef.current?.focus();
    if (!open) openMenu();
    else if (!searchable || event.target.closest('[data-indicator]')) close();
  };

  // Tabbing focus out of the component (e.g. from the "Add New" input).
  const handleBlur = (event) => {
    if (open && event.relatedTarget && !rootRef.current?.contains(event.relatedTarget)) close();
  };

  const activeDescendant =
    open && visibleOptions[activeIndex] ? `${baseId}-option-${activeIndex}` : undefined;

  const comboboxProps = {
    id: baseId,
    ref: controlRef,
    role: 'combobox',
    'aria-expanded': open,
    'aria-controls': listboxId,
    'aria-haspopup': 'listbox',
    'aria-activedescendant': activeDescendant,
    'aria-invalid': invalid || undefined,
    onKeyDown: handleKeyDown,
    ...aria,
  };

  return (
    <div ref={rootRef} className="relative" onBlur={handleBlur}>
      <div
        onClick={handleControlClick}
        className={cx(
          'flex min-h-12 w-full items-center rounded-md border bg-white text-base text-ink transition-[border-color,box-shadow] duration-150',
          invalid
            ? 'border-danger focus-within:ring-1 focus-within:ring-danger'
            : open
              ? 'border-focus ring-1 ring-focus'
              : 'border-line hover:border-line-strong focus-within:border-focus focus-within:ring-1 focus-within:ring-focus',
        )}
      >
        {prefix && <span className="flex shrink-0 items-center pl-3.5 text-ink-soft">{prefix}</span>}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 py-1.5 pl-3.5 pr-2">
          {chips?.map((option) => (
            <span
              key={option.value}
              className={cx(
                'inline-flex max-w-full items-center overflow-hidden rounded-sm text-sm',
                option.chipClass ?? 'bg-[#e6e6e6] text-ink',
              )}
            >
              <span className="truncate py-0.5 pl-1.5 pr-1">{option.label}</span>
              <button
                type="button"
                data-chip-remove
                tabIndex={-1}
                onClick={() => removeValue(option.value)}
                aria-label={`Remove ${option.label}`}
                className="grid self-stretch place-items-center px-1 hover:bg-red-100 hover:text-red-700"
              >
                <CloseIcon size={12} strokeWidth={2} />
              </button>
            </span>
          ))}

          {searchable ? (
            <input
              {...comboboxProps}
              type="text"
              autoComplete="off"
              aria-autocomplete="list"
              value={query}
              onChange={(event) => {
                if (!open) openMenu();
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              placeholder={chips?.length ? '' : (selectedOption?.label ?? placeholder)}
              className={cx(
                'h-8 min-w-12 flex-1 bg-transparent outline-none',
                selectedOption ? 'placeholder:text-ink' : 'placeholder:text-placeholder',
              )}
            />
          ) : (
            <button {...comboboxProps} type="button" className="h-8 min-w-0 flex-1 truncate text-left outline-none">
              {selectedOption?.label ?? <span className="text-placeholder">{placeholder}</span>}
            </button>
          )}
        </div>

        <div data-indicator className="flex shrink-0 items-center self-stretch">
          {separator && <span aria-hidden="true" className="h-6 w-px bg-[#cccccc]" />}
          <span
            aria-hidden="true"
            className={cx(
              'grid h-full place-items-center transition-colors',
              separator ? 'px-2.5 text-[#a6a6a6] hover:text-[#666]' : 'px-4 text-ink-soft',
            )}
          >
            <ChevronDownIcon size={20} strokeWidth={separator ? 2 : 1.5} />
          </span>
        </div>
      </div>

      {open && (
        <div
          className={cx(
            'absolute left-0 z-30 w-full overflow-hidden',
            dropUp ? 'bottom-full mb-2' : 'top-full mt-2',
            skin.menu,
          )}
        >
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable={multiple || undefined}
            onMouseDown={(event) => event.preventDefault()}
            className="scrollbar-slim relative overflow-y-auto overscroll-contain"
            style={{ maxHeight: maxMenuHeight }}
          >
            {visibleOptions.length === 0 && (
              <li className="px-4 py-2.5 text-center text-placeholder">No options</li>
            )}

            {visibleOptions.map((option, index) => {
              const isSelected = !multiple && option.value === value;
              return (
                <li
                  key={option.value}
                  id={`${baseId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  data-index={index}
                  onClick={() => selectOption(option)}
                  onMouseMove={() => index !== activeIndex && setActiveIndex(index)}
                  className={cx(
                    'cursor-pointer select-none',
                    skin.option,
                    isSelected ? skin.selected : index === activeIndex && skin.active,
                    !isSelected && option.textClass,
                  )}
                >
                  <span className="block">{option.label}</span>
                  {option.meta && <span className="mt-0.5 block text-sm text-muted">{option.meta}</span>}
                </li>
              );
            })}

            {onCreate && (
              <li role="presentation" className="px-2.5 pb-1.5 pt-2.5">
                <CreateOption label={createLabel} initialValue={query} onCreate={handleCreate} />
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/** "+ Add New" footer that expands into an inline name input. */
function CreateOption({ label, initialValue, onCreate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(initialValue);
          setEditing(true);
        }}
        className="flex h-12 w-full items-center gap-3 rounded-md bg-control-muted px-4 text-lg text-ink transition-colors hover:bg-control-muted-hover"
      >
        <PlusIcon size={18} strokeWidth={2} />
        {label}
      </button>
    );
  }

  const submit = () => {
    const trimmed = draft.trim();
    if (trimmed) onCreate(trimmed);
  };

  return (
    <div className="flex gap-2" onMouseDown={(event) => event.stopPropagation()}>
      <input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            submit();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setEditing(false);
          }
        }}
        placeholder="Name"
        aria-label="New option name"
        className="h-10 min-w-0 flex-1 rounded-md border border-line px-3 text-base outline-none focus:border-focus focus:ring-1 focus:ring-focus"
      />
      <button
        type="button"
        onClick={submit}
        className="h-10 shrink-0 rounded-md bg-brand px-4 text-base text-white hover:bg-brand-hover"
      >
        Add
      </button>
    </div>
  );
}

export default memo(Select);
