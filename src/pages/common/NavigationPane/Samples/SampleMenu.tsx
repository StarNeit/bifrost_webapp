import {
  ChangeEvent,
  useRef,
  useState,
} from 'react';
import {
  IconButton,
  makeStyles,
  Menu,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { useTranslation } from 'react-i18next';

import clsx from 'clsx';
import { SortSampleMode, SortSampleType, SortSampleOrder } from '.';
import { Component } from '../../../../types/component';
import ConfirmationPopover from '../../../../components/ConfirmationPopover';
import NestedMenuItem from '../../../../components/NestedMenuItem';
import { Body } from '../../../../components/Typography';

const useStyles = makeStyles((theme) => ({
  button: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    borderRadius: theme.spacing(0.75),
    color: theme.palette.common.white,
    marginLeft: 'auto',
  },
  menu: {
    backgroundColor: theme.palette.surface[2],
  },
  subMenu: {
    backgroundColor: theme.palette.surface[2],
    padding: theme.spacing(1, 0),
    width: theme.spacing(25),
    borderRadius: theme.spacing(1),
  },
  menuItem: {
    width: '100%',
    margin: 0,
    '&:hover': {
      backgroundColor: theme.palette.action.active,
    },
  },
  subMenuItem: {
    paddingLeft: theme.spacing(1),
  },
  label: {
    paddingLeft: theme.spacing(1),
    color: theme.palette.text.disabled,
    letterSpacing: theme.spacing(0.15),
  },
  subLabel: {
    fontSize: theme.spacing(1.7),
  },
  subLabelButton: {
    paddingTop: theme.spacing(0.8),
    paddingBottom: theme.spacing(0.8),
  },
}));

const sortingOptions = ['default', 'alphabetically', 'chronologically'] as const;

type Props = {
  openNewSampleModal(): void,
  newDisabled: boolean,
  newOptionLabel: string,

  onSampleDelete(): void,
  deleteDisabled: boolean,

  onSort: (sortType: SortSampleType, order: SortSampleOrder) => void,
  sort: SortSampleMode,
  sortDisabled: boolean,

  onSampleEdit(): void,
  editDisabled: boolean,

  onExport(buttonMenuRef: HTMLElement): void,
  disableExport?: boolean,
};

const SampleMenu: Component<Props> = ({
  openNewSampleModal,
  onSampleDelete,
  onSort,
  sort,
  sortDisabled,
  onSampleEdit,
  newDisabled,
  onExport,
  disableExport,
  deleteDisabled,
  editDisabled,
  newOptionLabel,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);

  const [openConfirmationPopover, setOpenConfirmationPopover] = useState(false);

  const closeMenu = () => setMenuEl(null);

  const handleDelete = () => {
    setOpenConfirmationPopover(true);
    closeMenu();
  };

  const handleDecline = () => {
    setOpenConfirmationPopover(false);
  };

  const handleConfirm = () => {
    setOpenConfirmationPopover(false);

    onSampleDelete();
  };

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (menuEl) {
      return;
    }

    setMenuEl(event.currentTarget);
  };

  const handleSortChange = ({
    event,
    sortType,
  }: {
    event: ChangeEvent<HTMLInputElement>,
    sortType: SortSampleType
  }) => {
    closeMenu();

    if (!event.target.value
      || (
        event.target.value !== 'asc'
        && event.target.value !== 'desc'
        && event.target.value !== 'default'
      )) return;

    const sortOrder = event.target.value;
    onSort(sortType, sortOrder);
  };

  const open = Boolean(menuEl);

  return (
    <>
      <IconButton
        data-testid="sample-actions-options-button"
        ref={optionsButtonRef}
        onClick={handleOpen}
        color="inherit"
        className={classes.button}
      >
        <MoreHorizIcon />
      </IconButton>

      <Menu
        data-testid="sample-actions-options-container"
        disableAutoFocusItem
        disableAutoFocus
        open={open}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onClose={(e) => {
          (e as Event).stopPropagation();
          closeMenu();
        }}
        anchorEl={menuEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        classes={{
          list: classes.menu,
        }}
      >
        <MenuItem
          onClick={() => {
            closeMenu();
            openNewSampleModal();
          }}
          disabled={newDisabled}
        >
          {newOptionLabel}
        </MenuItem>

        <MenuItem
          data-testid="sample-actions-delete-item"
          onClick={handleDelete}
          disabled={deleteDisabled}
        >
          {t('labels.delete')}
        </MenuItem>

        <MenuItem
          onClick={() => {
            closeMenu();
            onSampleEdit();
          }}
          disabled={editDisabled}
        >
          {t('labels.edit')}
        </MenuItem>

        <NestedMenuItem
          label={t('labels.sort')}
          parentMenuOpen={open}
          wrapperClassName={classes.subMenu}
          disabled={sortDisabled}
        >
          {sortingOptions.map((sortType) => (
            <div key={sortType}>
              {/* labels */}
              {sortType !== 'default' && <Body className={classes.label}>{t(`labels.${sortType}`)}</Body>}

              {/* radio buttons */}
              <RadioGroup
                aria-label="sortSamples"
                name="sort-option"
                value={sort.type === sortType ? sort.order : ''}
                onChange={(event) => handleSortChange({
                  event,
                  sortType,
                })}
              >
                {sortType === 'default' ? (
                  <FormControlLabel
                    className={classes.menuItem}
                    value={sortType}
                    control={<Radio color="primary" />}
                    label={t(`labels.${sortType}`)}
                  />

                ) : ['asc', 'desc'].map((order) => (
                  <FormControlLabel
                    key={sortType + order}
                    className={clsx(classes.menuItem, classes.subMenuItem)}
                    classes={{
                      label: classes.subLabel,
                    }}
                    value={order}
                    control={(
                      <Radio
                        classes={{
                          root: classes.subLabelButton,
                        }}
                        size="small"
                        color="primary"
                      />
                      )}
                    label={t(`labels.${order}`)}
                  />
                ))}
              </RadioGroup>
            </div>
          ))}
        </NestedMenuItem>
        <MenuItem
          disabled={disableExport}
          onClick={() => {
            if (optionsButtonRef.current) {
              onExport(optionsButtonRef.current);
            }
            setMenuEl(null);
          }}
        >
          {t('labels.export')}
        </MenuItem>
        {/*
        <MenuItem disabled>{t('labels.report')}</MenuItem>
        */}
      </Menu>
      <ConfirmationPopover
        isDestructive
        onClose={handleDecline}
        message={t('labels.doYouWantToDelete')}
        open={openConfirmationPopover}
        anchorEl={optionsButtonRef.current}
        cancelText={t('labels.cancel')}
        confirmText={t('labels.delete')}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default SampleMenu;
