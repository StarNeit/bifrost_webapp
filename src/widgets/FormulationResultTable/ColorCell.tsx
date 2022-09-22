import { makeStyles } from '@material-ui/core';
import { RGB } from '@xrite/colorimetry-js';
import { Component } from '../../types/component';
import ColorSquare from '../../components/ColorSquare';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  colorSquare: {
    minHeight: theme.spacing(4.125),
    width: theme.spacing(6),
  },
}));

interface Props {
  value?: RGB[];
}

const ColorCell: Component<Props> = ({ value }) => {
  const classes = useStyles();

  if (!value) return null;

  const gradientColors = value.map(([r, g, b]) => ({ rgb: { r, g, b } }));

  return (
    <div className={classes.root}>
      <ColorSquare
        colors={gradientColors}
        className={classes.colorSquare}
      />

    </div>
  );
};

export default ColorCell;
