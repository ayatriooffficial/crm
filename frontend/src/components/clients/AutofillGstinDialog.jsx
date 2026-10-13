'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Field, { describedBy } from '@/components/ui/Field';
import { controlClass, focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import { toUpperAlnum } from './clientFormModel';

const INPUT_ID = 'autofill-gstin';
const HELPER = 'The client details will be autofilled.';

/**
 * "Enter GST Number" dialog. Hands the GSTIN to `onSubmit`, which resolves
 * `{ data } | { error }`. (Sample GSTINs for the mock lookup are in the README.)
 */
export default function AutofillGstinDialog({ onClose, onSubmit }) {
  const [gstin, setGstin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const result = await onSubmit(gstin);
    setLoading(false);
    if (result.error) setError(result.error);
    else onClose();
  };

  return (
    <Modal title="Enter GST Number" onClose={onClose} panelClassName="max-w-[39rem]">
      <form noValidate onSubmit={handleSubmit}>
        <div className="px-6 pb-14 pt-8">
          <Field id={INPUT_ID} label="GSTIN" error={error} helper={HELPER}>
            <input
              id={INPUT_ID}
              autoFocus
              value={gstin}
              onChange={(event) => {
                setGstin(toUpperAlnum(event.target.value));
                if (error) setError('');
              }}
              maxLength={15}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy(INPUT_ID, { error, helper: HELPER })}
              className={controlClass(error, 'h-12 px-4')}
            />
          </Field>
        </div>
        <div className="flex gap-2.5 border-t border-divider px-6 py-6">
          <Button type="submit" loading={loading}>
            Autofill
          </Button>
          <button
            type="button"
            onClick={onClose}
            className={cx('h-12 rounded-md bg-[#e9ebee] px-4 text-lg text-ink transition-colors hover:bg-[#dcdfe3]', focusRing)}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
