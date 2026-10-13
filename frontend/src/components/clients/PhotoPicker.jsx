'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { ImagePlaceholder, PencilIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Local-only photo picker: opens the native file dialog and previews the
 * chosen image through an object URL (revoked when replaced/unmounted).
 */
function PhotoPicker({ id, name, value, onChange, labelledBy }) {
  const inputRef = useRef(null);
  const urlRef = useRef(value?.url);
  const [error, setError] = useState('');

  useEffect(() => {
    urlRef.current = value?.url;
  }, [value]);

  useEffect(() => () => urlRef.current && URL.revokeObjectURL(urlRef.current), []);

  const openPicker = () => inputRef.current?.click();

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Choose an image file (JPG, PNG, GIF or WebP).');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Choose an image smaller than 5 MB.');
      return;
    }

    setError('');
    if (value?.url) URL.revokeObjectURL(value.url);
    onChange({ file, name: file.name, url: URL.createObjectURL(file) }, name);
  };

  return (
    <div className="flex w-62 max-w-full flex-col items-center">
      <button
        id={id}
        type="button"
        onClick={openPicker}
        aria-labelledby={labelledBy}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cx(
          'grid aspect-square w-full place-items-center overflow-hidden rounded-lg border border-line bg-[#f5f6f8] transition-colors hover:border-line-strong',
          focusRing,
        )}
      >
        {value?.url ? (
          // Blob URLs can't go through next/image optimisation.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt="Selected client photo" className="size-full object-cover" />
        ) : (
          <ImagePlaceholder />
        )}
      </button>

      <button
        type="button"
        onClick={openPicker}
        aria-label={value ? 'Change photo' : 'Upload photo'}
        className={cx(
          'mt-3 grid size-12 place-items-center rounded-full bg-[#e9ebee] text-ink transition-colors hover:bg-[#dcdfe3]',
          focusRing,
        )}
      >
        <PencilIcon size={20} />
      </button>

      <input ref={inputRef} type="file" accept="image/*" tabIndex={-1} className="sr-only" onChange={handleFile} />

      {error && (
        <p id={`${id}-error`} className="mt-2 text-center text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default memo(PhotoPicker);
