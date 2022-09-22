import {
  ReactNode,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';
import {
  makeStyles,
} from '@material-ui/core/styles';

import { Fade, Button } from '@material-ui/core';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

import Panel from './Panel';
import { Subtitle } from './Typography';
import {
  ChildrenProps, Component, ClassNameProps,
} from '../types/component';
import RefreshIcon from './RefreshIcon';
import { makeShortName } from '../../cypress/support/util/selectors';

const paperWidth = {
  small: 320,
  medium: 420,
};

interface StyleProps {
  size: 'small' | 'medium',
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  title: {
    color: theme.palette.text.secondary,
    lineHeight: `${theme.spacing(2.75)}px`,
    whiteSpace: 'nowrap',
  },
  paper: {
    height: '100%',
    position: 'relative',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.standard,
    }),
  },
  expanded: {
    width: (props: StyleProps) => paperWidth[props.size],
  },
  collapsed: {
    width: theme.spacing(5.75),
  },
  folded: {
    width: (props: StyleProps) => (paperWidth[props.size] * 0.359),
  },
  header: {
    width: theme.spacing(38),
    height: theme.spacing(2.75),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    position: 'absolute',
    '& svg': {
      marginLeft: theme.spacing(1),
      color: theme.palette.text.secondary,
    },
    transformOrigin: 'right top',
    background: 'transparent',
    padding: 0,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: theme.spacing(5),
  },
  titleOpen: {
    transform: 'rotate(0deg)',
    left: theme.spacing(1.5),
  },
  titleClose: {
    transform: 'rotate(-90deg)',
    left: theme.spacing(-36.63),
    justifyContent: 'flex-end',
  },
  body: {
    paddingTop: theme.spacing(4.5),
    height: '100%',
  },
  fold: {
    background: theme.palette.surface[4],
    color: theme.palette.text.primary,
    borderRadius: '50%',
    width: theme.spacing(3),
    minWidth: theme.spacing(3),
    height: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: theme.spacing(4),
    right: -theme.spacing(1.5),
    transition: theme.transitions.create(['transform', 'opacity'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.standard,
    }),
    padding: 0,
    opacity: 0,
    '&:hover': {
      background: theme.palette.surface[4],
      color: theme.palette.text.primary,
      opacity: 1,
      cursor: 'pointer',
    },
  },
  iconFolded: {
    background: theme.palette.surface[4],
    color: theme.palette.text.primary,
    transform: 'rotate(180deg)',
    opacity: 1,
  },
}));

type Props = ChildrenProps & ClassNameProps & {
  dataTestId?: string,
  header: string,
  isFolded?: boolean,
  onChangeFold?: () => void,
  size?: 'small' | 'medium',
  isLoading?: boolean,
  onChangeOpen?: (arg: boolean) => void,
  headerIcon?: ReactNode,
  onExpandedClasses?: {
    [x in keyof ReturnType<typeof useStyles>]?: string;
  }
};

const AnimationContainer: Component<Props> = ({
  dataTestId,
  children,
  className,
  header,
  size = 'small',
  isFolded,
  onChangeFold,
  onChangeOpen,
  isLoading = false,
  headerIcon,
  onExpandedClasses,
}) => {
  const classes = useStyles({ size });
  const [open, setOpen] = useState<boolean>(true);

  const handleExpand = () => {
    if (isFolded) return;
    if (onChangeOpen) onChangeOpen(!open);
    setOpen(!open);
  };

  const handleFold = () => {
    if (size === 'medium' && open && onChangeFold) onChangeFold();
  };

  const icon = useMemo(
    (): ReactNode => {
      if (isFolded) return <KeyboardArrowDownIcon fontSize="small" />;
      if (open) return <MenuOpenIcon fontSize="small" />;
      return <ArrowDownwardIcon fontSize="small" />;
    },
    [isFolded, open],
  );

  return (
    <Panel
      className={clsx(classes.paper, className, {
        [classes.expanded]: open,
        [onExpandedClasses?.expanded || '']: open,
        [classes.collapsed]: !open,
        [classes.folded]: isFolded,
      })}
    >
      {open && size === 'medium' && (
        <Button
          data-testid={`${makeShortName(dataTestId)}-show-container-content-button`}
          className={clsx(classes.fold, {
            [classes.iconFolded]: isFolded,
            [onExpandedClasses?.iconFolded || '']: open,
          })}
          onClick={handleFold}
        >
          <KeyboardArrowLeftIcon fontSize="small" />
        </Button>
      )}

      <Button
        data-testid={`${makeShortName(dataTestId)}-hide-container-content-button`}
        disableRipple
        className={clsx(classes.header, {
          [classes.titleOpen]: open,
          [classes.titleClose]: !open,
          [onExpandedClasses?.titleOpen || '']: open,
        })}
        onClick={handleExpand}
      >
        <div className={classes.headerTitle}>
          {isFolded ? (
            <Subtitle className={classes.title}>
              {header.split(' ').pop()}
            </Subtitle>
          ) : (
            <Subtitle data-testid={`${dataTestId}-ac-title`} className={classes.title}>{header}</Subtitle>
          )}
          {!open && headerIcon
            ? (
              <div className={classes.headerIcon}>
                {headerIcon}
              </div>
            )
            : null}
          {icon}
        </div>
      </Button>

      <Fade in={open} timeout={{ enter: 900, exit: 200 }}>
        <div className={clsx(classes.body, {
          [onExpandedClasses?.body || '']: open,
        })}
        >
          <RefreshIcon fetching={isLoading} />
          {children}
        </div>
      </Fade>
    </Panel>
  );
};

export default AnimationContainer;
