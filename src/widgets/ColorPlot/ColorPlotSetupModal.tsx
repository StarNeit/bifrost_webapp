import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@material-ui/core';

import PopupModal from '../../components/PopupModal';
import { Title, Body } from '../../components/Typography';
import { Component } from '../../types/component';
import Panel from '../../components/Panel';
import ExitButton from '../../components/ExitButton';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
  },
  paper: {
    flex: 1,
    background: theme.palette.surface[3],
    padding: theme.spacing(4),
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing(1),
    '&:not(:first-child)': {
      marginTop: theme.spacing(1),
    },
  },
  checkbox: {
    padding: 0,
  },
}));

type Props = {
  isOpenModal: boolean,
  closeModal(): void,
  coloredBackground: boolean;
  onColoredBackgroundChange: (coloredBackground: boolean) => void;
}

const ColorPlotSetupModal: Component<Props> = ({
  isOpenModal,
  closeModal,
  onColoredBackgroundChange,
  coloredBackground,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <PopupModal isOpen={isOpenModal}>
      <>
        <div className={classes.header}>
          <Title>{t('titles.ColorPlotSetup')}</Title>
          <ExitButton onClick={closeModal} />
        </div>

        <Panel className={classes.paper}>
          <div className={classes.row}>
            <Body>{t('labels.coloredBackground')}</Body>
            <Checkbox
              color="primary"
              className={classes.checkbox}
              checked={coloredBackground}
              onChange={(e) => {
                onColoredBackgroundChange(e.currentTarget.checked);
              }}
            />
          </div>
        </Panel>
      </>
    </PopupModal>
  );
};

export default ColorPlotSetupModal;
