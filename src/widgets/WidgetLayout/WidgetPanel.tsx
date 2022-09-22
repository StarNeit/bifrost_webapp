import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { ReactNode } from 'react';
import { scrollbars } from '../../theme/components';
import { Component } from '../../types/component';
import { WIDGET_NON_DRAGGABLE_CLASS } from '../../utils/constants';
import Panel from '../../components/Panel';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flexGrow: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
  },
  content: {
    flexGrow: 1,
    overflow: 'auto',
    borderRadius: theme.spacing(1.5),
    backgroundColor: theme.palette.surface[2],
    ...scrollbars(theme),
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(1.5),
  },
  footerRight: {
    marginLeft: theme.spacing(2),
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
  },
}));

type Props = {
  className?: string;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  children: ReactNode;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
  dataTestId?: string;
}

const WidgetPanel: Component<Props> = ({
  className,
  headerLeft,
  headerRight,
  children,
  footerLeft,
  footerRight,
  dataTestId,
}) => {
  const classes = useStyles();
  const controlsClassName = clsx(classes.controls, WIDGET_NON_DRAGGABLE_CLASS);

  return (
    <Panel data-testid={dataTestId} className={clsx(classes.root, className)}>
      {(headerLeft || headerRight) && (
        <div className={classes.header}>
          <div className={controlsClassName}>{headerLeft}</div>
          <div className={controlsClassName}>{headerRight}</div>
        </div>
      )}

      <div className={clsx(classes.content, WIDGET_NON_DRAGGABLE_CLASS)}>
        {children}
      </div>

      {(footerLeft || footerRight) && (
        <div className={classes.footer}>
          <div className={controlsClassName}>{footerLeft}</div>
          <div className={clsx(controlsClassName, classes.footerRight)}>{footerRight}</div>
        </div>
      )}
    </Panel>
  );
};

export default WidgetPanel;
