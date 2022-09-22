import { CSSProperties } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';

import { Component } from '../types/component';

type ColorProps = {
  gradient: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: theme.spacing(4.5),
    borderRadius: theme.spacing(0.5),
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
  },
  colorContainer: {
    flex: '1 1 auto',
    borderRadius: theme.spacing(0.5),
  },
  colorStripe: {
    flex: '1 1 auto',
    border: '1px solid',
    borderColor: theme.palette.surface[2],
  },
  noBorder: {
    border: 'none',
  },
  small: {
    minHeight: theme.spacing(2.5),
    height: theme.spacing(2.5),
    minWidth: theme.spacing(6),
    width: theme.spacing(6),
    flexGrow: 0,
  },
  flexibleWidth: {
    display: 'flex',
    flexDirection: 'column',
    width: 'unset',
    flex: '1 1 0',
  },
  gradient: (props: ColorProps) => ({
    background: props.gradient ?? theme.palette.surface[2],
  }),
}));

type Props = {
  colors: {
    rgb: {
      r: number,
      g: number,
      b: number,
    },
  }[],
  noBorder?: boolean,
  small?: boolean,
  isGradient?: boolean,
  flexibleWidth?: boolean,
  title?: string,
  className?: string,
  style?: CSSProperties,
};

const ColorSquare: Component<Props> = ({
  colors,
  noBorder,
  small,
  isGradient,
  flexibleWidth,
  style,
  title = null,
  className = '',
}) => {
  let gradient = 'linear-gradient(180deg,';
  if (isGradient && colors) {
    const ratio = Math.round(100 / (colors.length - 1));
    gradient = gradient.concat(colors.map((c, idx) => ` rgba(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}, 1) ${idx * ratio}%`).join(', '));
    gradient = gradient.concat(')');
  }
  const colorProps = { gradient };
  const classes = useStyles(colorProps);

  return (
    <div
      data-testid="color-square"
      className={clsx({
        [classes.noBorder]: true,
        [classes.flexibleWidth]: flexibleWidth,
      })}
      style={style}
    >
      {title}
      <div
        className={clsx({
          [classes.root]: true,
          [classes.noBorder]: noBorder,
          [className]: className,
          [classes.small]: small,
          [classes.flexibleWidth]: flexibleWidth,
        })}
      >
        {isGradient ? (
          <div
            className={clsx(classes.colorContainer, classes.gradient)}
          />
        ) : (
          colors.map((color, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={classes.colorStripe}
              style={{ backgroundColor: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})` }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ColorSquare;
