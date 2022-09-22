import { makeStyles } from '@material-ui/core';
import sumBy from 'lodash/sumBy';
import { ColumnInstance, Row } from 'react-table';

import { Body } from '../../components/Typography';
import { useDefaultPrecision } from '../../utils/utils';
import { TotalRowData } from './RecipeDisplayTable';

const useStyles = makeStyles({
  numericCell: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '100%',
  },
  numericValue: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
});

type Props = {
  rows: Row<TotalRowData>[];
  row: Row<TotalRowData>;
  column: ColumnInstance<TotalRowData>;
};

function CumulativeCell({ rows, row, column }: Props) {
  const classes = useStyles();
  const { round, toString } = useDefaultPrecision();

  const rowIndex = rows.findIndex(({ id }) => id === row.id);

  // rowIndex + 1 so it takes the row itself into the new calculation
  const rowsInRange = rows.slice(0, rowIndex === -1 ? 0 : rowIndex + 1);
  const components = rowsInRange.map(({ original }) => original);

  const getCumulativeValue = () => {
    const isOriginal = column.id.includes('original');
    if (isOriginal) {
      return sumBy(components, (component) => {
        if (column.id === 'originalCumulativePercentage') return component.originalPercentage ?? 0;
        return component.originalAmount ?? 0;
      });
    }
    return sumBy(components, (component) => {
      if (column.id === 'cumulativePercentage') return component.percentage ?? 0;
      return component.amount ?? 0;
    });
  };

  const value = getCumulativeValue();
  return (
    <Body className={classes.numericCell}>
      <span className={classes.numericValue}>{round(value, toString)}</span>
    </Body>
  );
}

export default CumulativeCell;
