import { makeStyles } from '@material-ui/core';
import HeaderBar from './HeaderBar';
import { Component, ChildrenProps } from '../types/component';
import ErrorBoundary from './ErrorBoundary';

const useStyles = makeStyles((theme) => ({
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    minHeight: theme.spacing(75),
  },
  content: {
    display: 'flex',
    overflow: 'hidden',
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

type Props = ChildrenProps & {
  title?: string;
  showHeader?: boolean;
};

const Page: Component<Props> = ({
  children,
  title,
  showHeader = true,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.page}>

      {showHeader && <HeaderBar dataTestId="page-title" title={title} />}

      <div className={classes.content}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>

    </div>
  );
};

export default Page;
