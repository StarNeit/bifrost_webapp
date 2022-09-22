import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { makeStyles, CircularProgress } from '@material-ui/core';
import { Component, ClassNameProps, ChildrenProps } from '../types/component';
import { Body } from './Typography';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    position: 'relative',
  },
  flexGrow: {
    flexGrow: 1,
  },
  fetchingMessage: {
    marginTop: theme.spacing(2),
  },
  '@keyframes fadein': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadein: {
    animationName: '$fadein',
    animationDuration: '300ms',
    animationIterationCount: 1,
    animationFillMode: 'both',
  },
  delayedFadein: {
    animationDelay: '500ms',
  },
  progressContainer: {
    position: 'relative',
  },
  label: {
    position: 'absolute',
    display: 'flex',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

type Props = ClassNameProps & ChildrenProps & {
  dataTestId?: string,
  spinnerSize?: number,
  fetching?: boolean,
  error?: ReactNode,
  info?: ReactNode,
  fetchingMessage?: string,
  delayed?: boolean,
  progress?: number,
  flexGrow?: boolean,
  showProgressLabel?: boolean
};

const LoadingContainer: Component<Props> = ({
  dataTestId,
  children,
  className,
  spinnerSize = 40,
  fetching,
  error,
  info,
  fetchingMessage,
  delayed,
  progress,
  flexGrow = true,
  showProgressLabel,
}) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const containerClassName = clsx(
    classes.container,
    {
      [classes.fadein]: fetching,
      [classes.delayedFadein]: fetching && delayed,
      [classes.flexGrow]: flexGrow,
    },
    className,
  );

  if (fetching) {
    return (
      <div className={containerClassName}>
        <div className={classes.progressContainer}>
          <CircularProgress
            data-testid={dataTestId}
            size={spinnerSize}
            variant={!progress ? 'indeterminate' : 'determinate'}
            value={progress}
          />
          {showProgressLabel && progress && (
            <div className={classes.label}>
              <Body>
                {progress}
                %
              </Body>
            </div>
          )}
        </div>
        {fetchingMessage && (
          <Body className={classes.fetchingMessage}>
            {fetchingMessage}
          </Body>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClassName}>
        <Body>
          {`${t('labels.error')}: `}
          {error}
        </Body>
      </div>
    );
  }

  if (info) {
    return (
      <div className={containerClassName}>
        <Body>{info}</Body>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingContainer;
