import { makeStyles } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { useTranslation } from 'react-i18next';

import { Component } from '../../types/component';
import ButtonMenu from '../../components/ButtonMenu';

const useStyles = makeStyles((theme) => ({
  button: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    borderRadius: theme.spacing(0.75),
  },
}));

type Props = {
  dataTestId?: string,
  onClickColorSetup?: () => void,
  onClickSettings?: () => void,
  onClickEdit?: () => void,
  onClickReset?: () => void,
  onClickExport?: () => void,
  resetDisabled?: boolean,
};

const Actions: Component<Props> = ({
  dataTestId,
  onClickColorSetup,
  onClickSettings,
  onClickEdit,
  onClickReset,
  onClickExport,
  resetDisabled,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const hasAction = Boolean(
    onClickColorSetup
  || onClickSettings
  || onClickEdit
  || onClickReset
  || onClickExport,
  );
  return (
    <ButtonMenu
      dataTestIdButton={dataTestId}
      type="icon"
      className={classes.button}
      icon={<MoreHorizIcon />}
      disabled={!hasAction}
    >
      {onClickSettings ? <MenuItem onClick={onClickSettings}>{t('labels.settings')}</MenuItem> : null}
      {onClickExport ? <MenuItem onClick={onClickExport}>{t('labels.export')}</MenuItem> : null}
      {onClickEdit ? <MenuItem onClick={onClickEdit}>{t('labels.edit')}</MenuItem> : null}
      {onClickColorSetup ? <MenuItem onClick={onClickColorSetup}>{t('labels.setup')}</MenuItem> : null}
      {onClickReset ? <MenuItem onClick={onClickReset} disabled={resetDisabled}>{t('labels.reset')}</MenuItem> : null}
    </ButtonMenu>
  );
};

export default Actions;
