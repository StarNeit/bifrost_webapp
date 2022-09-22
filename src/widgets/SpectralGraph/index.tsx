import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  makeStyles,
  useTheme,
} from '@material-ui/core';
import { EChartsReactProps } from 'echarts-for-react';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';

import { undoIcon, zoomIcon, saveIcon } from '../../assets/SpectralGraphIcons';
import { linspace } from '../../utils/utils';
import { Component } from '../../types/component';

type Series = EChartsReactProps['option']['series'];

const useStyles = makeStyles((theme) => ({
  container: {
    minHeight: theme.spacing(34),
    padding: theme.spacing(2, 1),
  },
}));

type Props = {
  dataTestId?: string,
  spectralData?: {
    id?: string;
    name: string,
    wavelengths: number[],
    spectralValues: number[],
  }[] | null,
  showLegend: boolean,
  scaleYaxis: boolean,
  animation?: boolean,
  legendData?: {
    name: string;
  }[];
};

const SpectralGraph: Component<Props> = ({
  dataTestId,
  spectralData,
  legendData,
  showLegend = true,
  scaleYaxis = true,
  animation = true,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const loading = false;

  let startWavelength = 10000;
  let endWavelength = 0;

  (spectralData || []).forEach((data) => {
    startWavelength = Math.min(startWavelength, data.wavelengths[0]);
    endWavelength = Math.max(endWavelength, data.wavelengths[data.wavelengths.length - 1]);
  });

  const xAxisLabels = linspace(startWavelength, 10, endWavelength);

  const builtData = useMemo(() => spectralData?.map(({ name, wavelengths, spectralValues }) => {
    const data = wavelengths.map((x, index) => [x, spectralValues[index]]);

    const isSelectedStandardOrSample = (!legendData?.length)
      || legendData?.some((ld) => ld.name === name);

    return ({
      name,
      type: 'line',
      symbol: 'circle',
      symbolSize: theme.spacing(0.75),
      data,
      zlevel: isSelectedStandardOrSample ? 1 : 0,
      lineStyle: {
        width: isSelectedStandardOrSample ? 3 : 1,
        color: isSelectedStandardOrSample ? null : theme.palette.grey[700],
      },
      itemStyle: {
        color: isSelectedStandardOrSample ? null : theme.palette.grey[700],
      },
      tooltip: {
        // depending on the graph type the formatter params are different
        // but seriesName and data are common for every type
        formatter: (params: {
          seriesName: string,
          data: [string, number],
          [key: string]: unknown
        }) => {
          return `${params.seriesName}: ${params.data[0]} -> ${(params.data[1] * 100).toFixed(0)}%`;
        },
      },
    });
  }), [JSON.stringify(spectralData), legendData]);

  if (!builtData) return null;

  return (
    <ReactEchartsCore
      data-testid={dataTestId}
      className={classes.container}
      echarts={echarts}
      notMerge
      showLoading={loading}
      opts={{ renderer: 'svg' }}
      style={{ height: '100%', width: '100%' }}
      option={{
        animation,
        tooltip: {
          trigger: 'item',
          confine: true,
          appendToBody: true,
        },
        legend: {
          show: showLegend,
          top: 0,
          right: 80,
          type: 'scroll',
          itemGap: 20,
          height: 30,
          pageIconColor: theme.palette.surface[4],
          pageIconInactiveColor: theme.palette.action.disabled,
          pageTextStyle: { color: theme.palette.text.secondary },
          textStyle: { color: theme.palette.text.secondary },
          data: legendData,
        },
        toolbox: {
          itemSize: theme.spacing(2),
          feature: {
            dataZoom: {
              yAxisIndex: 'none',
              iconStyle: {
                borderColor: 'rgba(0, 0, 0, 0)',
                color: theme.palette.text.primary,
              },
              icon: {
                zoom: zoomIcon,
                back: undoIcon,
              },
            },
            saveAsImage: {
              title: 'Save',
              type: 'png',
              iconStyle: {
                borderColor: 'rgba(0, 0, 0, 0)',
                color: theme.palette.text.primary,
              },
              icon: saveIcon,
            },
          },
        },
        title: {
          show: false,
          text: t('labels.spectralGraph'),
          textStyle: { color: theme.palette.text.secondary },
        },
        grid: {
          containLabel: true,
          left: theme.spacing(1),
          right: theme.spacing(4),
          top: showLegend ? theme.spacing(9) : theme.spacing(4),
          bottom: theme.spacing(7),
        },
        xAxis: {
          data: xAxisLabels,
          type: 'value',
          min: startWavelength,
          max: endWavelength,
          axisTick: {
            alignWithLabel: true,
          },
        },
        yAxis: {
          show: true,
          type: 'value',
          min: (value: { min: number, max: number }) => {
            if (scaleYaxis) {
              return value.min.toFixed(2);
            }
            return 0;
          },
          max: (value: { min: number, max: number }) => {
            if (scaleYaxis) {
              return (value.max + 0.1).toFixed(1);
            }
            return 1;
          },
          scale: scaleYaxis,
          axisLabel: {
            formatter: (value: number) => `${(value * 100).toFixed(0)}%`,
          },
        },
        dataZoom: [{
          type: 'inside',
          minValueSpan: 2,
          start: 0,
          end: 100,
        }, {
          start: 0,
          minValueSpan: 2,
          end: 100,
        }],
        textStyle: {
          color: theme.palette.text.secondary,
        },
        series: builtData as Series,
        animationDuration: 200,
      }}
    />
  );
};

export default SpectralGraph;
