import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import { Component } from '../../../../types/component';
import { WorkspaceEntry } from '../../../../types/cdis';
import { Job } from '../../../../types/dms';
import ColorSquare from '../../../../components/ColorSquare';
import { Body } from '../../../../components/Typography';
import Table, { Column } from '../../../../components/Table';
import { hexToRGB } from '../../../../utils/hexToRGB';
import { formatDate } from '../../../../utils/formatDate';

const useStyles = makeStyles((theme) => ({
  table: {
    borderRadius: theme.spacing(0.75),
    overflowY: 'auto',
  },
  colorSquare: {
    width: theme.spacing(10),
    minHeight: theme.spacing(4.125),
  },
  iconButton: {
    borderRadius: theme.spacing(0.75),
    padding: theme.spacing(1),
    '& svg': {
      color: theme.palette.text.primary,
      fontSize: theme.spacing(2),
    },

    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
}));

const isColorMultiAngle = (
  color: { [geometry:string]: unknown },
): boolean => Object.keys(color).some(
  (geometry: string) => geometry === '45as45',
);

type Props = {
  entries: WorkspaceEntry[];
  onEntrySelected?: (standard: { id: string, name: string }) => void;
};

const FileBrowserTable: Component<Props> = ({
  entries,
  onEntrySelected,
}) => {
  const { t } = useTranslation();
  const [selectedRowId, setSelectedRowId] = useState<string>();
  const classes = useStyles();
  const theme = useTheme();

  const columns = [
    {
      id: 'id',
      headerText: 'ID',
      inlineStyle: {
        display: 'none',
      },
    },
    {
      id: 'preview',
      headerText: t('labels.preview'),
      cellComponent: ({ simulation, isMultiAngle }: Job) => {
        return (
          <ColorSquare
            colors={simulation}
            isGradient={isMultiAngle}
            className={classes.colorSquare}
          />
        );
      },
    },
    {
      id: 'name',
      headerText: t('labels.name'),
      inlineStyle: {
        minWidth: theme.spacing(24),
      },
    },
    {
      id: 'dateCreated',
      headerText: t('labels.dateCreated'),
      cellComponent: ({ dateCreated }: Job) => (
        <Body>{formatDate(dateCreated, 'dd MMM yyyy HH:mm:ss')}</Body>
      ),
      inlineStyle: {
        minWidth: theme.spacing(24),
      },
    },
  ];

  const rowStyle = {
    padding: theme.spacing(0, 0.5),
    height: theme.spacing(5.75),
    cursor: 'pointer',
  };

  const data: Job[] = entries?.map((entry) => {
    const isMultiAngle = isColorMultiAngle(entry.previewColors ?? {});
    const rgbs = Object.values(entry.previewColors ?? {}).map(
      (color) => ({ rgb: hexToRGB(color) }),
    );
    return {
      id: entry.id,
      dateCreated: entry.creationDateTime ?? '',
      name: entry.name,
      simulation: rgbs,
      isMultiAngle,
    };
  });

  return (
    <>
      <Table
        testId="file-browser-colorants-table"
        initialColumns={columns as Column[]}
        data={data.slice(0, 100)}
        className={classes.table}
        selectedRowId={selectedRowId}
        rowStyle={rowStyle}
        onRowClick={(row, index) => {
          onEntrySelected?.(entries[index]);
          setSelectedRowId(entries[index].id);
        }}
        isNoRowStyle
      />
    </>
  );
};

export default FileBrowserTable;
