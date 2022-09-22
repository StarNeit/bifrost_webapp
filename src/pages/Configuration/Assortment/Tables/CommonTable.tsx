import clsx from 'clsx';
import {
  makeStyles,
  withStyles,
} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Checkbox from '@material-ui/core/Checkbox';
import { useTranslation } from 'react-i18next';

import TableInformation from '../TableInformation';
import { Component } from '../../../../types/component';

const useStyles = makeStyles((theme) => ({
  value: {
    background: theme.palette.surface[2],
    height: theme.spacing(4.25),
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.spacing(1),
    width: theme.spacing(10),
    padding: theme.spacing(0.5, 1.5),
  },
  lgValue: {
    width: theme.spacing(27.25),
  },
}));

const Cell = withStyles((theme) => ({
  root: {
    backgroundColor: 'transparent',
  },
  head: {
    padding: theme.spacing(0.875, 0.75),
    fontSize: theme.spacing(1.5),
    color: theme.palette.text.secondary,
  },
  body: {
    padding: theme.spacing(0.25, 0.75),
    color: theme.palette.text.primary,
    height: 56,
  },
}))(TableCell);

type Props = {
  title: string,
};

const CommonTable: Component<Props> = ({ title }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div>
      <TableInformation title={title} isEditable />

      <Table>
        <TableHead>
          <TableRow>
            <Cell>{t('labels.exclude')}</Cell>
            <Cell>{t('labels.name')}</Cell>
            <Cell>{t('labels.price')}</Cell>
          </TableRow>
        </TableHead>
        <TableBody>
          {new Array(5).fill(0).map((index) => (
            <TableRow key={index}>
              <Cell style={{ width: 84 }}>
                <Checkbox size="small" disableRipple color="primary" />
              </Cell>
              <Cell>
                <div className={clsx(classes.value, classes.lgValue)}>
                  Cleara1
                </div>
              </Cell>
              <Cell>
                <div className={classes.value}>
                  0.05
                </div>
              </Cell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CommonTable;
