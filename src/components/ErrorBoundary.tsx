import { createStyles, Theme, withStyles } from '@material-ui/core';
import clsx from 'clsx';
import { Component } from 'react';
import { trackException } from '../data/analytics';

import { ChildrenProps, ClassNameProps } from '../types/component';
import ErrorBox from './ErrorBox';
import { Body } from './Typography';

const styles = (theme: Theme) => createStyles({
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(1.5),
  },
});

type State = { error?: Error };

type Props = ChildrenProps & ClassNameProps & { classes: Record<string, string> };

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    trackException({
      description: error.toString(),
    });
  }

  render() {
    const { error } = this.state;
    if (error) {
      const { message } = error;
      const { className, classes } = this.props;
      return (
        <div className={clsx(classes.container, className)}>
          <ErrorBox message="Unfortunately the application crashed." />
          <Body>
            {message}
          </Body>
        </div>
      );
    }

    const { children } = this.props;
    return children ?? null;
  }
}

export default withStyles(styles)(ErrorBoundary);
