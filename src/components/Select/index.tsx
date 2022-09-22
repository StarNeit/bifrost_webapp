/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentProps, useMemo } from 'react';
import ReactSelect, {
  createFilter,
  OptionTypeBase,
  StylesConfig,
} from 'react-select';
import { useTheme } from '@material-ui/core';

import MenuList from './MenuList';
import OptionComponent from './Option';
import SelectContainer from './SelectContainer';
import IndicatorsContainer from './IndicatorsContainer';
import { ROOT_ELEMENT_ID } from '../../config';
import { scrollbarsLight } from '../../theme/components';
import { storeTestData } from '../../utils/test-utils';
import { ExtractKeys } from '../../types/utils';

type Option<T> = {
  label: string;
  value: T;
};

type ReactSelectProps = ComponentProps<typeof ReactSelect>;

type BaseProps<T extends {}> =
  Omit<ReactSelectProps, 'onChange' | 'options' | 'isMulti' | 'value'> &
  Pick<ReactSelectProps, 'formatOptionLabel'> & { // we have to pick this manually because it doesn't recognize it
    data: T[] | undefined;
    labelProp?: ExtractKeys<T, string> | ((element: T) => string);
    idProp?: ExtractKeys<T, any> | ((element: T) => any);
    enableVirtualization?: boolean;
    dataTestId?: string;
  };

type MultiProps<T> = {
  isMulti: true;
  onChange: (value: T[]) => void;
  value?: T[] | null;
};

type SingleProps<T> = {
  isMulti: false;
  onChange: (value: T) => void;
  value?: T | null;
};

type SelectionProps<T> = SingleProps<T> | MultiProps<T>;

type Props<T extends {}> = BaseProps<T> & SelectionProps<T>;

const defaultFilterOption = createFilter({
  ignoreCase: true,
  ignoreAccents: false,
  trim: true,
  matchFrom: 'any',
  stringify: (option) => option.label,
});

const components = {
  MenuList,
  Option: OptionComponent,
  SelectContainer,
  IndicatorsContainer,
  IndicatorSeparator: null,
};

function Select<T extends {}>({
  label,
  disabled,
  onChange,
  data,
  labelProp,
  idProp,
  value,
  isMulti,
  isFullWidth = false,
  selectStyles: selectStylesOverrides,
  filterOption = defaultFilterOption,
  multiValueContainer,
  dataTestId,
  ...partialProps
}: Props<T>) {
  const theme = useTheme();

  const selectStyle: StylesConfig<OptionTypeBase, boolean> = {
    input: (provided) => ({
      ...provided,
      color: theme.palette.text.primary,
      '& input': {
        font: 'inherit',
      },
    }),
    control: (provided, state) => ({
      ...provided,
      borderStyle: 'none',
      boxShadow: 'none',
      background: theme.palette.action.active,
      borderRadius: theme.spacing(0.75),
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      minHeight: state.selectProps.isSmall ? theme.spacing(4) : null,
      overflowY: 'auto',
      maxHeight: theme.spacing(40),
      ...theme.typography.body1,

      '&:hover': {
        background: state.isDisabled ? null : theme.palette.action.hover,
      },
    }),
    clearIndicator: (provided, { isDisabled }) => ({
      ...provided,
      cursor: 'pointer',
      color: isDisabled ? theme.palette.text.disabled : null,

      '&:hover': {
        color: isDisabled ? theme.palette.text.disabled : null,
      },
    }),
    dropdownIndicator: (provided, { isDisabled }) => ({
      ...provided,
      padding: theme.spacing(0.75),
      color: isDisabled ? theme.palette.text.disabled : null,

      '&:hover': {
        color: isDisabled ? theme.palette.text.disabled : null,
      },
    }),
    menuList: (provided) => ({
      ...provided,
      background: theme.palette.surface[2],
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      borderRadius: theme.spacing(0.75),
      overflowX: 'hidden',

      '& > *': {
        whiteSpace: 'unset',
        width: '100%',
      },
      ...scrollbarsLight(theme),
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 10,
      background: 'transparent',
      width: 'max-content',
      minWidth: theme.spacing(23),
      maxWidth: theme.spacing(60),
    }),
    singleValue: (provided) => ({
      ...provided,
      width: '100%',
      color: theme.palette.text.secondary,
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      backgroundColor: theme.palette.surface[4],
      borderRadius: 0,
      color: theme.palette.text.primary,
      ':hover': {
        backgroundColor: theme.palette.surface[2],
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'transparent',
      borderRadius: '9999px',
      overflow: 'hidden',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      backgroundColor: theme.palette.surface[4],
      borderRadius: 0,
      width: '100%',
      color: theme.palette.text.primary,
    }),
    container: (provided, { isDisabled }) => ({
      ...provided,
      width: !isFullWidth ? theme.spacing(23) : '100%',
      minWidth: theme.spacing(20),
      pointerEvents: isDisabled ? 'auto' : null,
    }),

    option: (provided, { isDisabled, isSelected }) => ({
      ...provided,
      // eslint-disable-next-line no-nested-ternary
      backgroundColor: isDisabled
        ? null
        : isSelected
          ? theme.palette.divider
          : null,
      color: theme.palette.text.primary,
    }),

    ...selectStylesOverrides,

    valueContainer: (provided) => ({
      ...provided,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      display: 'flex',
      overflowY: 'auto',
      maxHeight: theme.spacing(40),
      alignSelf: 'stretch',
      ...scrollbarsLight(theme),
    }),
  };

  const options = useMemo(() => data?.map<Option<T>>((option) => {
    const result: Option<T> = {
      value: option,
      label: option?.toString() ?? 'Unreadable Item',
    };

    if (!labelProp) return result;

    if (typeof labelProp === 'function') {
      result.label = labelProp(option);
    } else if (typeof labelProp === 'string') {
      result.label = option[labelProp] as any;
    }

    return result;
  }), [data]);

  let selected: Option<T>[] | Option<T> | undefined | null;
  const compareItems = ((val1: T, val2: T) => {
    if (idProp) {
      // don't compare null values
      if (!val1 || !val2) return false;

      if (typeof idProp === 'function') {
        return idProp(val1) === idProp(val2);
      }

      return val1[idProp] === val2[idProp];
    }
    return val1 === val2;
  });

  if (isMulti) {
    selected = value && options?.filter((o) => (value as T[]).find(
      (v) => compareItems(v, o.value),
    ));
  } else {
    selected = value && options?.find((o) => compareItems(value as T, o.value));
  }

  const handleOnChange = (choice: any) => {
    const selectedValue = isMulti ? choice.map((c: any) => c.value) : choice.value;

    if (dataTestId) {
      storeTestData(dataTestId, selectedValue);
    }

    onChange(selectedValue);
  };

  if (dataTestId) {
    storeTestData(dataTestId, selected);
  }

  return (
    <ReactSelect
      dataTestId={dataTestId}
      isMulti={isMulti}
      styles={selectStyle}
      closeMenuOnSelect={!isMulti}
      components={components}
      filterOption={filterOption}
      label={label}
      value={selected ?? null}
      menuPortalTarget={document.getElementById(ROOT_ELEMENT_ID)}
      onChange={handleOnChange}
      options={options}
      isDisabled={disabled}
      menuPlacement="auto"
      {...partialProps}
    />
  );
}

export default Select;
