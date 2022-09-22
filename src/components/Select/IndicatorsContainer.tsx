import { components } from 'react-select';
import { CircularProgress, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  spinnerContainer: {
    display: 'flex',
    padding: theme.spacing(0.75),
  },
  childrenContainer: {
    display: 'flex',
  },
}));

const IndicatorsContainer: typeof components.IndicatorsContainer = ({
  children,
  selectProps,
  ...props
}) => {
  const classes = useStyles();

  return (
    <components.IndicatorsContainer selectProps={selectProps} {...props}>
      {selectProps.showSpinner && (
        <div className={classes.spinnerContainer}>
          <CircularProgress size={20} />
        </div>
      )}
      <div className={classes.childrenContainer} data-testid="indicator-container-icons">
        {children}
      </div>
    </components.IndicatorsContainer>
  );
};

export default IndicatorsContainer;
