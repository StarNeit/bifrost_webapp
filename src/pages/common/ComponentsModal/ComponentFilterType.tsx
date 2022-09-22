import { Chip, makeStyles, Paper } from '@material-ui/core';
import { useState } from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    padding: theme.spacing(0.25),
    backgroundColor: theme.palette.action.active,
    maxWidth: 360,
    height: theme.spacing(4),
  },
  chipRoot: {
    marginRight: theme.spacing(0.25),
    backgroundColor: 'transparent',
    color: theme.palette.text.disabled,
    fontSize: theme.spacing(1.5),
    borderRadius: theme.spacing(0.5),
    height: 'unset',

    '&:focus': {
      backgroundColor: theme.palette.action.active,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.active,
    },
  },
  chipLabel: {
    padding: theme.spacing(0.75),
    color: 'inherit',
  },
  selected: {
    backgroundColor: theme.palette.action.active,
    color: theme.palette.primary.main,
  },
}));

type Props = {
    types: string[];
    onChange: (newSelection: string[]) => void;
    filter: string[];
};

const ComponentFilterType = ({ types, onChange, filter }: Props) => {
  const classes = useStyles();
  const [selected, setSelected] = useState<string[]>(filter);

  const handleType = (selectedType: string) => {
    let newSelectedData: string[];
    if (selected.includes(selectedType)) {
      newSelectedData = Object.assign([], selected);
      const index = newSelectedData.indexOf(selectedType);
      newSelectedData.splice(index, 1);
      setSelected(newSelectedData);
    } else {
      newSelectedData = [...selected, selectedType];
      setSelected(newSelectedData);
    }
    onChange(newSelectedData);
  };

  return (
    <Paper className={classes.root}>
      {types?.map((type) => (
        <Chip
          key={type}
          label={type}
          classes={{
            root: classes.chipRoot,
            label: classes.chipLabel,
          }}
          className={selected?.includes(type) ? classes.selected : ''}
          onClick={() => handleType(type)}
        />
      ))}
    </Paper>
  );
};

export default ComponentFilterType;
