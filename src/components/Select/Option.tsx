import { MenuItem } from '@material-ui/core';
import { components } from 'react-select';
import { Tiny } from '../Typography';

const Option: typeof components.Option = (props) => {
  const {
    innerProps: { onMouseMove, onMouseOver, ...newInnerProps },
    innerRef,
    children,
  } = props;

  return (
    <MenuItem
      buttonRef={innerRef}
      component={Tiny}
      {...newInnerProps}
    >
      {children}
    </MenuItem>
  );
};

export default Option;
