import { BasicMaterialType } from '@xrite/cloud-formulation-domain-model';
import { ChildrenProps } from '@xrite/reporting-service-ui/types/component';
import { Row } from 'react-table';

import NumberCell from '../../pages/common/Table/NumberCell';
import { Component } from '../../types/component';
import { SOLVENT_COMPONENT_ID } from '../../utils/utilsRecipe';
import { EditableCell } from './EditableCell';
import { TotalRowData } from './RecipeDisplayTable';

const componentIsEditable = (
  component: TotalRowData,
) => (component.sourceColorants?.length === 1
    && (component.id as string) !== SOLVENT_COMPONENT_ID)
    || (
      component.basicMaterialType === BasicMaterialType.Additive
      && component.allowEditingAdditives
    );

const getEditStatus = (component: TotalRowData, isAmountEditable?: boolean) => (
  (isAmountEditable && componentIsEditable(component) && 'editable')
    || (isAmountEditable && 'invalidEditable')
    || 'nonEditable'
);

type Props = ChildrenProps & {
  handleAmountChange?: (colorantId: string, layerIndex: number, newAmount: number) => void;
  row: Row<TotalRowData>;
  value: number | undefined;
};

const AmountCell: Component<Props> = (props) => {
  const {
    row: { original: component, id }, value, handleAmountChange,
  } = props;

  const isAmountEditable = Boolean(component.isAmountEditable);

  const editStatus = getEditStatus(component, isAmountEditable);

  if (editStatus === 'editable' || editStatus === 'invalidEditable') {
    return (
      <EditableCell
        testId={`cell-${id}`}
          // TODO: add layer index!
        handleChange={(newAmount) => handleAmountChange?.(component.id, 0, newAmount)}
        disabled={editStatus === 'invalidEditable'}
        value={value ?? ''}
      />
    );
  }

  return <NumberCell value={value} />;
};
export default AmountCell;
