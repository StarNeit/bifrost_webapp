import { ComponentProps } from 'react';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';

import { Component, ChildrenProps, ClassNameProps } from '../types/component';

type Props = ClassNameProps & ChildrenProps & ComponentProps<typeof Popper>;

const PopperMenu: Component<Props> = ({
  anchorEl,
  open,
  children,
  className,
}) => {
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      transition
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper className={className}>
            {children}
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

export default PopperMenu;
