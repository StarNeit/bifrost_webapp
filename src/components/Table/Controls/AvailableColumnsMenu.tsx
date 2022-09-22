import {
  FormGroup, FormControlLabel, Checkbox, makeStyles,
} from '@material-ui/core';

import { makeShortName } from '../../../../cypress/support/util/selectors';
import { scrollbars } from '../../../theme/components';
import { TableHeaderOption } from './OptionsMenu';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 0,
    width: '100%',
    maxHeight: theme.spacing(26.25),
    overflowY: 'auto',
    flexWrap: 'nowrap',
    ...scrollbars(theme),
  },
  label: {
    width: '100%',
    margin: 0,
    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
}));

type Props = {
  availableColumns: Array<TableHeaderOption & {
    checked: boolean;
  }>,
  dataTestId?: string,
  handleColumnChecked?: (columnId: string) => void,
  handleColumnUnchecked?: (columnId: string) => void,
}

const AvailableColumnsMenu: React.ComponentType<Props> = ({
  dataTestId,
  availableColumns,
  handleColumnChecked,
  handleColumnUnchecked,
}) => {
  const classes = useStyles();

  const handleChecked = (checked: boolean, columnId: string) => {
    if (checked) {
      handleColumnChecked?.(columnId);
      return;
    }

    handleColumnUnchecked?.(columnId);
  };

  return (
    <FormGroup className={classes.root}>
      {availableColumns.map((column) => {
        return (
          <FormControlLabel
            key={column.id}
            data-testid={`${makeShortName(dataTestId)}-${column.id.toLowerCase()}`}
            control={(
              <Checkbox
                color="primary"
                data-testid={`${makeShortName(dataTestId)}-${column.id.toLowerCase()}-checkbox`}
                checked={column.checked}
                onChange={(_, checked) => handleChecked(checked, column.id)}
                name={column.label}
              />
          )}
            className={classes.label}
            label={column.label}
            disabled={column.disableToggleHide}
          />
        );
      })}
    </FormGroup>
  );
};

export default AvailableColumnsMenu;
