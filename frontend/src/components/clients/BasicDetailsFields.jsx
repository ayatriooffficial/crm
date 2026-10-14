'use client';

import { memo, useCallback, useState } from 'react';
import Field, { describedBy } from '@/components/ui/Field';
import TextField from '@/components/ui/TextField';
import Select from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import DateInput from '@/components/ui/DateInput';
import { CLIENT_TYPES } from '@/data/clientTypes';
import { CLIENT_GROUPS } from '@/data/groups';
import { byLabel } from '@/lib/options';
import PhotoPicker from './PhotoPicker';
import { fieldId, toUpperAlnum, useSectionSetter } from './clientFormModel';

const SECTION = 'basic';
const id = (field) => fieldId(SECTION, field);

/** Basic fields of the Client Info section; rendered inside ClientForm's grid. */
function BasicDetailsFields({ values, errors, dispatch }) {
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
    <>
      <Field id={id('photo')} label="Photo" labelAs="span" inline>
        <div className="w-20">
          <PhotoPicker
            id={id('photo')}
            name="photo"
            value={values.photo}
            onChange={set}
            labelledBy={`${id('photo')}-label`}
          />
        </div>
      </Field>
      <Field id={id('isActive')} label="Is Active?" inline>
        <div className="flex h-12 items-center">
          <Toggle id={id('isActive')} name="isActive" checked={values.isActive} onChange={set} />
        </div>
      </Field>

      <TextField
        id={id('clientName')}
        name="clientName"
        label="Client Name"
        placeholder="Client Name"
        required
        inline
        value={values.clientName}
        onChange={set}
        error={errors.clientName}
        autoComplete="organization"
      />
      <Field id={id('dob')} label="Date of Birth" inline>
        <DateInput id={id('dob')} name="dob" value={values.dob} onChange={set} />
      </Field>

      <Field id={id('type')} label="Type" required inline error={errors.type}>
        <Select
          id={id('type')}
          name="type"
          options={CLIENT_TYPES}
          value={values.type}
          onChange={set}
          placeholder="Select..."
          invalid={Boolean(errors.type)}
          aria-required
          aria-describedby={describedBy(id('type'), { error: errors.type })}
        />
      </Field>
      <Field id={id('group')} label="Select Group" inline>
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
        inline
        value={values.pan}
        onChange={set}
        format={toUpperAlnum}
        maxLength={10}
        error={errors.pan}
        autoComplete="off"
        placeholder="PAN"
      />
      <TextField
        id={id('referredBy')}
        name="referredBy"
        label="Referred By"
        inline
        value={values.referredBy}
        onChange={set}
        autoComplete="off"
        placeholder="Referred By"
      />
    </>
  );
}

export default memo(BasicDetailsFields);
