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
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { useTranslation } from 'react-i18next';

import TableInformation from '../TableInformation';
import ColorSquare from '../../../../components/ColorSquare';
import IconSquareButton from '../../../../components/IconSquareButton';

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: theme.spacing(71.5),
  },
  color: {
    width: theme.spacing(5),
    marginLeft: theme.spacing(1.5),
    padding: 1,
  },
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
  actions: {
    '& button:first-child': {
      marginRight: theme.spacing(1.75),
    },
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

const FixedTable = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <TableInformation />
      <Table>
        <TableHead>
          <TableRow>
            <Cell align="center" style={{ width: 75 }}>{t('labels.preview')}</Cell>
            <Cell>{t('labels.type')}</Cell>
            <Cell>{t('labels.excludeName')}</Cell>
            <Cell>{t('labels.price')}</Cell>
            <Cell>{t('labels.actions')}</Cell>
          </TableRow>
        </TableHead>
        <TableBody>
          {new Array(5).fill(0).map((index) => (
            <TableRow key={index}>
              <Cell align="center">
                <ColorSquare
                  colors={[
                    { rgb: { r: 204, g: 71, b: 249 } },
                  ]}
                  flexibleWidth
                  className={classes.color}
                />
              </Cell>
              <Cell style={{ width: 84 }}>
                Binder
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
              <Cell className={classes.actions}>
                <IconSquareButton icon={FileCopyIcon} />
                <IconSquareButton icon={DeleteIcon} />
              </Cell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FixedTable;
