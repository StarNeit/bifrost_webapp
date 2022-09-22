import { useMemo } from 'react';
import { motion, transform } from 'framer-motion';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

import { Component } from '../types/component';

type CollapseArrowProps = {
  isCollapsed: boolean;
};

const CollapseArrow: Component<CollapseArrowProps> = ({ isCollapsed }) => useMemo(() => {
  const Arrow = motion(KeyboardArrowDownIcon, { forwardMotionProps: true });

  const rotationDegrees = transform(Number(isCollapsed), [0, 1], [-90, 0]);

  return (
    <Arrow
      // Setting the rotate to -45 initially fixes the back animation
      initial={{ rotate: -45 }}
      animate={{ rotate: rotationDegrees }}
    />
  );
}, [isCollapsed]);

export default CollapseArrow;
