import { components } from 'react-select';

const MultiValueContainer: typeof components.MultiValueContainer = ({ selectProps, data }) => {
  const { label } = data;
  const allSelected = selectProps.value;
  const index = allSelected.findIndex((selected: {label: string}) => selected.label === label);
  const isLastSelected = index === allSelected.length - 1;
  const labelSuffix = isLastSelected ? '' : ', ';
  const val = `${label}${labelSuffix}`;

  return (
    <>
      {val}
    </>
  );
};

export default MultiValueContainer;
