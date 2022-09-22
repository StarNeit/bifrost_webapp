import { useTheme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { SortingRule } from 'react-table';
import { useMemo } from 'react';

import { Component } from '../../types/component';
import BifrostTable from '../../components/Table/Table';
import ScoreCell from './ScoreCell';
import ColorCell from './ColorCell';
import { FormulationResultsTableRowData } from '../utils';
import { useColorimetricConfiguration } from '../../data/configurations';
import TypeCell from './TypeCell';
import { getTableHeaderMenuProperties } from '../../pages/common/Table/HeaderCell';
import { TableColumn } from '../../components/Table/types';
import Cell from '../../pages/common/Table/StringCell';
import { TableSettings, TableSizing, WidgetUpdate } from '../WidgetLayout/types';
import { getInitialTableSettings } from '../../components/Table/utils';
import SortIndicator from '../../components/Table/Controls/SortIndicator';
import PriceCell from './PriceCell';
import OptionsMenu, { getTableHeaderOptions } from '../../components/Table/Controls/OptionsMenu';
import NumberCell from '../../pages/common/Table/NumberCell';

interface Props {
  dataTestId?: string;
  data: FormulationResultsTableRowData[];
  onRowSelect: (id?: string) => void;
  selectedRowId?: string;
  onChange: (update: WidgetUpdate) => void,
  tableSettings?: TableSettings,
}

const initialActiveColumnsIds = ['type', 'name', 'color', 'score', 'deltae', 'deltae', 'numComponents'];

export const FormulationResultTable: Component<Props> = (
  {
    data,
    selectedRowId,
    onRowSelect,
    dataTestId,
    onChange,
    tableSettings,
  },
) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { configuration: colorimetricConfiguration } = useColorimetricConfiguration();

  const columns: TableColumn<FormulationResultsTableRowData>[] = [
    {
      id: 'type',
      ...getTableHeaderMenuProperties(t<string>('labels.type')),
      accessor: 'type',
      Cell: TypeCell,
      width: theme.spacing(13),
      disableToggleHide: true,
      disableSortBy: true,
    },
    {
      id: 'name',
      ...getTableHeaderMenuProperties(t<string>('labels.recipe')),
      accessor: 'name',
      Cell,
      width: theme.spacing(15),
      disableToggleHide: true,
    },
    {
      id: 'color',
      ...getTableHeaderMenuProperties(t<string>('labels.color')),
      accessor: 'colors',
      Cell: ColorCell,
      width: theme.spacing(15),
      disableSortBy: true,
      disableToggleHide: true,
    },
    {
      id: 'score',
      ...getTableHeaderMenuProperties(t<string>('labels.score'), true),
      accessor: 'score',
      Cell: ScoreCell,
      width: theme.spacing(14),
      sortType: 'number',
    },
    {
      id: 'numComponents',
      ...getTableHeaderMenuProperties(t<string>('labels.numberOfComponentsHeader'), true),
      accessor: 'numberOfComponents',
      Cell: ({ value }) => <NumberCell shouldRound={false} value={value} />,
      width: theme.spacing(20),
      sortType: 'number',
    },
    {
      id: 'price',
      ...getTableHeaderMenuProperties(t<string>('labels.price'), true),
      accessor: 'price',
      Cell: PriceCell,
      width: theme.spacing(20),
      sortType: 'number',
    },
    {
      id: 'custom',
      ...getTableHeaderMenuProperties(t<string>('labels.custom'), true),
      accessor: 'custom',
      Cell: NumberCell,
      sortType: 'number',
    },
  ];

  // Only show the default deltaE from the configuration
  if (colorimetricConfiguration?.metric.deltaE === 'dE00') {
    columns.splice(3, 0, {
      id: 'deltae',
      ...getTableHeaderMenuProperties('ΔE₀₀', true),
      accessor: 'deltaE2000',
      Cell: NumberCell,
      width: theme.spacing(12),
      sortType: 'number',
    });
  } else {
    columns.splice(3, 0, {
      id: 'deltae',
      ...getTableHeaderMenuProperties('ΔE*', true),
      accessor: 'deltaE76',
      Cell: NumberCell,
      width: theme.spacing(12),
      sortType: 'number',
    });
  }

  const handleActiveColumnsChange = onChange && ((newIds: string[]) => {
    onChange({
      tableSettings: {
        ...tableSettings,
        activeColumnIds: newIds,
      },
    });
  });

  const handleSortChange = onChange && ((sortBy: SortingRule<string>[]) => {
    onChange({
      tableSettings: {
        ...tableSettings,
        sortBy,
      },
    });
  });

  const handleColumnResizeChange = onChange && ((sizing: TableSizing) => {
    onChange({
      tableSettings: {
        ...tableSettings,
        sizing,
      },
    });
  });

  const handleColumnOrderChange = onChange && ((newColumnOrder: string[]) => {
    onChange({
      tableSettings: {
        ...tableSettings,
        order: newColumnOrder,
      },
    });
  });

  const availableHeaderColumns = useMemo(() => getTableHeaderOptions(columns), []);
  const initialTableState = useMemo(() => getInitialTableSettings(
    tableSettings || {},
    {
      sortBy: [{
        id: colorimetricConfiguration?.metric.deltaE === 'dE00' ? 'deltae' : 'deltae76',
        desc: false,
      }],
      activeColumnIds: initialActiveColumnsIds,
    },
  ), []);

  return (
    <BifrostTable
      columns={columns}
      dataTestId={dataTestId}
      data={data}
      selectedRowId={selectedRowId}
      onRowClick={({ id }) => onRowSelect(id)}
      onActiveColumnChange={handleActiveColumnsChange}
      onSortChange={handleSortChange}
      onColumnWidthChange={handleColumnResizeChange}
      onColumnOrderChange={handleColumnOrderChange}
      initialState={initialTableState}
      renderHeaderMenu={(props) => (
        <SortIndicator
          sort={props.sorted}
          hideIndicator={!props.canSort}
        />
      )}
      renderHeaderOptionsMenu={(props) => (
        <OptionsMenu
          dataTestId={dataTestId}
          availableColumns={availableHeaderColumns}
          {...props}
        />
      )}
    />
  );
};

export default FormulationResultTable;
