import { components } from 'react-select';
import { makeStyles, FormControl, InputLabel } from '@material-ui/core';

const useStyles = makeStyles({
  formControl: {
    display: 'block',
  },
  inputLabel: {
    position: 'relative',
  },
});

const SelectContainer: typeof components.SelectContainer = ({
  children,
  ...props
}) => {
  const { selectProps } = props;
  const classes = useStyles();

  return (
    <components.SelectContainer {...props}>
      <FormControl className={classes.formControl}>
        <InputLabel shrink className={classes.inputLabel}>{selectProps?.label}</InputLabel>
      </FormControl>
      {children}
    </components.SelectContainer>
  );
};

export default SelectContainer;
