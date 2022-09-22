import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Slide from '@material-ui/core/Slide';

import { ChildrenProps, Component } from '../types/component';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(4),
    borderRadius: theme.spacing(1.5),
    maxWidth: 530,
    minHeight: 423,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    '&:focus': {
      outline: 'none',
    },
  },
}));

type Props = ChildrenProps & {
  isOpen: boolean;
};

const PopupModal: Component<Props> = ({
  children,
  isOpen,
}) => {
  const classes = useStyles();

  return (
    <Modal
      className={classes.modal}
      open={isOpen}
      closeAfterTransition
      BackdropComponent={Backdrop}
      onMouseDown={(e) => e.stopPropagation()}
      BackdropProps={{
        timeout: 700,
      }}
    >
      <Slide
        direction="up"
        in={isOpen}
        timeout={{ appear: 0, exit: 300 }}
      >
        <div className={classes.paper}>
          {children}
        </div>
      </Slide>
    </Modal>
  );
};

export default PopupModal;
