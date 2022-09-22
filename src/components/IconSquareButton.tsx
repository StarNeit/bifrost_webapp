import { ElementType } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import SvgIcon from '@material-ui/core/SvgIcon';

import { Component, ClassNameProps } from '../types/component';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.surface[2],
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(1),
  },
  icon: {
    fontSize: theme.spacing(2),
    color: theme.palette.text.primary,
  },
}));

type Props = ClassNameProps & {
  icon: ElementType,
  onClick?: () => void,
  disabled?: boolean,
};

const IconSquareButton: Component<Props> = ({
  icon,
  onClick,
  className,
  disabled,
}) => {
  const classes = useStyles();

  return (
    <IconButton
      className={clsx(classes.root, className)}
      onClick={onClick}
      disabled={disabled}
    >
      <SvgIcon
        className={classes.icon}
        component={icon}
      />
    </IconButton>
  );
};

export default IconSquareButton;
