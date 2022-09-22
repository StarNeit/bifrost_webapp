import {
  ComponentProps,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import ReactSelect, { createFilter, OptionTypeBase, StylesConfig } from 'react-select';
import { useTheme, makeStyles } from '@material-ui/core';
import { keyBy, mapValues } from 'lodash';
import { RGB } from '@xrite/colorimetry-js';

import { getCSSColorString } from '../utils/utils';

import {
  Component,
  ClassNameProps,
} from '../types/component';
import ColorSquare from './ColorSquare';
import { storeTestData } from '../utils/test-utils';
import Select from './Select';
import { FormulationComponent } from '../types/formulation';

const useStyles = makeStyles(() => ({
  colorSquare: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
}));

type Props = ClassNameProps & ComponentProps<typeof ReactSelect> & {
  components?: FormulationComponent[];
  selectedIds: string[];
  onSelectComponents(ids: string[]): void;
  disabled?: boolean;
};

const colorantFilterFunc = createFilter({
  ignoreCase: true,
  ignoreAccents: false,
  trim: true,
  matchFrom: 'any',
  stringify: ({ label }) => label,
});

const SelectFormulationComponents: Component<Props> = ({
  className,
  components = [],
  onSelectComponents,
  selectedIds,
  disabled,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  const forceUpdate: () => void = useState<Record<string, never>>()[1].bind(null, {});

  // re-renders Select component so the position of the menu
  // is always beneath the select input when adding/removing values
  useEffect(() => {
    forceUpdate();
  }, [selectedIds]);

  const rgbById = useMemo(
    () => {
      const componentsById = keyBy(components, 'id');
      return mapValues(componentsById, ({ previewColor }) => previewColor);
    },
    [components],
  );

  const componentOptions = useMemo(() => components.map((component) => ({
    value: component.id,
    label: component.name,
  })), [components]);

  const selectedOptions = useMemo(
    () => componentOptions.filter(({ value }) => selectedIds.includes(value)),
    [componentOptions, selectedIds],
  );

  storeTestData('selectedComponents', selectedOptions);

  const handleChange = (options: OptionTypeBase | null) => {
    const ids = options?.map((option: { value: string, label: string }) => option.value) ?? [];
    storeTestData('selectedComponents', ids);
    onSelectComponents(ids);
  };

  const getCSSColor = (id: string) => {
    const rgb = rgbById[id];
    return getCSSColorString(rgb ?? [0, 0, 0]);
  };

  const selectStyle: StylesConfig<OptionTypeBase, boolean> = {
    multiValueLabel: (provided, { data }) => ({
      ...provided,
      backgroundColor: getCSSColor(data.value.value),
      color: theme.palette.getContrastText(getCSSColor(data.value.value)),
      borderRadius: 0,
      display: 'flex',
    }),
    multiValueRemove: (provided, { data }) => ({
      ...provided,
      backgroundColor: getCSSColor(data.value.value),
      color: theme.palette.getContrastText(getCSSColor(data.value.value)),
      borderRadius: 0,
      ':hover': {
        backgroundColor: emphasize(getCSSColor(data.value.value), 0.5),
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      display: 'flex',
    }),
  };

  const convertRGB = (rgb: RGB) => ({
    rgb: {
      r: rgb[0],
      g: rgb[1],
      b: rgb[2],
    },
  });

  return (
    <Select
      id="colorant-select"
      instanceId="colorant-select"
      className={className}
      isSearchable
      isFullWidth
      isMulti
      closeMenuOnSelect={selectedIds?.length === components?.length - 1}
      data={componentOptions}
      value={selectedOptions}
      idProp="value"
      labelProp="label"
      onChange={handleChange}
      isDisabled={disabled}
      displayMultiOneLine
      formatOptionLabel={(option, { context }) => (
        <div className={classes.colorSquare}>
          {context !== 'value' && (
            <ColorSquare
              small
              colors={[convertRGB(rgbById[option.value.value])]}
              style={{ marginRight: theme.spacing(1) }}
            />
          )}
          {option.label}
        </div>
      )}
      filterOption={colorantFilterFunc}
      selectStyles={selectStyle}
    />
  );
};

export default SelectFormulationComponents;
