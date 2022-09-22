import { AnimatePresence, motion, Variants } from 'framer-motion';
import { ChildrenProps, Component } from '../types/component';

type AnimatedDivProps = ChildrenProps & {
  show?: boolean;
};

const ToggleableSection: Component<AnimatedDivProps> = ({ children, show }) => {
  const showHideAnimation: Variants = {
    show: {
      opacity: 1,
      y: 0,
      height: 'auto',
      transition: {
        type: 'tween',
      },
    },
    hide: {
      opacity: 0,
      y: -10,
      height: 0,
      transition: {
        type: 'tween',
      },
    },
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={showHideAnimation}
          initial="hide"
          animate="show"
          exit="hide"
          transition={{ type: 'tween' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToggleableSection;
