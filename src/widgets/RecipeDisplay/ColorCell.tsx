import { makeStyles } from '@material-ui/core';
import { RGB } from '@xrite/colorimetry-js';
import ColorSquare from '../../components/ColorSquare';

const useStyles = makeStyles({
  cell: {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
});

function ColorCell<T extends { value: RGB; }>({ value }: T) {
  const classes = useStyles();

  if (!value) return <></>;

  return (
    <div className={classes.cell}>
      <ColorSquare
        small
        noBorder
        colors={[{ rgb: { r: value[0], g: value[1], b: value[2] } }]}
      />
    </div>
  );
}

export default ColorCell;
