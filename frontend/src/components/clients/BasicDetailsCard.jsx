'use client';

import { memo, useCallback, useState } from 'react';
import Card from '@/components/ui/Card';
import Field, { describedBy } from '@/components/ui/Field';
import TextField from '@/components/ui/TextField';
import Select from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import DateInput from '@/components/ui/DateInput';
import { CLIENT_TYPES } from '@/data/clientTypes';
import { CLIENT_GROUPS } from '@/data/groups';
import { byLabel } from '@/lib/options';
import { cx } from '@/lib/cx';
import PhotoPicker from './PhotoPicker';
import { fieldId, toUpperAlnum, useSectionSetter } from './clientFormModel';

const SECTION = 'basic';
const id = (field) => fieldId(SECTION, field);

// 12-column grid spans (Bootstrap-like, matching the screenshot's proportions).
const SPAN = {
  full: 'col-span-12',
  half: 'col-span-12 @md:col-span-6',
  wide: 'col-span-12 @md:col-span-8',
  narrow: 'col-span-12 @md:col-span-4',
};

function BasicDetailsCard({ values, errors, dispatch }) {
  const set = useSectionSetter(dispatch, SECTION);
  const [groups, setGroups] = useState(CLIENT_GROUPS);

  const createGroup = useCallback(
    (label) => {
      const option = { value: `group-${Date.now()}`, label };
      setGroups((current) => [...current, option].sort(byLabel));
      set(option.value, 'group');
    },
    [set],
  );

  return (
    <Card title="Basic Details">
      <div className="grid grid-cols-12 gap-x-7.5 gap-y-7.5">
        <div className={cx(SPAN.narrow, 'pt-2.5')}>
          <span id={`${id('photo')}-label`} className="text-base font-medium text-ink">
            Photo
          </span>
        </div>
        <div className={cx(SPAN.wide, '@md:pb-3')}>
          <PhotoPicker
            id={id('photo')}
            name="photo"
            value={values.photo}
            onChange={set}
            labelledBy={`${id('photo')}-label`}
          />
        </div>

        <div className={cx(SPAN.full, 'flex items-center gap-2.5')}>
          <label htmlFor={id('isActive')} className="text-base text-ink">
            Is Active?
          </label>
          <Toggle id={id('isActive')} name="isActive" checked={values.isActive} onChange={set} />
        </div>

        <TextField
          id={id('clientName')}
          name="clientName"
          label="Client Name"
          required
          value={values.clientName}
          onChange={set}
          error={errors.clientName}
          autoComplete="organization"
          className={SPAN.wide}
        />
        <Field id={id('dob')} label="Date of Birth" className={SPAN.narrow}>
          <DateInput id={id('dob')} name="dob" value={values.dob} onChange={set} />
        </Field>

        <Field id={id('type')} label="Type" required error={errors.type} className={SPAN.half}>
          <Select
            id={id('type')}
            name="type"
            options={CLIENT_TYPES}
            value={values.type}
            onChange={set}
            placeholder=""
            invalid={Boolean(errors.type)}
            aria-required
            aria-describedby={describedBy(id('type'), { error: errors.type })}
          />
        </Field>
        <Field id={id('group')} label="Select Group" className={SPAN.half}>
          <Select
            id={id('group')}
            name="group"
            options={groups}
            value={values.group}
            onChange={set}
            searchable
            separator
            onCreate={createGroup}
          />
        </Field>

        <TextField
          id={id('pan')}
          name="pan"
          label="PAN"
          value={values.pan}
          onChange={set}
          format={toUpperAlnum}
          maxLength={10}
          error={errors.pan}
          autoComplete="off"
          className={SPAN.half}
        />
      </div>
    </Card>
  );
}

export default memo(BasicDetailsCard);
