import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

import { Component, ClassNameProps } from '../../types/component';
import { Column, Data } from './index';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
    fontSize: 14,
    minWidth: theme.spacing(0),
    flexBasis: theme.spacing(0),
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  },
  secondaryCell: {
    backgroundColor: theme.palette.surface[4],
  },
}));

type Props = ClassNameProps & {
  testId?: string,
  data: Data[],
  index: number,
  column: Column,
};

const Cell: Component<Props> = ({
  testId,
  column,
  data,
  index,
  className = null,
}) => {
  const classes = useStyles();

  const rowData = data[index];
  const cellData = column.accessor ? column.accessor(rowData, index, data) : rowData;
  const CellComponent = column.cellComponent;
  let cellClassName = clsx({
    [classes.root]: true,
    [classes.secondaryCell]: column.secondaryCellStyle,
  });
  if (className) {
    cellClassName = clsx({
      [classes.root]: true,
      [classes.secondaryCell]: column.secondaryCellStyle,
      [className]: className,
    });
  }
  const inlineStyle = {
    minWidth: column.minWidth,
    flexGrow: column.flexGrow,
    ...column.inlineStyle, // spreading inline causes error
  };

  if (CellComponent) {
    return (
      <div className={cellClassName} style={inlineStyle}>
        <CellComponent {...cellData} />
      </div>
    );
  }

  return (
    <div data-testid={testId} className={cellClassName} style={inlineStyle}>
      {cellData[column.id]}
    </div>
  );
};

export default Cell;
