/* eslint-disable react/destructuring-assignment */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  makeStyles, useTheme,
} from '@material-ui/core';
import { SortByFn, SortingRule } from 'react-table';

import { ClassNameProps, Component } from '../../types/component';
import { storeTestData } from '../../utils/test-utils';
import {
  OutputRecipeComponentWithColor,
  OutputRecipeWithColors,
  RecipeUnit,
} from '../../types/recipe';
import { WidgetUpdate, TableSettings, TableSizing } from '../WidgetLayout/types';
import BifrostTable from '../../components/Table/Table';
import AmountCell from './AmountCell';
import { CorrectionMode } from '../../types/cfe';
import ColorCell from './ColorCell';
import { TableColumn } from '../../components/Table/types';
import { getInitialTableSettings } from '../../components/Table/utils';
import SortIndicator from '../../components/Table/Controls/SortIndicator';
import OptionsMenu, { getTableHeaderOptions } from '../../components/Table/Controls/OptionsMenu';
import {
  getComponentType, SOLVENT_COMPONENT_ID,
} from '../../utils/utilsRecipe';
import CumulativeCell from './CumulativeCell';
import HeaderCell, { getTableHeaderMenuProperties } from '../../pages/common/Table/HeaderCell';
import NumberCell from '../../pages/common/Table/NumberCell';
import StringCell from '../../pages/common/Table/StringCell';
import PercentageChangeCell from './PercentageChangeCell';

const useStyles = makeStyles((theme) => ({
  small: {
    '& .MuiTableCell-sizeSmall': {
      paddingRight: theme.spacing(0),
    },
    paddingRight: theme.spacing(2),
  },
  topBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.palette.divider,
    borderTopStyle: 'solid',
  },
  tableContainer: {
    overflow: 'initial',
  },
  cell: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  spacer: {
    padding: theme.spacing(2.5, 0),
  },
}));

const defaultFormulationActiveColumns = [
  'previewColor',
  'name',
  'percentage',
  'amount',
  'cumulativeAmount',
  'cumulativePercentage',
];

const defaultCorrectionActiveColumns = [
  'previewColor',
  'name',
  'originalAmount',
  'addAmount',
  'amount',
  'percentage',
];

export type TotalRowData = {
  id: 'total' | 'total-basic-ink'
  isTotalRow: true;
  recipeUnit: RecipeUnit;
} & Partial<Omit<OutputRecipeComponentWithColor, 'id' | 'recipeUnit'>>;
export type RecipeDisplayTableRowData = ClassNameProps & OutputRecipeComponentWithColor & {
  isTotalRow: false;
};
export type RowData = RecipeDisplayTableRowData | TotalRowData;

type RecipeTableColumn = TableColumn<RowData>;

export type RecipeDisplayTableProps = {
  data: OutputRecipeWithColors,
  recipeCost?: string,
  correctionMode: CorrectionMode,
  handleAmountChange?: (colorantId: string, layerIndex: number, newAmount: number) => void,
  onChange: (update: WidgetUpdate) => void,
  tableSettings?: TableSettings,
  isCorrection?: boolean,
  dataTestId?: string,
};

const TOTAL_ROW_ID = 'total';
const TOTAL_BASIC_INK_ROW_ID = 'total-basic-ink';

const getActiveColumnIds = (defaultIds: string[], savedIds?: string[]) => {
  if (!savedIds) return defaultIds;
  if (savedIds.includes('previewColor')) return savedIds;
  return ['previewColor', ...savedIds];
};

const isFixedRow = (componentId: string) => (
  componentId === TOTAL_ROW_ID
  || componentId === TOTAL_BASIC_INK_ROW_ID
  || componentId === SOLVENT_COMPONENT_ID
);

const sortFixedRow = (componentId: string, desc?: boolean) => {
  const componentIsTotalRow = componentId === TOTAL_ROW_ID;
  const componentIsTotalBasicRow = componentId === TOTAL_BASIC_INK_ROW_ID;
  const componentIsSolvent = componentId === SOLVENT_COMPONENT_ID;

  // total row is always at the bottom
  if (componentIsTotalRow) { return desc ? -1 : 1; }

  // solvent row is always second to last
  if (componentIsSolvent) { return desc ? -1 : 1; }

  // total basic ink row is always third to last
  if (componentIsTotalBasicRow) { return desc ? -1 : 1; }

  return 0;
};

const commonSortFunction: SortByFn<RowData> = (rowA, rowB, _, desc) => {
  const componentA = rowA.original;
  const componentB = rowB.original;

  if (isFixedRow(componentA.id)) {
    return sortFixedRow(componentA.id, desc);
  }

  if (isFixedRow(componentB.id)) {
    return sortFixedRow(componentB.id, desc);
  }

  return 0;
};

const sortByName: SortByFn<RowData> = (rowA, rowB, _, desc) => {
  const componentA = rowA.original;
  const componentB = rowB.original;

  if (isFixedRow(componentA.id)) {
    return sortFixedRow(componentA.id, desc);
  }

  if (isFixedRow(componentB.id)) {
    return sortFixedRow(componentB.id, desc);
  }

  // used for type narrowing
  if (componentA.isTotalRow || componentB.isTotalRow) return 0;

  const { recipeOutputMode } = componentA;

  // ORDER: Leftovers, Clear, Colorants, Black, White, Technical Varnishes,
  // Additives, Solvent
  const componentAType = getComponentType(componentA, recipeOutputMode);
  const componentBType = getComponentType(componentB, recipeOutputMode);

  const isAsc = desc === false;
  const isDesc = desc === true;

  const compareEqualComponentTypes = () => {
    if (isDesc) {
      return componentB.name.localeCompare(componentA.name);
    }
    // ASC
    return componentA.name.localeCompare(componentB.name);
  };

  if (
    componentAType === componentBType
  ) {
    return compareEqualComponentTypes();
  }

  if (isAsc) {
    if (componentAType === 'Leftover') { return -1; }
    if (componentBType === 'Leftover') { return 1; }

    if (componentAType === 'Clear') { return -1; }
    if (componentBType === 'Clear') { return 1; }

    if (componentAType === 'Colorant') { return -1; }
    if (componentBType === 'Colorant') { return 1; }

    if (componentAType === 'Black') { return -1; }
    if (componentBType === 'Black') { return 1; }

    if (componentAType === 'White') { return -1; }
    if (componentBType === 'White') { return 1; }

    if (componentAType === 'TechnicalVarnish') { return -1; }
    if (componentBType === 'TechnicalVarnish') { return 1; }

    if (componentAType === 'Additive') { return -1; }
    if (componentBType === 'Additive') { return 1; }
  } else if (isDesc) {
    if (componentAType === 'Additive') { return 1; }
    if (componentBType === 'Additive') { return -1; }

    if (componentAType === 'TechnicalVarnish') { return 1; }
    if (componentBType === 'TechnicalVarnish') { return -1; }

    if (componentAType === 'White') { return 1; }
    if (componentBType === 'White') { return -1; }

    if (componentAType === 'Black') { return 1; }
    if (componentBType === 'Black') { return -1; }

    if (componentAType === 'Colorant') { return 1; }
    if (componentBType === 'Colorant') { return -1; }

    if (componentAType === 'Leftover') { return 1; }
    if (componentBType === 'Leftover') { return -1; }

    if (componentAType === 'Clear') { return 1; }
    if (componentBType === 'Clear') { return -1; }
  }
  return 0;
};

const RecipeDisplayTable: Component<RecipeDisplayTableProps> = ({
  data,
  recipeCost,
  handleAmountChange,
  onChange,
  tableSettings,
  correctionMode,
  isCorrection,
  dataTestId,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();

  const componentsData: RowData[] = useMemo(() => {
    return data.layers[0].components.flatMap(
      (component) => {
        const type = getComponentType(component, component.recipeOutputMode);

        if (type !== 'Solvent') {
          return {
            ...component,
            isTotalRow: false,
          };
        }

        const totalRowObjectFiller = {
          specificMass: 0,
          isLeftover: false,
          sourceColorants: component.sourceColorants,
          recipeUnit: component.recipeUnit,
        };

        return [{
          id: TOTAL_BASIC_INK_ROW_ID,
          className: classes.topBorder,
          isTotalRow: true as const,
          name: `${t('labels.totalBasicInk')}:`,
          ...totalRowObjectFiller,
        },
        {
          ...component,
          isTotalRow: false,
        },
        {
          id: TOTAL_ROW_ID,
          className: classes.topBorder,
          isTotalRow: true as const,
          name: `${t('labels.total')}:`,
          ...totalRowObjectFiller,
        }];
      },
    );
  }, [data]);

  const columns = useMemo(() => {
    const startColumns: RecipeTableColumn[] = [
      {
        id: 'previewColor',
        Header: '',
        accessor: 'previewColor',
        disableToggleHide: true,
        disableSortBy: true,
        Cell: ColorCell,
      },
      {
        id: 'name',
        accessor: 'name',
        ...getTableHeaderMenuProperties(t<string>('labels.component'), false, classes.cell),
        disableToggleHide: true,
        Cell: ({ value, cell }) => (
          <StringCell
            value={value}
            className={classes.cell}
            cell={cell}
          />
        ),
        sortType: sortByName,
      },
    ];

    const correctionColumns: RecipeTableColumn[] = [
      {
        id: 'percentage',
        accessor: 'percentage',
        ...getTableHeaderMenuProperties(t<string>('labels.correctedPercentage'), true, classes.cell),
        Cell: ({
          rows, row, cell, column, value, shouldRound,
        }) => (
          !row.original.isTotalRow ? (
            <NumberCell cell={cell} shouldRound={shouldRound} value={value} />
          )
            : (
              <CumulativeCell rows={rows} row={row} column={{ ...column, id: 'cumulativePercentage' }} />
            )
        ),
        disableToggleHide: false,
        sortType: commonSortFunction,
      },
      {
        id: 'originalAmount',
        accessor: 'originalAmount',
        Header: ({ rows }) => (
          <HeaderCell
            value={t<string>('labels.originalAmount', { unit: rows[0].original.recipeUnit.name })}
            isNumeric
            className={classes.cell}
          />
        ),
        headerMenuValue: t<string>('labels.originalAmount'),
        Cell: ({
          rows, row, cell, column, value, shouldRound,
        }) => (
          !row.original.isTotalRow ? (
            <NumberCell cell={cell} shouldRound={shouldRound} value={value} />
          )
            : (
              <CumulativeCell rows={rows} row={row} column={{ ...column, id: 'originalCumulativeAmount' }} />
            )
        ),
        disableToggleHide: false,
        width: theme.spacing(25.25),
        sortType: commonSortFunction,
      },
      {
        id: 'percentageChange',
        accessor: 'percentageChange',
        Header: ({ rows }) => (
          <HeaderCell
            value={t<string>('labels.percentageChange', { unit: rows[0].original.recipeUnit.name })}
            isNumeric
            className={classes.cell}
          />
        ),
        headerMenuValue: t<string>('labels.percentageChange'),
        Cell: PercentageChangeCell,
        disableToggleHide: false,
        width: theme.spacing(26.75),
        sortType: commonSortFunction,
      },
      {
        id: 'addAmount',
        accessor: 'addAmount',
        Header: ({ rows }) => (
          <HeaderCell
            value={t<string>('labels.addAmount', { unit: rows[0].original.recipeUnit.name })}
            isNumeric
            className={classes.cell}
          />
        ),
        headerMenuValue: t<string>('labels.addAmount'),
        Cell: ({
          rows, row, cell, column, value, shouldRound,
        }) => (
          // eslint-disable-next-line react/destructuring-assignment
          !row.original.isTotalRow ? (
            <NumberCell cell={cell} value={value} shouldRound={shouldRound} />
          )
            : (
              <CumulativeCell rows={rows} row={row} column={{ ...column, id: 'addAmount' }} />
            )
        ),
        disableToggleHide: false,
        width: theme.spacing(22.75),
        sortType: commonSortFunction,
      },
      {
        id: 'amount',
        accessor: 'amount',
        Header: ({ rows }) => (
          <HeaderCell
            value={t<string>('labels.correctedAmount', { unit: rows[0].original.recipeUnit.name })}
            isNumeric
            className={classes.cell}
          />
        ),
        headerMenuValue: t<string>('labels.correctedAmount'),
        disableToggleHide: false,
        Cell: ({
          rows, row, column, value,
        }) => (
          !row.original.isTotalRow ? (
            <AmountCell row={row} value={value} handleAmountChange={handleAmountChange} />
          )
            : (
              <CumulativeCell rows={rows} row={row} column={column} />
            )
        ),
        width: theme.spacing(26.75),
        sortType: commonSortFunction,
      },
      {
        id: 'cumulativeAmount',
        Header: ({ rows }) => (
          <HeaderCell
            value={t<string>('labels.correctedCumulative', { unit: rows[0].original.recipeUnit.name })}
            isNumeric
            className={classes.cell}
          />
        ),
        headerMenuValue: t<string>('labels.correctedCumulative'),
        disableToggleHide: false,
        Cell: CumulativeCell,
        disableSortBy: true,
      },
      {
        id: 'originalCumulativeAmount',
        Header: ({ rows }) => (
          <HeaderCell
            value={t<string>('labels.originalCumulative', { unit: rows[0].original.recipeUnit.name })}
            isNumeric
            className={classes.cell}
          />
        ),
        headerMenuValue: t<string>('labels.originalCumulative'),
        disableToggleHide: false,
        Cell: CumulativeCell,
        width: theme.spacing(28),
        disableSortBy: true,
      },
      {
        id: 'cumulativePercentage',
        ...getTableHeaderMenuProperties(t<string>('labels.correctedCumulativePercentage'), true, classes.cell),
        disableToggleHide: false,
        Cell: CumulativeCell,
        width: theme.spacing(28),
        disableSortBy: true,
      },
      {
        id: 'originalPercentage',
        accessor: 'originalPercentage',
        ...getTableHeaderMenuProperties(t<string>('labels.originalPercentage'), true, classes.cell),
        disableToggleHide: false,
        Cell: NumberCell,
        width: theme.spacing(16.5),
        sortType: commonSortFunction,
      },
      {
        id: 'originalCumulativePercentage',
        ...getTableHeaderMenuProperties(t<string>('labels.originalCumulativePercentage'), true, classes.cell),
        disableToggleHide: false,
        Cell: CumulativeCell,
        width: theme.spacing(27),
        disableSortBy: true,
      },
    ];
    // remove addAmount if correction is not in addition mode
    const filteredCorrectionColumns = correctionColumns.filter((column) => (!(correctionMode === 'New' && column.id === 'addAmount')));

    const formulationColumns: RecipeTableColumn[] = [
      {
        id: 'percentage',
        accessor: 'percentage',
        ...getTableHeaderMenuProperties(t<string>('labels.recipePercentage'), true, classes.cell),
        disableToggleHide: false,
        Cell: ({
          rows, row, cell, column, value, shouldRound,
        }) => (
          !row.original.isTotalRow ? (
            <NumberCell cell={cell} value={value} shouldRound={shouldRound} />
          )
            : (
              <CumulativeCell rows={rows} row={row} column={{ ...column, id: 'cumulativePercentage' }} />
            )
        ),
        sortType: commonSortFunction,
      },
      {
        id: 'amount',
        accessor: 'amount',
        Header: ({ rows }) => (
          <HeaderCell
            value={t<string>('labels.amountWithUnit', { unit: rows[0].original.recipeUnit.name })}
            isNumeric
            className={classes.cell}
          />
        ),
        headerMenuValue: t<string>('labels.amountWithUnit'),
        disableToggleHide: false,
        Cell: ({
          rows, row, column, value,
        }) => (
          !row.original.isTotalRow ? (
            <AmountCell row={row} value={value} handleAmountChange={handleAmountChange} />
          )
            : (
              <CumulativeCell rows={rows} row={row} column={{ ...column, id: 'cumulativeAmount' }} />
            )
        ),
        sortType: commonSortFunction,
      },
      {
        id: 'cumulativeAmount',
        Header: ({ rows }) => (
          <HeaderCell
            value={t<string>('labels.cumulative', { unit: rows[0].original.recipeUnit.name })}
            isNumeric
            className={classes.cell}
          />
        ),
        headerMenuValue: t<string>('labels.cumulative'),
        disableToggleHide: false,
        Cell: CumulativeCell,
        disableSortBy: true,
      },
      {
        id: 'cumulativePercentage',
        Header: ({ rows }) => (
          <HeaderCell
            value={t<string>('labels.cumulativePercentage', { unit: rows[0].original.recipeUnit.name })}
            isNumeric
            className={classes.cell}
          />
        ),
        headerMenuValue: t<string>('labels.cumulativePercentage'),
        disableToggleHide: false,
        Cell: CumulativeCell,
        disableSortBy: true,
      },
    ];
    return isCorrection
      ? startColumns.concat(filteredCorrectionColumns)
      : startColumns.concat(formulationColumns);
  }, []);

  const defaultActiveColumnIds = isCorrection
    ? defaultCorrectionActiveColumns : defaultFormulationActiveColumns;

  const activeColumnIds = useMemo(
    () => getActiveColumnIds(defaultActiveColumnIds, tableSettings?.activeColumnIds),
    [],
  );

  const handleColumnWidthChange = onChange && (
    (sizing: TableSizing) => {
      onChange({
        tableSettings: {
          ...tableSettings,
          sizing,
        },
      });
    });

  const handleColumnOrderChange = onChange && (
    (newColumnOrderIds: string[]) => {
      onChange({
        tableSettings: {
          ...tableSettings,
          order: newColumnOrderIds,
        },
      });
    });

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

  const availableHeaderColumns = useMemo(() => getTableHeaderOptions(columns), []);
  storeTestData('recipeResultTable', {
    data,
    recipeCost,
    columns,
  });
  return (
    <BifrostTable
      dataTestId={dataTestId}
      className={classes.tableContainer}
      columns={columns}
      data={componentsData}
      initialState={{
        ...(getInitialTableSettings(tableSettings || {
          sortBy: [{
            id: 'percentage',
            desc: false,
          }],
        })),
        activeColumnIds,
      }}
      onActiveColumnChange={handleActiveColumnsChange}
      onSortChange={handleSortChange}
      onColumnWidthChange={handleColumnWidthChange}
      onColumnOrderChange={handleColumnOrderChange}
      withBorders={false}
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

export default RecipeDisplayTable;
