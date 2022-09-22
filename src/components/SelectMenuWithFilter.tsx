import { MouseEvent, useState, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useTranslation } from 'react-i18next';

import PopperMenu from './PopperMenu';
import InputField from './InputField';
import { Body } from './Typography';

const useStyles = makeStyles((theme) => ({
  menu: {
    backgroundColor: theme.palette.surface[2],
    width: theme.spacing(36),
    marginTop: theme.spacing(0.75),
    padding: theme.spacing(1),
    boxShadow: '1px 2px 5px 0px #1119',
  },
  select: {
    position: 'relative',
    '& svg': {
      fontSize: theme.spacing(2),
      position: 'absolute',
      top: theme.spacing(1.25),
      right: theme.spacing(1.25),
    },
    '& input': {
      paddingRight: theme.spacing(4),
    },
  },
  menuItem: {
    padding: theme.spacing(0.687, 1.5),
    margin: theme.spacing(0, -1),
    '&:hover': {
      backgroundColor: theme.palette.surface[3],
      cursor: 'pointer',
    },
  },
  filter: {
    marginBottom: theme.spacing(1),
  },
  popper: {
    maxHeight: theme.spacing(25),
    overflowY: 'scroll',
  },
}));

type Props<T> = {
  value?: T,
  options: T[],
  onSelect: (value: T) => void,
  label?: (element: T) => string,
};

export default function SelectMenuWithFilter<T extends { id: string }>({
  options,
  value,
  onSelect,
  label,
}: Props<T>) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [filter, setFilter] = useState('');

  const items = useMemo(() => {
    const lowercaseFilter = filter.toLowerCase();
    return options.filter((option) => label?.(option)?.toLowerCase().includes(lowercaseFilter));
  }, [filter, options]);

  const handleOpenMenu = (event: MouseEvent) => {
    setAnchorEl(event.currentTarget as HTMLElement);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectItem = (item: T) => {
    onSelect(item);
    handleClose();
  };

  return (
    <div>
      <Box className={classes.select} onClick={handleOpenMenu}>
        <InputField
          value={(value && label?.(value)) || ''}
          readOnly
        />
        <ExpandMoreIcon />
      </Box>
      <PopperMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        className={classes.menu}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <div className={classes.popper}>
            <InputField
              className={classes.filter}
              placeholder={t('messages.searchUser')}
              value={filter}
              onChange={setFilter}
            />

            {items.map((item) => (
              <Box
                key={item.id}
                className={classes.menuItem}
                onClick={() => handleSelectItem(item)}
              >
                <Body>{label?.(item)}</Body>
              </Box>
            ))}
          </div>
        </ClickAwayListener>
      </PopperMenu>
    </div>
  );
}
