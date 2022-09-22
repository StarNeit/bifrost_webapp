import { makeStyles } from '@material-ui/core/styles';
import { CellProps, ColumnInstance } from 'react-table';
import { Body } from '../../components/Typography';
import { Component } from '../../types/component';
import { useDefaultPrecision } from '../../utils/utils';
import { FormulationResultsTableRowData } from '../utils';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    height: '100%',
  },
  cellValue: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
}));

type Props = {
  value: number,
  cell: CellProps<FormulationResultsTableRowData>;
  column: ColumnInstance<FormulationResultsTableRowData>;
};

const PriceCell: Component<Props> = ({ value, cell }) => {
  const classes = useStyles();
  const { round, toString } = useDefaultPrecision();

  return (
    <Body data-testid={cell.column.id} className={classes.root}>
      <span className={classes.cellValue}>
        {`${round(value, toString)} ${cell.row.original.currency}`}
      </span>
    </Body>
  );
};

export default PriceCell;
