import { makeStyles } from '@material-ui/core/styles';
import { RGB } from '@xrite/colorimetry-js';

import clsx from 'clsx';
import { Component } from '../../types/component';
import { getCSSColorString } from '../../utils/utils';
import { Tiny } from '../../components/Typography';
import { useSampleId } from '../../data/common';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3.5, 4),
    height: '100%',
    background: ({ background }: { background: string }) => (background),
    color: ({ background }: { background: string }) => (
      background !== 'unset'
        ? theme.palette.getContrastText(background)
        : background
    ),
  },
  wrapper: {
    display: 'flex',
    height: '100%',
    width: '100%',
  },
  sampleConditions: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: theme.spacing(1),
  },
  swatchTitle: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  swatchWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  swatchRow: {
    display: 'flex',
    flex: 1,
    marginTop: 1,
  },
  sampleNames: {
    display: 'flex',
    whiteSpace: 'nowrap',
  },
  column: {
    display: 'flex',
    flex: 1,
    width: 20,
    height: 20,
    flexDirection: 'column',
    textAlign: 'center',
  },
  angleColumn: {
    flex: 0.8,
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 0,
    overflow: 'hidden',
  },
  colorContainer: {
    flex: '1 1 auto',
    marginLeft: 1,
  },
  clickable: {
    cursor: 'pointer',
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
}));

type Props = {
  swatchColors?: (RGB[])[],
  isMultiAngleStandard: boolean,
  sampleNames?: string[],
  sampleIds?: string[],
  sampleConditions?: string[],
  isMultiSample: boolean,
  background: string,
}

const SwatchColors: Component<Props> = ({
  swatchColors = [],
  sampleNames = [],
  sampleIds = [],
  sampleConditions = [],
  background,
  isMultiSample,
}) => {
  const classes = useStyles({ background });
  const { setSampleId } = useSampleId();

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <div className={classes.sampleConditions}>
          {
            sampleConditions.map((condition, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={`sample-condition-${index}`}
                className={classes.cell}
              >
                <Tiny>{condition}</Tiny>
              </div>
            ))
          }
        </div>
        <div className={classes.swatchWrapper}>
          <div className={classes.sampleNames}>
            {swatchColors.length > 0 && sampleNames.map((name, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={`sample-name-${index}`}
                className={classes.cell}
              >
                <Tiny className={classes.swatchTitle}>{name}</Tiny>
              </div>
            ))}
          </div>
          {swatchColors.map((row, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className={classes.swatchRow} key={index}>
              {
                row.map((color, idex) => (
                  <div
                    role="none"
                    // eslint-disable-next-line react/no-array-index-key
                    key={`color-standard-${index}-${idex}`}
                    className={clsx(classes.cell, { [classes.clickable]: isMultiSample })}
                    style={{
                      backgroundColor: color ? getCSSColorString(color) : '#000000',
                    }}
                    onClick={() => setSampleId(sampleIds[idex])}
                  />
                ))
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwatchColors;
