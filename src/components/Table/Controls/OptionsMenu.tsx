import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  makeStyles,
  Menu,
  PopoverPosition,
} from '@material-ui/core';
import InputField from '../../InputField';
import AvailableColumnsMenu from './AvailableColumnsMenu';
import { makeShortName } from '../../../../cypress/support/util/selectors';
import { Component } from '../../../types/component';

const useStyles = makeStyles((theme) => ({
  menu: {
    background: theme.palette.surface[1],
    minWidth: theme.spacing(21.45),
  },
  searchInputWrapper: {
    padding: theme.spacing(1),
  },
  searchInput: {
    minWidth: theme.spacing(30),
  },
}));

export type TableHeaderOption = {
  id: string;
  label: string;
  disableToggleHide: boolean;
};

type Props = {
  dataTestId?: string;
  menuPosition?: PopoverPosition;
  availableColumns?: Array<TableHeaderOption>,
  // string of ids
  visibleColumnIds?: string[],
  handleColumnChecked?: (columnId: string) => void,
  handleColumnUnchecked?: (columnId: string) => void,
  onClose?: () => void,
}

type HeaderColumn = {
  disableToggleHide?: boolean;
};

type PartialHeaderColumn = HeaderColumn & {
  id?: string;
  headerMenuValue?: string;
};

type RequiredHeaderColumn = HeaderColumn & {
  id: string;
  headerMenuValue: string;
};

export function getTableHeaderOptions<T extends PartialHeaderColumn>(
  columns: T[],
): TableHeaderOption[] {
  return columns
    .filter(
      (column): column is T & RequiredHeaderColumn => Boolean(column.id && column.headerMenuValue),
    )
    .map((column) => ({
      id: column.id,
      label: column.headerMenuValue,
      disableToggleHide: Boolean(column.disableToggleHide),
    }));
}

const OptionsMenu: Component<Props> = ({
  dataTestId,
  availableColumns,
  visibleColumnIds,
  handleColumnChecked,
  handleColumnUnchecked,
  menuPosition,
  onClose,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState('');

  const open = Boolean(menuPosition);

  const columns = availableColumns?.map(
    (column) => ({
      ...column,
      checked: Boolean(visibleColumnIds?.some((activeColumn) => activeColumn === column.id)),
    }),
  ).filter(
    ({ label }) => label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  return (
    <Menu
      disableAutoFocusItem
      disableAutoFocus
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={menuPosition ?? undefined}
      classes={{ paper: classes.menu }}
    >

      {columns && visibleColumnIds && (
      <div>
        <div className={classes.searchInputWrapper}>
          <InputField
            type="text"
            value={searchInput}
            className={classes.searchInput}
            onChange={(value) => setSearchInput(value)}
            placeholder={`${t('labels.filterHeaders')}`}
          />
        </div>
        <AvailableColumnsMenu
          dataTestId={`${makeShortName(dataTestId)}-available-columns-menu`}
          availableColumns={columns}
          handleColumnChecked={handleColumnChecked}
          handleColumnUnchecked={handleColumnUnchecked}
        />
      </div>
      )}
    </Menu>
  );
};

export default OptionsMenu;
