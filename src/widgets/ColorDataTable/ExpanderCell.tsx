import { Row } from 'react-table';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { IconButton, makeStyles } from '@material-ui/core';

import StandardIcon from '../../assets/StandardIcon';
import TrialIcon from '../../assets/TrialIcon';
import { Component } from '../../types/component';

const useStyles = makeStyles((theme) => ({
  tableCell: {
    display: 'flex',
    alignItems: 'center',
    columnGap: theme.spacing(0.75),
    flex: 1,
    backgroundColor: theme.palette.surface[2],
    height: '100%',
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    columnGap: theme.spacing(0.75),
    borderBottom: 'none',
    padding: theme.spacing(0.5, 0.75),
  },
  iconButton: {
    backgroundColor: theme.palette.surface[4],
    color: theme.palette.text.secondary,
    height: theme.spacing(2),
    width: theme.spacing(2),
    borderRadius: theme.spacing(0.5),
    position: 'sticky',
    left: theme.spacing(1),
  },
  icon: {
    height: theme.spacing(2),
  },
  cellValue: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  rowIcon: {
    width: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
}));

type Props = { row: Row<{ label: string, name: string }> }

const ExpanderRow: Component<Props> = ({ row }) => {
  const classes = useStyles();

  const arrowIcon = row.isExpanded
    ? <KeyboardArrowRightIcon className={classes.icon} />
    : <KeyboardArrowDownIcon className={classes.icon} />;
  const rowIcon = row.index === 0 ? <StandardIcon /> : <TrialIcon />;

  return (row.canExpand ? (
    <div
      className={classes.cell}
      style={{
        paddingLeft: `${row.depth * 0.75}rem`,
      }}
    >
      <IconButton
        className={classes.iconButton}
        size="small"
        {...row.getToggleRowExpandedProps()}
      >
        {arrowIcon}
      </IconButton>
      {row.original.label}
    </div>
  ) : (
    <div
      className={classes.tableCell}
      style={{
        paddingLeft: `${row.depth * 0.75}rem`,
      }}
    >
      <div className={classes.rowIcon}>
        {rowIcon}
      </div>
      <span className={classes.cellValue}>
        {row.original.name}
      </span>
    </div>
  ));
};

export default ExpanderRow;
