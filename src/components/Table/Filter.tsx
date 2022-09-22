import { makeStyles, Input } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { useTranslation } from 'react-i18next';
import { Component } from '../../types/component';

const useStyles = makeStyles((theme) => ({
  filterContainer: {
    padding: theme.spacing(1),
  },
}));

type Props = {
  filterBy: (arg: string) => void,
  filterText: string,
  filterFunction?: <T>(rowData: T, filterText: string) => T,
};

const Filter: Component<Props> = ({
  filterBy,
  filterText,
  filterFunction = null,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    filterFunction && (
      <div className={classes.filterContainer}>
        <Input
          placeholder={t('labels.search')}
          startAdornment={<SearchIcon />}
          value={filterText}
          onChange={(event) => filterBy(event.target.value)}
        />
      </div>
    )
  );
};

export default Filter;
