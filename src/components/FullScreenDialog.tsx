import { MouseEvent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Slide from '@material-ui/core/Slide';

import { ChildrenProps, Component } from '../types/component';
import { Title } from './Typography';
import Panel from './Panel';
import ExitButton from './ExitButton';
import { scrollbars } from '../theme/components';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(4),
    borderRadius: theme.spacing(1.5),
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    width: `calc(100% - ${theme.spacing(6)}px)`,
    height: `calc(100% - ${theme.spacing(6)}px)`,
    '&:focus': {
      outline: 'none',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
  },
  headerTitle: {
    textTransform: 'uppercase',
  },
  body: {
    padding: theme.spacing(4),
    background: theme.palette.surface[2],
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    ...scrollbars(theme),
  },
}));

type Props = ChildrenProps & {
  isOpen: boolean;
  headerTitle: string;
  handleClose(event: MouseEvent<HTMLButtonElement>): void,
  exitLabel?: string;
};

const FullScreenDialog: Component<Props> = ({
  children,
  isOpen,
  headerTitle,
  handleClose,
  exitLabel,
}) => {
  const classes = useStyles();

  return (
    <Modal
      data-testid="full-screen-modal"
      className={classes.modal}
      open={isOpen}
      closeAfterTransition
      onMouseDown={(e) => e.stopPropagation()}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 700,
      }}
    >
      <Slide
        direction="up"
        in={isOpen}
        timeout={{ appear: 0, exit: 300 }}
      >
        <div className={classes.wrapper}>
          <div className={classes.header}>
            <Title data-testid="slide-title" className={classes.headerTitle}>{headerTitle}</Title>
            <ExitButton data-testid="slide-exit-button" label={exitLabel} onClick={handleClose} />
          </div>
          <Panel className={classes.body}>
            {children}
          </Panel>
        </div>
      </Slide>
    </Modal>
  );
};

export default FullScreenDialog;
