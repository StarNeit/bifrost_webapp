import { makeStyles } from '@material-ui/core/styles';
import { RGB } from '@xrite/colorimetry-js';
import clsx from 'clsx';

import { Component, ClassNameProps } from '../../../../types/component';
import { getCSSColorString } from '../../../../utils/utils';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    marginBottom: theme.spacing(2),
  },
  smallRoot: {
    display: 'flex',
    margin: theme.spacing(0, -4, 0),
    height: theme.spacing(4),
  },
  marginColumn: {
    marginRight: theme.spacing(0.5),
  },
  column: {
    flexBasis: '50%',
  },
  columnSmall: {
    borderColor: 'white',
    borderRadius: theme.spacing(0.5),
    border: '2px solid',
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'column',
  },
  cell: {
    height: theme.spacing(3),
    background: 'blue',
  },
  small: {
    flex: 1,
  },
}));

type Props = ClassNameProps & {
  colors: RGB[],
  small?: boolean,
  isStandard?: boolean,
}

const StandardColors: Component<Props> = ({
  colors,
  className,
  small = false,
  isStandard = false,
}) => {
  const classes = useStyles();

  return (
    <div className={clsx(classes.root, {
      [classes.smallRoot]: small,
      [classes.marginColumn]: isStandard,
    })}
    >
      <div className={clsx(classes.column, className, {
        [classes.columnSmall]: small,
      })}
      >
        {colors.map((item, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={clsx({
              [classes.small]: small,
              [classes.cell]: !small,
            })}
            style={{
              backgroundColor: getCSSColorString(item),
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default StandardColors;
