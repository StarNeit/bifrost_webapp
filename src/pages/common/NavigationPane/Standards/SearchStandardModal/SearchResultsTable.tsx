import { makeStyles } from '@material-ui/core';
import { useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';

import ColorSquare from '../../../../../components/ColorSquare';
import LoadingContainer from '../../../../../components/LoadingContainer';
import Panel from '../../../../../components/Panel';
import OptionsMenu, { getTableHeaderOptions } from '../../../../../components/Table/Controls/OptionsMenu';
import SortIndicator from '../../../../../components/Table/Controls/SortIndicator';
import BifrostTable from '../../../../../components/Table/Table';
import { TableColumn } from '../../../../../components/Table/types';
import { Caption, Tiny } from '../../../../../components/Typography';
import { scrollbars } from '../../../../../theme/components';
import { Job } from '../../../../../types/dms';
import { StandardWithPreview } from '../../../../../types/standardSearch';
import Cell from '../../../Table/StringCell';
import DateCell from '../../../Table/DateCell';
import { getTableHeaderMenuProperties } from '../../../Table/HeaderCell';
import NumberCell from '../../../Table/NumberCell';

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: theme.spacing(83),
    overflowY: 'hidden',
  },
  table: {
    height: '100%',
    overflowY: 'scroll',
    background: theme.palette.surface[2],
    ...scrollbars(theme),
  },
  title: {
    textTransform: 'uppercase',
    padding: theme.spacing(2, 0),
  },
  warning: {
    position: 'absolute',
    display: 'flex',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  colorSquare: {
    width: theme.spacing(10),
    minHeight: theme.spacing(4.125),
  },
  colorCell: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    height: '1005',
  },
}));

type RowData<T> = NonNullable<T> & {
  preview?: Pick<Job, 'simulation' | 'isMultiAngle'>
  L?: number | undefined,
  a?: number | undefined,
  b?: number | undefined,
  C?: number | undefined,
  h?: number | undefined,
  dL?: number | undefined,
  dA?: number | undefined,
  dB?: number | undefined,
  dC?: number | undefined,
  dH?: number | undefined,
  dE00?: number | undefined,
  dE76?: number | undefined,
};

type SearchResultsTableProps = {
  dataTestId?: string;
  standards: StandardWithPreview[];
  activeColumns: string[];
  loading: boolean;
  selectedStandardId: string;
  setSelectedStandardId(id: string): void;
};

const SearchResultsTable: React.FC<SearchResultsTableProps> = ({
  dataTestId,
  standards,
  loading,
  activeColumns: activeColumnIds,
  selectedStandardId,
  setSelectedStandardId,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const columns: TableColumn<RowData<(typeof standards)[number]>>[] = useMemo(() => [{
    id: 'preview',
    ...getTableHeaderMenuProperties(t<string>('labels.preview')),
    disableSortBy: true,
    accessor: 'preview',
    Cell: ({ value }) => {
      return (
        <div className={classes.colorCell}>
          <ColorSquare
            colors={value?.simulation || []}
            isGradient={value?.isMultiAngle}
            className={classes.colorSquare}
          />
        </div>
      );
    },
  },
  {
    id: 'name',
    ...getTableHeaderMenuProperties(t<string>('labels.name')),
    accessor: 'name',
    Cell,
  },
  {
    id: 'creationDateTime',
    ...getTableHeaderMenuProperties(t<string>('labels.dateCreated')),
    accessor: 'creationDateTime',
    Cell: DateCell,
    sortType: 'datetime',
  },
  {
    id: 'L',
    ...getTableHeaderMenuProperties(t<string>('labels.lab.L'), true),
    accessor: 'L',
    sortType: 'basic',
    Cell: NumberCell,
  },
  {
    id: 'a',
    ...getTableHeaderMenuProperties(t<string>('labels.lab.a'), true),
    accessor: 'a',
    sortType: 'basic',
    Cell: NumberCell,
  },
  {
    id: 'b',
    ...getTableHeaderMenuProperties(t<string>('labels.lab.b'), true),
    accessor: 'b',
    sortType: 'basic',
    Cell: NumberCell,
  },
  {
    id: 'C',
    ...getTableHeaderMenuProperties(t<string>('labels.Ch.C'), true),
    accessor: 'C',
    sortType: 'basic',
    Cell: NumberCell,
  },
  {
    id: 'h',
    ...getTableHeaderMenuProperties(t<string>('labels.Ch.h'), true),
    accessor: 'h',
    sortType: 'basic',
    Cell: NumberCell,
  },
  {
    id: 'dL',
    ...getTableHeaderMenuProperties(t<string>('labels.lab.DL'), true),
    accessor: 'dL',
    sortType: 'basic',
    Cell: NumberCell,
  },
  {
    id: 'dA',
    ...getTableHeaderMenuProperties(t<string>('labels.lab.Da'), true),
    accessor: 'dA',
    sortType: 'basic',
    Cell: NumberCell,
  },
  {
    id: 'dB',
    ...getTableHeaderMenuProperties(t<string>('labels.lab.Db'), true),
    accessor: 'dB',
    sortType: 'basic',
    Cell: NumberCell,
  },
  {
    id: 'dC',
    ...getTableHeaderMenuProperties(t<string>('labels.Ch.DC'), true),
    accessor: 'dC',
    sortType: 'basic',
    Cell: NumberCell,
  },
  {
    id: 'dH',
    ...getTableHeaderMenuProperties(t<string>('labels.Ch.DH'), true),
    accessor: 'dH',
    sortType: 'basic',
    Cell: NumberCell,
  },
  {
    id: 'dE00',
    ...getTableHeaderMenuProperties(t<string>('labels.dE.dE00'), true),
    accessor: 'dE00',
    sortType: 'basic',
    Cell: NumberCell,
  },
  {
    id: 'dE76',
    ...getTableHeaderMenuProperties(t<string>('labels.dE.dE76'), true),
    accessor: 'dE76',
    sortType: 'basic',
    Cell: NumberCell,
  }], []);

  const availableHeaderColumns = useMemo(() => getTableHeaderOptions(columns), []);
  return (
    <Panel className={classes.tableContainer}>
      <Caption className={classes.title}>
        {t('labels.searchResults')}
      </Caption>
      <BifrostTable<RowData<(typeof standards)[number]>>
        dataTestId={dataTestId}
        columns={columns}
        data={loading ? [] : standards}
        className={classes.table}
        selectedRowId={selectedStandardId}
        onRowClick={({ id }) => setSelectedStandardId(id)}
        initialState={{
          activeColumnIds,
        }}
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

      {/* warning message */}
      {!standards.length && !loading
        && (
          <div data-testid="no-search-standards-message" className={classes.warning}>
            <Tiny>
              {t('labels.noSearchStandards')}
            </Tiny>
          </div>
        )}

      {/* spinner */}
      <LoadingContainer data-testid={`${dataTestId}-loading-container`} fetching={loading} className={classes.warning} />
    </Panel>
  );
};

export default memo(SearchResultsTable);
