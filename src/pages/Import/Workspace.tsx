import { useTranslation } from 'react-i18next';
import { capitalize } from 'lodash';
import clsx from 'clsx';
import { Assortment } from '@xrite/cloud-formulation-domain-model';
import { makeStyles } from '@material-ui/core';
import { Column, Row } from 'react-table';
import { useEffect, useState, useContext } from 'react';

import { Component, ClassNameProps } from '../../types/component';
import useToast from '../../data/useToast';
import BifrostTable from '../../components/Table/Table';
import {
  Subtitle, Body, Title,
} from '../../components/Typography';
import Panel from '../../components/Panel';
import Button from '../../components/Button';
import LoadingContainer from '../../components/LoadingContainer';
import { useImport, useWorkspaceObject, WorkspaceData } from '../../data/cdis.hooks';
import { WorkspaceObject } from '../../types/cdis';
import { ArrayElement } from '../../types/utils';
import AssortmentsView from './AssortmentsView';
import { makeShortName } from '../../../cypress/support/util/selectors';
import WorkspaceContext from './workspaceContext';
import { renderHeaderCell } from '../common/Table/HeaderCell';
import Cell from '../common/Table/StringCell';
import DateCell from '../common/Table/DateCell';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    maxWidth: theme.spacing(320),
    paddingBottom: theme.spacing(12),
  },
  workspaceBrowser: {
    height: '100%',
    display: 'flex',
    flex: `4 0 ${theme.spacing(62.5)}px`,
    width: theme.spacing(62.5),
    flexDirection: 'column',
    padding: theme.spacing(2),
  },
  workspaceObjects: {
    padding: theme.spacing(2),
    width: '100%',
  },
  workspaceObjectsContainer: {
    overflow: 'auto',
  },
  objectDetailsContainer: {
    display: 'flex',
    justifyContent: 'center',
    flex: '6 0 auto',
    marginLeft: theme.spacing(2),
    width: '480px', // TODO layout will be improved
    maxWidth: theme.spacing(160),
  },
  table: {
    overflow: 'auto',
    width: theme.spacing(80),
  },
  tableHeading: {
    marginBottom: theme.spacing(2),
  },
  cell: {
    padding: theme.spacing(1),
  },
  importBtn: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },
}));

type ButtonProps = {
  dataTestId?: string,
  id: string,
  objectType: WorkspaceObject,
  applicationId: string,
}

// TODO: this is temporary button component, will be reworked to batch import/action soon
const ImportButton: Component<ButtonProps> = ({
  dataTestId, id, applicationId, objectType,
}) => {
  const [
    importWorkspaceObject,
    resetImport,
    importProgress,
    importResult,
    importError,
  ] = useImport(applicationId);
  const { showToast } = useToast();
  const { t } = useTranslation();

  const {
    importedObjectIds,
    rejectedObjectIds,
    importingAllObjects,
    reset: resetImportAll,
  } = useContext(WorkspaceContext);

  useEffect(() => {
    if (importingAllObjects) resetImport();
  }, [importingAllObjects]);

  useEffect(() => {
    if (importError) {
      showToast(t('messages.importFileError', { message: importError.message }), 'error');
    }
  }, [importError]);

  const progressIsInInterval = (importProgress > 0 && importProgress <= 100);

  const isImported = Boolean(importResult || importedObjectIds.includes(id));
  const isRejected = Boolean(importError || rejectedObjectIds.includes(id));

  const getLabel = () => {
    if (isRejected) return 'Try again';
    if (isImported) return 'Imported';
    if (importProgress > 0) return `Imported: ${importProgress}%`;
    return 'Import';
  };

  const isDisabled = Boolean(
    progressIsInInterval
    || (!importError && importResult)
    || isImported
    || (importingAllObjects && !isRejected),
  );
  return (
    <Button
      data-testid={dataTestId}
      variant="ghost"
      onClick={() => {
        resetImport();
        resetImportAll();

        importWorkspaceObject(objectType, id, applicationId);
      }}
      disabled={isDisabled}
    >
      {getLabel()}
    </Button>
  );
};

type TableProps = {
  dataTestId?: string,
  data: Exclude<WorkspaceData[keyof WorkspaceData], undefined>,
  objectType: WorkspaceObject,
  applicationId: string,
  handleRowClick(applicationId: string, id: UUID, objectType: WorkspaceObject): void,
}

type RowData = ArrayElement<Exclude<WorkspaceData[keyof WorkspaceData], undefined>>;

const getPrimaryColumns = ({
  applicationId,
  objectType,
}: Pick<TableProps, 'applicationId' | 'objectType'>): Column<RowData>[] => {
  const { t } = useTranslation();
  const classes = useStyles();

  return [
    {
      Header: renderHeaderCell(t<string>('labels.name')),
      accessor: 'name',
      Cell,
    },
    // TODO: the Import button column will soon be removed via EFXW-2211
    {
      Header: '', // No header
      id: 'buttons',
      Cell: ({ row }: { row: Row<RowData> }) => (
        <div className={classes.importBtn}>
          <ImportButton
            dataTestId="import-button"
            id={row.original.id}
            applicationId={applicationId}
            objectType={objectType}
          />
        </div>
      ),
    },
  ];
};

const getCommonMetadataColumns = (): Column<RowData>[] => {
  const { t } = useTranslation();
  return [
    {
      id: 'creationDateTime',
      Header: renderHeaderCell(t<string>('labels.dateCreated')),
      accessor: 'creationDateTime',
      Cell: DateCell,
      sortType: 'datetime',
    },
    {
      Header: renderHeaderCell(t<string>('labels.info')),
      Cell,
      accessor: 'info',
    },
    {
      Header: renderHeaderCell(t<string>('labels.ERPId')),
      Cell,
      accessor: 'ERPId',
    },
    {
      Header: renderHeaderCell(t<string>('labels.owner')),
      Cell,
      accessor: 'owner',
    },
    {
      Header: renderHeaderCell(t<string>('labels.ownerGroup')),
      Cell,
      accessor: 'ownerGroup',
    },
  ];
};

const AssortmentTable: Component<TableProps> = ({
  dataTestId,
  data,
  applicationId,
  objectType,
  handleRowClick,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [selectedObjectId, setObjectId] = useState('');
  const columns: Column<RowData>[] = [
    ...getPrimaryColumns({ applicationId, objectType }),
    {
      Header: renderHeaderCell(t<string>('labels.industry')),
      accessor: 'industry',
      Cell,
    },
    {
      Header: renderHeaderCell(t<string>('labels.subIndustry')),
      accessor: 'subIndustry',
      Cell,
    },
    {
      Header: renderHeaderCell(t<string>('labels.substrate')),
      accessor: 'substrate',
      Cell,
    },
    {
      Header: renderHeaderCell(t<string>('labels.type')),
      accessor: 'type',
      Cell,
    },
    ...getCommonMetadataColumns(),
  ];
  return (
    <BifrostTable
      dataTestId={dataTestId}
      className={classes.table}
      data={data}
      columns={columns}
      selectedRowId={selectedObjectId}
      onRowClick={({ id }) => {
        setObjectId(id);
        handleRowClick(applicationId, id, objectType);
      }}
    />
  );
};

const RecipesTable: Component<TableProps> = ({
  dataTestId,
  data,
  applicationId,
  objectType,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const columns: Column<RowData>[] = [
    ...getPrimaryColumns({ applicationId, objectType }),
    {
      Header: renderHeaderCell(t<string>('labels.assortment')),
      accessor: 'assortment',
      Cell,
    },
    {
      Header: renderHeaderCell(t<string>('labels.substrate')),
      accessor: 'substrate',
      Cell,
    },
    ...getCommonMetadataColumns(),
  ];
  return (
    <BifrostTable
      dataTestId={dataTestId}
      className={classes.table}
      data={data}
      columns={columns}
    />
  );
};

const SubstratesTable: Component<TableProps> = ({
  dataTestId,
  data,
  applicationId,
  objectType,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const columns: Column<RowData>[] = [
    ...getPrimaryColumns({ applicationId, objectType }),
    {
      Header: renderHeaderCell(t<string>('labels.type')),
      accessor: 'type',
      Cell,
    },
    ...getCommonMetadataColumns(),
  ];
  return (
    <BifrostTable
      dataTestId={dataTestId}
      className={classes.table}
      data={data}
      columns={columns}
    />
  );
};

const StandardsTable: Component<TableProps> = ({
  dataTestId,
  data,
  applicationId,
  objectType,
}) => {
  const classes = useStyles();
  const columns: Column<RowData>[] = [
    ...getPrimaryColumns({ applicationId, objectType }),
    ...getCommonMetadataColumns(),
  ];
  return (
    <BifrostTable
      dataTestId={dataTestId}
      className={classes.table}
      data={data}
      columns={columns}
    />
  );
};

const ThicknessObjectsTable: Component<TableProps> = ({
  dataTestId,
  data,
  applicationId,
  objectType,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const columns: Column<RowData>[] = [
    ...getPrimaryColumns({ applicationId, objectType }),
    {
      Header: renderHeaderCell(t<string>('labels.assortment')),
      accessor: 'assortment',
      Cell,
    },
    ...getCommonMetadataColumns(),
  ];
  return (
    <BifrostTable
      dataTestId={dataTestId}
      className={classes.table}
      data={data}
      columns={columns}
    />
  );
};

const TrialsTable: Component<TableProps> = ({
  dataTestId,
  data,
  applicationId,
  objectType,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const columns: Column<RowData>[] = [
    ...getPrimaryColumns({ applicationId, objectType }),
    {
      Header: renderHeaderCell(t<string>('labels.substrate')),
      accessor: 'substrate',
      Cell,
    },
    ...getCommonMetadataColumns(),
  ];
  return (
    <BifrostTable
      dataTestId={dataTestId}
      className={classes.table}
      data={data}
      columns={columns}
    />
  );
};

const ObjectTable: Component<TableProps> = ({
  dataTestId,
  data,
  objectType,
  applicationId,
  handleRowClick,
}) => {
  const classes = useStyles();
  switch (objectType) {
    case 'assortments': return (
      <AssortmentTable
        dataTestId={dataTestId}
        data={data}
        handleRowClick={handleRowClick}
        objectType={objectType}
        applicationId={applicationId}
      />
    );
    case 'recipes': return (
      <RecipesTable
        dataTestId={dataTestId}
        data={data}
        handleRowClick={handleRowClick}
        objectType={objectType}
        applicationId={applicationId}
      />
    );
    case 'substrates': return (
      <SubstratesTable
        dataTestId={dataTestId}
        data={data}
        handleRowClick={handleRowClick}
        objectType={objectType}
        applicationId={applicationId}
      />
    );
    case 'standards': return (
      <StandardsTable
        dataTestId={dataTestId}
        data={data}
        handleRowClick={handleRowClick}
        objectType={objectType}
        applicationId={applicationId}
      />
    );
    case 'thicknessobjects': return (
      <ThicknessObjectsTable
        dataTestId={dataTestId}
        data={data}
        handleRowClick={handleRowClick}
        objectType={objectType}
        applicationId={applicationId}
      />
    );
    case 'trials': return (
      <TrialsTable
        dataTestId={dataTestId}
        data={data}
        handleRowClick={handleRowClick}
        objectType={objectType}
        applicationId={applicationId}
      />
    );
    default: return (
      <BifrostTable
        dataTestId={dataTestId}
        className={classes.table}
        data={data}
        columns={getPrimaryColumns({ objectType, applicationId })}
      />
    );
  }
};

type ObjectMeta = { applicationId?: string, objectId?: string, objectType?: WorkspaceObject };

const dataTestId = 'data-import-workspace';
const Workspace: Component<ClassNameProps> = (className) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const {
    workspace,
    error,
    isLoading,
    isEmpty,
    applicationId,
  } = useContext(WorkspaceContext);

  const [objectMeta, setObjectMeta] = useState<ObjectMeta>(
    { applicationId: undefined, objectId: undefined, objectType: undefined },
  );
  const [
    workspaceObject,
    workspaceObjectError,
    workspaceObjectLoading,
  ] = useWorkspaceObject(
    objectMeta.applicationId,
    objectMeta.objectId,
    objectMeta.objectType,
  );

  useEffect(() => {
    setObjectMeta({ applicationId: undefined, objectId: undefined, objectType: undefined });
  }, [isLoading]);

  if (workspaceObjectError) {
    showToast(
      t('messages.workspaceObjectLoadingError', {
        message: error?.message,
        objectType: objectMeta.objectType,
      }),
      'error',
    );
  }

  if (error) {
    return <Panel><Body>{t('messages.workspaceLoadingError', { message: error?.message })}</Body></Panel>;
  }

  return (
    <div className={clsx(classes.root, className)}>
      <Panel data-testid={`${dataTestId}-browser`} className={classes.workspaceBrowser}>
        <Title>{t('titles.WorkspaceBrowser')}</Title>
        <LoadingContainer dataTestId={`${dataTestId}-browser-loading`} fetching={isLoading}>
          {isEmpty && (
            <Panel>
              <Body data-testid={`${dataTestId}-browser-empty`}>{t('messages.workspaceIsEmpty')}</Body>
            </Panel>
          )}
          <div data-testid={`${dataTestId}-browser-objects`} className={classes.workspaceObjectsContainer}>
            {workspace
              && !isEmpty
              && (Object.keys(workspace) as WorkspaceObject[]).map((object) => {
                const value = workspace[object];
                const objectTestID = `${makeShortName(`${dataTestId}-browser-object`)}-${object.toLowerCase()}`;
                let translatedObject: string;
                switch (object) {
                  case 'assortments': translatedObject = t('labels.assortments'); break;
                  case 'recipes': translatedObject = t('labels.recipes'); break;
                  case 'standards': translatedObject = t('labels.standards'); break;
                  case 'substrates': translatedObject = t('labels.substrates'); break;
                  case 'thicknessobjects': translatedObject = t('labels.thicknessObjects'); break;
                  case 'trials': translatedObject = t('labels.trials'); break;
                  default: translatedObject = object;
                }
                return (
                  <div
                    data-testid={objectTestID}
                    key={object}
                    className={classes.workspaceObjects}
                  >
                    <Subtitle data-testid={`${objectTestID}-subtitle`} className={classes.tableHeading}>
                      {translatedObject.toUpperCase()}
                    </Subtitle>
                    {value && value.length > 0 ? (
                      <ObjectTable
                        dataTestId={`${objectTestID}-table`}
                        data={value}
                        objectType={object}
                        applicationId={applicationId}
                        handleRowClick={(appId, id, type) => setObjectMeta({
                          applicationId: appId,
                          objectId: id,
                          objectType: type,
                        })}
                      />
                    ) : (
                      <Body data-testid={`${objectTestID}-empty`}>
                        {t('messages.workspaceEmptyObject', {
                          objects: capitalize(object),
                        })}
                      </Body>
                    )}
                  </div>
                );
              })}
          </div>
        </LoadingContainer>
      </Panel>
      <Panel data-testid={`${dataTestId}-object-details`} className={classes.objectDetailsContainer}>
        <LoadingContainer data-testid={`${dataTestId}-loading-object-details`} fetching={workspaceObjectLoading}>
          {workspaceObject && (
            <AssortmentsView assortment={workspaceObject as Assortment} />
          )}
        </LoadingContainer>
      </Panel>
    </div>
  );
};

export default Workspace;
