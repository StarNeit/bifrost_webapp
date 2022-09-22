import clsx from 'clsx';
import { ReactElement, useEffect, useRef } from 'react';
import { makeStyles, withStyles } from '@material-ui/core';
import MuiTreeItem from '@material-ui/lab/TreeItem';

import { ChildrenProps, Component } from '../../../types/component';
import { Body } from '../../../components/Typography';

const useStyles = makeStyles((theme) => ({
  '@global': {
    '.MuiTreeItem-root.Mui-selected > .MuiTreeItem-content .MuiTreeItem-label': {
      backgroundColor: theme.palette.surface[2],
    },
  },
  row: {
    flexGrow: 1,
    alignItems: 'center',
    borderRadius: theme.spacing(0.5),
    '&:hover': {
      cursor: 'pointer',
    },
  },
  label: {
    borderRadius: theme.spacing(0.38),
    transition: 'background 0.25s ease-out',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  selectedLabel: {
    backgroundColor: `${theme.palette.surface[3]} !important`,
  },
  labelRoot: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 0),
  },
  labelIcon: {
    marginRight: theme.spacing(1),
    height: theme.spacing(2.25),
    color: theme.palette.common.white,
    display: 'flex',
    alignItems: 'center',
  },
  labelText: {
    fontWeight: 'inherit',
  },
  selectedIcon: {
    color: theme.palette.primary.main,
  },
}));

type Props = ChildrenProps & {
  id: string;
  name: string;
  icon: ReactElement;
  dataTestId?: string;
  onClick?: (selectedSampleId: string) => void;
  selected?: boolean;
};

const TreeItem: Component<Props> = ({
  id,
  name,
  icon,
  dataTestId,
  children,
  selected,
  onClick,
}) => {
  const classes = useStyles();
  const treeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selected || !treeItemRef.current) return;

    treeItemRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [selected]);
  return (
    <MuiTreeItem
      key={id}
      nodeId={id}
      ref={treeItemRef}
      className={classes.row}
      classes={{
        label: clsx(classes.label, {
          [classes.selectedLabel]: selected,
        }),
      }}
      onLabelClick={(e) => {
        e.preventDefault();
        onClick?.(id);
      }}
      label={(
        <div className={classes.labelRoot}>
          <div
            className={clsx(classes.labelIcon, {
              [classes.selectedIcon]: selected,
            })}
          >
            {icon}
          </div>
          <Body data-testid={dataTestId} className={classes.labelText}>
            {name}
          </Body>
        </div>
      )}
    >
      {children}
    </MuiTreeItem>
  );
};

export default withStyles((theme) => ({
  root: {
    borderRadius: theme.spacing(1),
  },
  label: {
    borderRadius: theme.spacing(1),
  },
}))(TreeItem);
