'use client';

import { memo } from 'react';
import Field from '@/components/ui/Field';
import TextField from '@/components/ui/TextField';
import Select from '@/components/ui/Select';
import { STATES } from '@/data/states';
import { fieldId, toDigits, useSectionSetter } from './clientFormModel';

const SECTION = 'contact';
const id = (field) => fieldId(SECTION, field);

/** Contact fields of the Client Info section; rendered inside ClientForm's grid. */
function ContactDetailsFields({ values, errors, dispatch }) {
  const set = useSectionSetter(dispatch, SECTION);

  return (
    <>
      <TextField
        inline
        id={id('mobile')}
        name="mobile"
        label="Mobile No."
        placeholder="Mobile No."
        type="tel"
        inputMode="numeric"
        maxLength={10}
        format={toDigits}
        autoComplete="tel-national"
        value={values.mobile}
        onChange={set}
        error={errors.mobile}
      />
      <TextField
        inline
        id={id('secondaryMobile')}
        name="secondaryMobile"
        label="Secondary Mobile No."
        placeholder="Secondary Mobile No."
        type="tel"
        inputMode="numeric"
        maxLength={10}
        format={toDigits}
        value={values.secondaryMobile}
        onChange={set}
        error={errors.secondaryMobile}
      />
      <TextField
        inline
        id={id('email')}
        name="email"
        label="Email"
        placeholder="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={set}
        error={errors.email}
      />
      <TextField
        inline
        id={id('address')}
        name="address"
        label="Address"
        placeholder="Address"
        multiline
        autoComplete="street-address"
        value={values.address}
        onChange={set}
      />
      <TextField
        inline
        id={id('city')}
        name="city"
        label="City"
        placeholder="City"
        autoComplete="address-level2"
        value={values.city}
        onChange={set}
      />
      <TextField
        inline
        id={id('pincode')}
        name="pincode"
        label="Pincode"
        placeholder="Pincode"
        inputMode="numeric"
        maxLength={6}
        format={toDigits}
        autoComplete="postal-code"
        value={values.pincode}
        onChange={set}
        error={errors.pincode}
      />
      <Field id={id('state')} label="State" inline>
        <Select id={id('state')} name="state" options={STATES} value={values.state} onChange={set} placeholder="Select..." />
      </Field>
    </>
  );
}

export default memo(ContactDetailsFields);
