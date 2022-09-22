import { ComponentProps } from 'react';
import { makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';

import Button from './Button';
import { Component } from '../types/component';
import { Subtitle } from './Typography';

type Props = ComponentProps<typeof Button> & {
  label?: string;
};

const useStyles = makeStyles((theme) => ({
  closeIcon: {
    marginRight: theme.spacing(0.5),
  },
}));

const ExitButton: Component<Props> = ({ onClick, label: propLabel, ...props }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  let label = propLabel;

  if (!label) {
    label = t('labels.exit');
  }

  return (
    <Button
      variant="ghost"
      startIcon={<CloseIcon className={classes.closeIcon} />}
      onClick={onClick}
      {...props}
    >
      <Subtitle>{label}</Subtitle>
    </Button>
  );
};

export default ExitButton;
