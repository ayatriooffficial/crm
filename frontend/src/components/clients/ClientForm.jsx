'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { PlusIcon } from '@/components/icons';
import { fetchGstinDetails } from '@/lib/gstin';
import BasicDetailsCard from './BasicDetailsCard';
import ContactDetailsCard from './ContactDetailsCard';
import CustomerFilesCard from './CustomerFilesCard';
import AutofillGstinDialog from './AutofillGstinDialog';
import { clientFormReducer, firstInvalidFieldId, initialClientState, validateClient } from './clientFormModel';

const SIMULATED_SAVE_MS = 600;

function focusField(fieldId) {
  requestAnimationFrame(() => {
    const element = document.getElementById(fieldId);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.focus({ preventScroll: true });
  });
}

/**
 * Owns the New Client form state. Each card receives only its slice plus
 * the stable `dispatch`, so cards re-render independently.
 */
export default function ClientForm({ breadcrumb }) {
  const [state, dispatch] = useReducer(clientFormReducer, initialClientState);
  const [toast, setToast] = useState(null);
  const [gstinDialogOpen, setGstinDialogOpen] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const notify = useCallback((message) => setToast({ id: Date.now(), message }), []);
  const dismissToast = useCallback(() => setToast(null), []);
  const openGstinDialog = useCallback(() => setGstinDialogOpen(true), []);
  const closeGstinDialog = useCallback(() => setGstinDialogOpen(false), []);

  const autofillFromGstin = useCallback(
    async (gstin) => {
      const result = await fetchGstinDetails(gstin);
      if (result.data) {
        dispatch({ type: 'autofill', data: result.data });
        notify(
          result.data.legalName
            ? `Details filled for ${result.data.legalName}.`
            : 'PAN and state filled from GSTIN.',
        );
      }
      return result;
    },
    [notify],
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (state.status === 'saving') return;

    const errors = validateClient(state);
    const invalidId = firstInvalidFieldId(errors);
    if (invalidId) {
      dispatch({ type: 'setErrors', errors });
      focusField(invalidId);
      return;
    }

    dispatch({ type: 'setErrors', errors });
    dispatch({ type: 'status', status: 'saving' });
    saveTimer.current = setTimeout(() => {
      dispatch({ type: 'status', status: 'saved' });
      notify(`Client "${state.basic.clientName.trim()}" saved.`);
    }, SIMULATED_SAVE_MS);
  };

  return (
    <>
      <form noValidate onSubmit={handleSubmit} aria-label="New client">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          {breadcrumb}
          <Button onClick={openGstinDialog} icon={<PlusIcon size={18} />} className="max-sm:w-full">
            Autofill Using GSTIN
          </Button>
        </div>

        <div className="grid grid-cols-1 items-start gap-7.5 xl:grid-cols-2">
          <BasicDetailsCard values={state.basic} errors={state.errors.basic} dispatch={dispatch} />
          <ContactDetailsCard values={state.contact} errors={state.errors.contact} dispatch={dispatch} />
          <CustomerFilesCard values={state.customerFiles} dispatch={dispatch} />
        </div>

        <div className="mt-7.5 flex items-center gap-4">
          <Button type="submit" loading={state.status === 'saving'}>
            {state.status === 'saving' ? 'Saving…' : 'Save'}
          </Button>
          {state.status === 'saved' && <span className="text-base text-emerald-700">All changes saved</span>}
        </div>
      </form>

      {gstinDialogOpen && <AutofillGstinDialog onClose={closeGstinDialog} onSubmit={autofillFromGstin} />}
      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
