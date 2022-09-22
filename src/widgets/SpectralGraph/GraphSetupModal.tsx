import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';
import { useTranslation } from 'react-i18next';

import PopupModal from '../../components/PopupModal';
import { Title, Body, Caption } from '../../components/Typography';
import ToggleButton from '../../components/ToggleButton';
import { Component } from '../../types/component';
import Panel from '../../components/Panel';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(3.25, 0),
  },
  close: {
    background: 'none',
    color: theme.palette.text.secondary,
    '& svg': {
      marginRight: theme.spacing(0.5),
    },
    '&:hover': {
      background: 'none',
    },
  },
  exit: {
    letterSpacing: theme.spacing(0.27),
  },
  paper: {
    flex: 1,
    background: theme.palette.surface[3],
    marginBottom: theme.spacing(3),
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing(1.5),
    '&:last-child': {
      marginTop: theme.spacing(2),
    },
  },
  form: {
    maxWidth: 200,
    marginRight: theme.spacing(1),
  },
  select: {
    width: 200,
  },
}));

type Props = {
  isOpenModal: boolean,
  scaleYaxis: boolean,
  showLegend: boolean,
  closeModal(): void,
  changeYaxis: (arg: boolean) => void,
  changeLegend: (arg: boolean) => void,
}

const GraphSetupModal: Component<Props> = ({
  isOpenModal,
  closeModal,
  scaleYaxis,
  showLegend,
  changeYaxis,
  changeLegend,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <PopupModal isOpen={isOpenModal}>
      <div className={classes.header}>
        <Title>{t('titles.SpectralGraphSetup')}</Title>
        <Button
          className={classes.close}
          size="small"
          startIcon={<CloseIcon />}
          onClick={closeModal}
        >
          <Caption className={classes.exit}>{t('labels.exit')}</Caption>
        </Button>
      </div>
      <Panel className={classes.paper}>
        <div className={classes.row}>
          <Body>{t('labels.showLegend')}</Body>
          <ToggleButton
            className={classes.form}
            isChecked={showLegend}
            size="small"
            unCheckedLabel={<CloseIcon />}
            checkedLabel={<CheckIcon />}
            onChange={() => changeLegend(!showLegend)}
          />
        </div>
        <div className={classes.row}>
          <Body>{t('labels.autoscaleYaxis')}</Body>
          <ToggleButton
            className={classes.form}
            isChecked={scaleYaxis}
            size="small"
            unCheckedLabel={<CloseIcon />}
            checkedLabel={<CheckIcon />}
            onChange={() => changeYaxis(!scaleYaxis)}
          />
        </div>
      </Panel>
    </PopupModal>
  );
};

export default GraphSetupModal;
