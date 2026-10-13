'use client';

import { memo } from 'react';
import Card from '@/components/ui/Card';
import Field from '@/components/ui/Field';
import TextField from '@/components/ui/TextField';
import Select from '@/components/ui/Select';
import { STATES } from '@/data/states';
import { fieldId, toDigits, useSectionSetter } from './clientFormModel';

const SECTION = 'contact';
const id = (field) => fieldId(SECTION, field);

const SPAN = {
  full: 'col-span-12',
  half: 'col-span-12 @md:col-span-6',
  third: 'col-span-12 @md:col-span-4',
};

function ContactDetailsCard({ values, errors, dispatch }) {
  const set = useSectionSetter(dispatch, SECTION);

  return (
    <Card title="Contact Details">
      <div className="grid grid-cols-12 gap-x-7.5 gap-y-7.5">
        <TextField
          id={id('mobile')}
          name="mobile"
          label="Mobile No."
          type="tel"
          inputMode="numeric"
          maxLength={10}
          format={toDigits}
          autoComplete="tel-national"
          value={values.mobile}
          onChange={set}
          error={errors.mobile}
          className={SPAN.half}
        />
        <TextField
          id={id('secondaryMobile')}
          name="secondaryMobile"
          label="Secondary Mobile No."
          type="tel"
          inputMode="numeric"
          maxLength={10}
          format={toDigits}
          value={values.secondaryMobile}
          onChange={set}
          error={errors.secondaryMobile}
          className={SPAN.half}
        />
        <TextField
          id={id('email')}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={set}
          error={errors.email}
          className={SPAN.full}
        />
        <TextField
          id={id('address')}
          name="address"
          label="Address"
          multiline
          autoComplete="street-address"
          value={values.address}
          onChange={set}
          className={SPAN.full}
        />
        <TextField
          id={id('city')}
          name="city"
          label="City"
          autoComplete="address-level2"
          value={values.city}
          onChange={set}
          className={SPAN.third}
        />
        <TextField
          id={id('pincode')}
          name="pincode"
          label="Pincode"
          inputMode="numeric"
          maxLength={6}
          format={toDigits}
          autoComplete="postal-code"
          value={values.pincode}
          onChange={set}
          error={errors.pincode}
          className={SPAN.third}
        />
        <Field id={id('state')} label="State" className={SPAN.third}>
          <Select id={id('state')} name="state" options={STATES} value={values.state} onChange={set} placeholder="" />
        </Field>
      </div>
    </Card>
  );
}

export default memo(ContactDetailsCard);
