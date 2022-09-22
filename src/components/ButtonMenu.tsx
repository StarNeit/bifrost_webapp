import {
  useState,
  MouseEvent,
  ReactNode,
  ComponentProps,
  forwardRef,
} from 'react';
import {
  IconButton, Button, Menu, makeStyles,
} from '@material-ui/core';
import clsx from 'clsx';

import { Component, ClassNameProps, ChildrenProps } from '../types/component';

const useStyles = makeStyles((theme) => ({
  iconButton: {
    padding: theme.spacing(1),

    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:disabled': {
      color: theme.palette.text.disabled,
      cursor: 'not-allowed',
      pointerEvents: 'auto',
    },
  },
  button: {
    textTransform: 'unset',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),

    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:disabled': {
      color: theme.palette.text.disabled,
      cursor: 'not-allowed',
    },
  },
  menu: {
    backgroundColor: theme.palette.surface[2],
  },
}));

type IconProps = Omit<ComponentProps<typeof IconButton>, 'type'> & {
  type: 'icon';
}

type LabelProps = Omit<ComponentProps<typeof Button>, 'type'> & {
  type: 'label';
}

type TypeProps = IconProps | LabelProps;

type Props = ClassNameProps &
  ChildrenProps & TypeProps & {
    icon?: ReactNode;
    label?: string;
    dataTestIdButton?: string;
    dataTestIdMenu?: string;
  };

const ButtonMenu: Component<Props> = forwardRef(({
  icon,
  label,
  className,
  children,
  dataTestIdButton,
  dataTestIdMenu,
  type,
  ...buttonProps
}, ref) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const classes = useStyles();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {type === 'label' && (
        <Button
          data-testid={dataTestIdButton}
          className={clsx(classes.button, className)}
          onClick={handleClick}
          color="inherit"
          variant="text"
          {...buttonProps}
        >
          {label}
          {icon}
        </Button>
      )}
      {type === 'icon' && (
        <IconButton
          ref={ref}
          data-testid={dataTestIdButton}
          onClick={handleClick}
          className={clsx(classes.iconButton, className)}
          color="inherit"
          {...buttonProps as Omit<IconProps, 'type'>}
        >
          {icon}
        </IconButton>
      )}
      <Menu
        data-testid={dataTestIdMenu}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        classes={{ paper: classes.menu }}
        keepMounted
        onClose={handleClose}
        onClick={handleClose}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {children}
      </Menu>
    </>
  );
});

export default ButtonMenu;
