import { makeStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import clsx from 'clsx';

import { Component } from '../../types/component';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: theme.spacing(1),
  },
  adornmentContainer: {
    right: theme.spacing(0),
  },
  arrow: {
    color: 'white',
    width: 'fit-content',
    padding: 0,
    height: theme.spacing(1.2),
    '&:hover': {
      background: 'unset',
      color: theme.palette.text.secondary,
    },
  },
  arrowIcon: {
    height: '100%',
    overflow: 'hidden',
  },
}));

interface NavigationArrowsProps {
  onArrowUp(): void;
  onArrowDown(): void;
  hasAdornment?: boolean;
  disableUpArrow?: boolean;
  disableDownArrow?: boolean;
}

const ArrowControls: Component<NavigationArrowsProps> = ({
  onArrowDown,
  onArrowUp,
  hasAdornment,
  disableDownArrow,
  disableUpArrow,
}) => {
  const classes = useStyles();

  return (
    <div className={clsx(classes.container, {
      [classes.adornmentContainer]: hasAdornment,
    })}
    >
      <IconButton
        aria-label="increment"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onArrowUp();
        }}
        className={classes.arrow}
        disabled={disableUpArrow}
      >
        <ArrowDropUp />
      </IconButton>
      <IconButton
        aria-label="decrement"
        onClick={onArrowDown}
        className={classes.arrow}
        disabled={disableDownArrow}
        classes={{
          label: classes.arrowIcon,
        }}
      >
        <ArrowDropDown />
      </IconButton>
    </div>
  );
};

export default ArrowControls;
