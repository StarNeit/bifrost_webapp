import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from 'react-i18next';
import { makeStyles, useTheme } from '@material-ui/core';
import { ColumnInstance, Row } from 'react-table';
import type {
  Assortment,
  Colorant as TColorant,
} from '@xrite/cloud-formulation-domain-model';
import { apply as applyJSONPatch } from 'json8-patch';
import cloneDeep from 'lodash/cloneDeep';

import { Component } from '../../types/component';
import InputField from '../../components/InputField';
import BifrostTable from '../../components/Table/Table';
import Colorant from './Colorant';
import { addChange } from '../../data/reducers/import';
import { getTableHeaderMenuProperties } from '../common/Table/HeaderCell';
import { TableColumn } from '../../components/Table/types';
import SortIndicator from '../../components/Table/Controls/SortIndicator';
import OptionsMenu, { getTableHeaderOptions } from '../../components/Table/Controls/OptionsMenu';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    width: '50%',
    height: '100%',
    maxWidth: theme.spacing(160),
    flexDirection: 'column',
  },
  table: {
    overflow: 'auto',
    width: theme.spacing(80),
  },
  importBtn: {
    padding: theme.spacing(1),
  },
  assortmentCell: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  colorantCell: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },
}));

type EditableCellProps = {
  value: string,
  row: Row<TColorant>,
  column: ColumnInstance<TColorant>,
  assortmentId: string,
};

const EditableCell: Component<EditableCellProps> = ({
  value: initialValue,
  row: { index },
  column,
  assortmentId,
}) => {
  const dispatch = useDispatch();

  const [value, setValue] = useState(initialValue);

  const onBlur = () => {
    dispatch(addChange({
      operation: {
        op: 'replace',
        path: `/${index}/${column.id}`,
        value,
      },
      objectId: assortmentId,
      objectType: 'assortments',
    }));
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <InputField value={value} onChange={setValue} onBlur={onBlur} />
  );
};

type TableProps = {
  assortment: Assortment,
}

const AssortmentsView: Component<TableProps> = ({ assortment }) => {
  const classes = useStyles();
  const theme = useTheme();

  const { t } = useTranslation();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const columns: {
    columns: TableColumn<TColorant>[],
    Header: string,
    disableResizing?: boolean
  }[] = [
    {
      Header: t<string>('labels.workspace'),
      disableResizing: true,
      columns: [
        {
          ...getTableHeaderMenuProperties(t<string>('labels.name')),
          accessor: 'name',
          width: theme.spacing(30),
          disableSortBy: true,
          Cell: (props) => (
            <div className={classes.assortmentCell}>
              <EditableCell assortmentId={assortment.id} {...props} />
            </div>
          ),
        },
        {
          ...getTableHeaderMenuProperties(t<string>('labels.colorant')),
          id: 'colorants',
          accessor: 'id', // accessor not really needed here but omitting it breaks types
          disableSortBy: true,
          Cell: ({ row }) => (
            <div className={classes.colorantCell}>
              <Colorant
                colorant={row.original}
                calibrationConditionId={assortment.calibrationConditions?.[0].id}
              />
            </div>
          ),
          width: theme.spacing(30),
        },
      ],
    },
  ];

  const patch = useSelector((state) => state.dataImport.changes.assortments[assortment.id]);

  const data = useMemo(
    // apply mutates the data so we pass a clone
    () => {
      if (!patch) return assortment.colorants;
      return applyJSONPatch(cloneDeep(assortment.colorants), patch).doc as TColorant[];
    },
    [assortment.id, patch],
  );

  const availableHeaderColumns = useMemo(() => getTableHeaderOptions(columns[0].columns), []);
  return (
    <BifrostTable
      key={assortment.id}
      className={classes.table}
      data={data}
      columns={columns}
      selectedRowId={selectedRows}
      onRowClick={({ id }: {id: string}) => {
        setSelectedRows((old) => {
          if (old.includes(id)) return old.filter((clicked) => clicked !== id);
          return [...old, id];
        });
      }}
      renderHeaderMenu={(props) => (
        <SortIndicator
          sort={props.sorted}
          hideIndicator={!props.canSort}
        />
      )}
      renderHeaderOptionsMenu={(props) => (
        <OptionsMenu
          // TODO dataTestId={dataTestId}
          availableColumns={availableHeaderColumns}
          {...props}
        />
      )}
    />
  );
};

export default AssortmentsView;
