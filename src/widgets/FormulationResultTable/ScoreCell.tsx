import { makeStyles } from '@material-ui/core/styles';
import { Body } from '../../components/Typography';
import { Component } from '../../types/component';
import { useDefaultPrecision } from '../../utils/utils';

interface StyleProps {
  color: string,
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    height: '100%',
  },
  dot: {
    width: theme.spacing(1),
    height: theme.spacing(1),
    backgroundColor: (props: StyleProps) => (props.color),
    display: 'inline-block',
    borderRadius: '50%',
    marginRight: theme.spacing(1),
  },
  cellValue: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
}));

const dotColors = ['#90d664', '#ffad33', '#f4675d'];

type Props = {
  value: number,
};

const ScoreCell: Component<Props> = ({ value: score }) => {
  const colorIndex = Math.floor(score);
  const classes = useStyles({ color: dotColors[colorIndex] });
  const { round, toString } = useDefaultPrecision();

  return (
    <Body data-testid="score" data-testcolorindex={colorIndex} className={classes.root}>
      <span className={classes.dot} />
      <span className={classes.cellValue}>{round(score, toString)}</span>
    </Body>
  );
};

export default ScoreCell;
