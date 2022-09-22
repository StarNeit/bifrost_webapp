import { ElementType } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import SvgIcon from '@material-ui/core/SvgIcon';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { Body } from '../../../components/Typography';
import { Component } from '../../../types/component';
import { ConfigRoutePath } from '../../../types/configuration';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(0.25, 2),
    borderRadius: theme.spacing(1),
    margin: theme.spacing(0.875, 0),
    height: theme.spacing(5.125),
    '&:hover': {
      backgroundColor: '#1b1b1b',
      '& .MuiSvgIcon-root': {
        color: theme.palette.text.primary,
        display: 'block',
      },
    },
  },
  active: {
    backgroundColor: '#1b1b1b',
    '& .MuiSvgIcon-root, .MuiListItemText-root': {
      color: `${theme.palette.primary.main} !important`,
      display: 'block',
    },
  },
  activeIcon: {
    color: theme.palette.primary.main,
    fontSize: theme.spacing(2.25),
    marginRight: theme.spacing(-1.125),
    marginBottom: theme.spacing(0.25),
    display: 'none',
  },
  icon: {
    color: theme.palette.text.secondary,
    minWidth: theme.spacing(4.5),
    '& svg': {
      fontSize: theme.spacing(3.125),
    },
  },
  label: {
    color: theme.palette.text.secondary,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(0.125, 1),
    fontSize: theme.spacing(1.375),
    marginLeft: theme.spacing(1.5),
    marginBottom: theme.spacing(0.25),
  },
}));

type Props = {
  icon: ElementType,
  label: string,
  path: ConfigRoutePath,
};

const NavigationItem: Component<Props> = ({
  icon,
  label,
  path,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const location = useLocation();

  const handleClick = () => {
    dispatch(push(path));
  };

  return (
    <ListItem
      className={
        clsx(classes.root, {
          [classes.active]: location.pathname === path,
        })
      }
      button
      disableRipple
      onClick={handleClick}
    >
      <ListItemIcon className={classes.icon}>
        <SvgIcon component={icon} />
      </ListItemIcon>
      <ListItemText
        className={classes.label}
        primary={(
          <div className={classes.item}>
            <Body>
              {label}
            </Body>
          </div>
        )}
      />
      <ArrowForwardIcon className={classes.activeIcon} />
    </ListItem>
  );
};

export default NavigationItem;
