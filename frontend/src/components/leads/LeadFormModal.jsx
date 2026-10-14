'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import TextField from '@/components/ui/TextField';
import Select from '@/components/ui/Select';
import DateInput from '@/components/ui/DateInput';
import { controlClass, focusRing } from '@/components/ui/styles';
import { AvatarPlaceholder, CloseIcon, EyeIcon, EyeOffIcon, UploadIcon } from '@/components/icons';
import { cx } from '@/lib/cx';
import { FIELD_ORDER, LEAD_SECTIONS, derivedFields, emptyLead, leadFieldId, toThumbnail, validateLead } from './leadModel';

/** Add / edit a lead. `lead` is null for a new one; `onSave` receives the cleaned values. */
export default function LeadFormModal({ lead, onSave, onClose }) {
  const [values, setValues] = useState(() => (lead ? { ...emptyLead(), ...lead } : emptyLead()));
  const [errors, setErrors] = useState({});

  const derived = useMemo(() => derivedFields(values), [values]);

  const set = useCallback((value, name) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const { [name]: _removed, ...rest } = current;
      return rest;
    });
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateLead(values);
    const firstInvalid = FIELD_ORDER.find((key) => nextErrors[key]);
    if (firstInvalid) {
      setErrors(nextErrors);
      document.getElementById(leadFieldId(firstInvalid))?.focus();
      return;
    }
    onSave({ ...values, ...derived });
  };

  return (
    <Modal title={lead ? 'Edit Lead' : 'Add Lead'} onClose={onClose} panelClassName="max-w-[88rem]" divided={false}>
      {/* The fields scroll inside the dialog so Save / Cancel stay in view. */}
      <form noValidate onSubmit={handleSubmit} className="flex max-h-[calc(100dvh-10.5rem)] flex-col">
        <div className="scrollbar-slim @container min-h-0 flex-1 space-y-8 overflow-y-auto overscroll-contain px-6 pb-8 pt-1">
          {/* The first block has no visible heading; later ones get a purple title + rule. */}
          {LEAD_SECTIONS.map((section, index) => (
            <section key={section.title} aria-labelledby={`lead-section-${index}`}>
              <h3
                id={`lead-section-${index}`}
                className={cx(index === 0 ? 'sr-only' : 'mb-5 border-b border-divider pb-3 text-xl font-semibold text-brand')}
              >
                {section.title}
              </h3>
              <div className="grid grid-cols-1 gap-x-4 gap-y-5 @2xl:grid-cols-2 @4xl:grid-cols-3">
                {section.fields.map((field) => (
                  <LeadField
                    key={field.key}
                    field={field}
                    value={field.kind === 'derived' ? derived[field.key] : values[field.key]}
                    error={errors[field.key]}
                    onChange={set}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-divider px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className={cx('h-12 rounded-md border border-brand bg-white px-5 text-lg text-brand transition-colors hover:bg-brand-soft', focusRing)}
          >
            Cancel
          </button>
          <Button type="submit">{lead ? 'Save Changes' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function LeadField({ field, value, error, onChange }) {
  const id = leadFieldId(field.key);
  const { key, label, kind, required } = field;

  switch (kind) {
    case 'photo':
      return <PhotoField id={id} name={key} label={label} value={value} onChange={onChange} />;
    case 'derived':
      return (
        <TextField
          id={id}
          name={key}
          label={label}
          value={value}
          onChange={() => {}}
          readOnly
          placeholder="Filled automatically"
          title="Filled automatically"
          inputClassName="bg-surface text-ink-soft"
        />
      );
    case 'date':
      return (
        <Field id={id} label={label}>
          <DateInput id={id} name={key} value={value} onChange={onChange} />
        </Field>
      );
    case 'select':
      return (
        <Field id={id} label={label}>
          <Select id={id} name={key} options={field.options} value={value} onChange={onChange} searchable={field.searchable} placeholder={label} />
        </Field>
      );
    case 'secret':
      return (
        <Field id={id} label={label} error={error}>
          <SecretInput id={id} name={key} value={value} onChange={onChange} />
        </Field>
      );
    case 'file':
      return (
        <Field id={id} label={label}>
          <AttachmentInput id={id} name={key} label={label} value={value} onChange={onChange} />
        </Field>
      );
    default:
      return (
        <TextField
          id={id}
          name={key}
          label={label}
          required={required}
          value={value}
          onChange={onChange}
          error={error}
          format={field.format}
          maxLength={field.maxLength}
          inputMode={field.inputMode}
          autoComplete={field.autoComplete ?? 'off'}
          placeholder={label}
          multiline={field.multiline}
          className={cx(field.wide && '@2xl:col-span-2 @5xl:col-span-3')}
        />
      );
  }
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/**
 * Compact photo field (same height as the other inputs): a round preview,
 * an upload/change button and remove. Keeps a small thumbnail so the photo
 * survives a page reload.
 */
function PhotoField({ id, name, label, value, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Choose an image file (JPG, PNG, GIF or WebP).');
    if (file.size > MAX_PHOTO_BYTES) return setError('Choose an image smaller than 5 MB.');
    try {
      onChange({ name: file.name, url: await toThumbnail(file) }, name);
      setError('');
    } catch {
      setError('This image could not be read. Try a JPG or PNG file.');
    }
  };

  return (
    <Field id={id} label={label} labelAs="span" error={error}>
      <div className="flex h-12 items-center gap-3 rounded-md border border-line px-2">
        {value?.url ? (
          // Stored data URLs can't go through next/image optimisation.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt="Selected photo" className="size-9 shrink-0 rounded-full object-cover" />
        ) : (
          <AvatarPlaceholder className="size-9 shrink-0" />
        )}
        <button
          id={id}
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-labelledby={`${id}-label ${id}`}
          className={cx('rounded text-base text-brand hover:underline', focusRing)}
        >
          {value ? 'Change photo' : 'Upload photo'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null, name)}
            aria-label="Remove photo"
            className={cx('ml-auto grid size-8 place-items-center rounded text-muted hover:text-danger', focusRing)}
          >
            <CloseIcon size={16} />
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" tabIndex={-1} className="sr-only" onChange={handleFile} />
      </div>
    </Field>
  );
}

function SecretInput({ id, name, value, onChange }) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOffIcon : EyeIcon;

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        autoComplete="new-password"
        value={value}
        onChange={(event) => onChange(event.target.value, name)}
        className={controlClass(false, 'h-12 pl-4 pr-12')}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className={cx(
          'absolute inset-y-0 right-2 my-auto grid size-9 place-items-center rounded text-ink-soft hover:bg-black/5 hover:text-ink',
          focusRing,
        )}
      >
        <Icon size={18} />
      </button>
    </div>
  );
}

/** Picks one document. Only the file name is kept until the backend can store files. */
function AttachmentInput({ id, name, label, value, onChange }) {
  if (value) {
    return (
      <div className="flex h-12 items-center gap-2 rounded-md border border-line bg-surface pl-4 pr-1.5 text-base text-ink">
        <span className="min-w-0 flex-1 truncate" title={value.name}>
          {value.name}
        </span>
        <button
          type="button"
          onClick={() => onChange(null, name)}
          aria-label={`Remove ${label}`}
          className={cx('grid size-9 shrink-0 place-items-center rounded text-muted hover:text-danger', focusRing)}
        >
          <CloseIcon size={16} />
        </button>
      </div>
    );
  }

  return (
    <label
      className={cx(
        'flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-line-strong text-base text-ink-soft',
        'hover:border-brand hover:text-brand focus-within:border-focus focus-within:ring-1 focus-within:ring-focus',
      )}
    >
      <UploadIcon size={18} />
      Attach file
      <input
        id={id}
        type="file"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onChange({ name: file.name }, name);
        }}
      />
    </label>
  );
}
