import { makeStyles } from '@material-ui/core';
import { ChildrenProps } from '@xrite/reporting-service-ui/types/component';
import { CellProps } from 'react-table';
import NumberCell from '../../pages/common/Table/NumberCell';
import StringCell from '../../pages/common/Table/StringCell';

import { Component } from '../../types/component';
import { OutputRecipeComponentWithEditing } from '../../types/recipe';

type Props = ChildrenProps & CellProps<OutputRecipeComponentWithEditing, number>;
const useStyles = makeStyles({
  hyphen: {
    justifyContent: 'flex-end',
  },
});

const PercentageChangeCell: Component<Props> = ({ value, cell }) => {
  const classes = useStyles();

  if (value > 2000) {
    return <StringCell className={classes.hyphen} dataTestId={cell.column.id} value="-" />;
  }

  return (
    <NumberCell value={value} dataTestId={cell.column.id} />
  );
};

export default PercentageChangeCell;
