import { useMemo, useRef, useState } from 'react';
import {
  makeStyles,
  useTheme,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { Tolerance } from '@xrite/cloud-formulation-domain-model';
import { GeoComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsReactProps } from 'echarts-for-react';

import { Component } from '../../types/component';
import { linspace, useDefaultPrecision } from '../../utils/utils';

import { coloredBackground, coloredBorders } from './maps';

type Series = EChartsReactProps['option']['series'];
type RenderItem = globalThis.echarts.EChartOption.SeriesCustom.RenderItem;

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2, 1),
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    overflowY: 'hidden',
  },
  content: {
    display: 'flex',
    width: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  square: {
    minWidth: theme.spacing(22),
    minHeight: theme.spacing(22),
    'aspect-ratio': 1,
    maxHeight: '100%',
  },
  column: {

  },
  abPlot: {
    padding: theme.spacing(2, 1),
    'aspect-ratio': 1,
    height: 'auto',
    maxHeight: '100%',
    boxSizing: 'content-box',
  },
  lPlot: {
    padding: theme.spacing(2, 1, 4, 1),
  },
}));

export type ColorPlotEntry = {
  name: string,
  L: number,
  a: number,
  b: number,
  C: number,
  h: number,
}

type Props = {
  dataTestId?: string,
  selectedStandardName?: string,
  standardColors: ColorPlotEntry[],
  samples: {
    name: string,
    id: string,
    colors: ColorPlotEntry[],
  }[],
  tolerances: Tolerance[],
  animation?: boolean,
  showLegend?: boolean,
  shouldUseColoredBackground: boolean,
  selectedStandardId?: string,
  selectedSampleId?: string,
  setSelectedId?: (id: string) => void,
};

const ColorPlot: Component<Props> = ({
  dataTestId,
  selectedStandardName,
  animation = true,
  standardColors,
  samples,
  showLegend = true,
  tolerances,
  shouldUseColoredBackground,
  selectedStandardId,
  selectedSampleId,
  setSelectedId,
}) => {
  const { t } = useTranslation();
  const abPlotRef = useRef<HTMLDivElement>(null);
  const classes = useStyles();
  const theme = useTheme();
  const { round } = useDefaultPrecision();

  const selectedSampleName = useRef<string>();
  const loading = false;

  const aAxisLabels = linspace(-3.5, 0.5, 3.5);
  const bAxisLabels = linspace(-3.5, 0.5, 3.5);
  const lAxisLabels = linspace(-3.5, 0.5, 3.5);

  const [xRange, setXRange] = useState({
    min: aAxisLabels[0],
    max: aAxisLabels[aAxisLabels.length - 1],
  });
  const [yRange, setYRange] = useState({
    min: bAxisLabels[0],
    max: bAxisLabels[bAxisLabels.length - 1],
  });

  echarts.use([GeoComponent, CanvasRenderer]);

  echarts.registerMap('colored-background', { svg: coloredBackground });
  echarts.registerMap('colored-borders', { svg: coloredBorders });

  const centerL = standardColors.length > 0 ? standardColors[0].L : 0;
  const centera = standardColors.length > 0 ? standardColors[0].a : 0;
  const centerb = standardColors.length > 0 ? standardColors[0].b : 0;

  const standardSeriesabData: [number, number][] = [];
  const standardSeriesLData: [number, number][] = [];

  const abTooltipFormatter = (params: {
    seriesName: string,
    data: [number, number],
  }) => {
    return `${params.seriesName}: a*: ${round(params.data[1] + centera)}, b*: ${round(params.data[0] + centerb)}`;
  };

  const abTooltip = {
    formatter: abTooltipFormatter,
  };

  const lTooltipFormatter = (params: {
    seriesName: string,
    data: [number, number],
  }) => {
    return `${params.seriesName}: L*: ${round(params.data[1] + centerL)}`;
  };

  const lTooltip = {
    formatter: lTooltipFormatter,
  };

  const sampleabSeries = samples.map((sampleData) => {
    if (sampleData.id === selectedSampleId) {
      selectedSampleName.current = sampleData.name;
    }
    return {
      type: 'scatter',
      id: `sample-${sampleData.id}-ab`,
      symbolSize: theme.spacing(2),
      data: [] as [number, number][],
      name: sampleData.name,
      tooltip: abTooltip,
      itemStyle: {
        color: 'darkgray',
        borderWidth: sampleData.id === selectedSampleId ? 6 : 2,
        borderColor: sampleData.id === selectedSampleId
          ? theme.palette.error.main
          : theme.palette.surface[2],
        borderType: 'solid',
      },
    };
  });

  const sampleLSeries = samples.map((sampleData) => {
    if (sampleData.id === selectedSampleId) {
      selectedSampleName.current = sampleData.name;
    }
    const isSelected = sampleData.id === selectedSampleId;
    return {
      type: 'scatter',
      id: `sample-${sampleData.id}-L`,
      symbolSize: theme.spacing(2),
      data: [] as [number, number][],
      name: sampleData.name,
      tooltip: lTooltip,
      itemStyle: {
        color: 'darkgray',
        borderWidth: isSelected ? 6 : 2,
        borderColor: isSelected
          ? theme.palette.error.main
          : theme.palette.surface[2],
        borderType: 'solid',
      },
    };
  });

  standardColors.forEach((standardColor, colorIndex) => {
    standardSeriesabData.push([standardColor.b - centerb, standardColor.a - centera]);
    standardSeriesLData.push([0.25, standardColor.L - centerL]);

    samples.forEach((sampleData, sampleIndex) => {
      const sampleColor = sampleData.colors[colorIndex];
      if (!sampleColor) return;
      sampleabSeries[sampleIndex]?.data.push([sampleColor.b - centerb, sampleColor.a - centera]);
      sampleLSeries[sampleIndex]?.data.push([0.25, sampleColor.L - centerL]);
    });
  });

  const standardSeriesab = {
    name: selectedStandardName ?? t('labels.standard'),
    type: 'scatter',
    id: `${selectedStandardId}-ab`,
    symbol: 'diamond',
    symbolSize: theme.spacing(3),
    data: standardSeriesabData,
    tooltip: abTooltip,
  };

  const standardSeriesL = {
    type: 'scatter',
    id: 'standard-L',
    name: standardSeriesab.name,
    symbol: 'diamond',
    symbolSize: theme.spacing(2),
    data: standardSeriesLData,
    tooltip: lTooltip,
  };

  const abSeries = [standardSeriesab, ...sampleabSeries] as Series;
  const lSeries = [standardSeriesL, ...sampleLSeries] as Series;

  const dLTolerance = tolerances.find(({ metric }) => metric.id === 'dL');
  const daTolerance = tolerances.find(({ metric }) => metric.id === 'da');
  const dbTolerance = tolerances.find(({ metric }) => metric.id === 'db');

  const lMax = dLTolerance?.upperLimit;
  const lMin = dLTolerance?.lowerLimit;

  const limitBoxStyle = {
    itemStyle: {
      color: '#FFFF00',
      opacity: 0.3,
    },
    silent: true,
  };

  if (lMax && lMin && lSeries) {
    const barStyle = {
      type: 'bar',
      stack: 'limit',
      barWidth: '100%',
      ...limitBoxStyle,
    };
    lSeries.push({
      id: 'limitL1',
      data: [[0.25, lMin]],
      ...barStyle,
    });
    lSeries.push({
      id: 'limitL2',
      data: [[0.25, lMax]],
      ...barStyle,
    });
  }

  const aMax = daTolerance?.upperLimit;
  const aMin = daTolerance?.lowerLimit;
  const bMax = dbTolerance?.upperLimit;
  const bMin = dbTolerance?.lowerLimit;

  if (aMax && aMin && bMax && bMin && abSeries) {
    const renderABBox: RenderItem = (params, api) => {
      if (!params.coordSys || !api.coord || !api.style) throw new Error('Wrong implementation');
      const bottomLeft = api.coord([aMin, bMax]);
      const topRight = api.coord([aMax, bMin]);
      const rectShape = echarts.graphic.clipRectByRect({
        x: bottomLeft[0],
        y: bottomLeft[1],
        width: topRight[0] - bottomLeft[0],
        height: topRight[1] - bottomLeft[1],
      }, {
        x: params.coordSys.x || 0,
        y: params.coordSys.y || 0,
        width: params.coordSys.width || 0,
        height: params.coordSys.height || 0,
      });
      return rectShape && {
        type: 'rect',
        shape: rectShape,
        style: api.style(),
      };
    };
    abSeries.push({
      type: 'custom',
      renderItem: renderABBox,
      data: [[0, 0]],
      ...limitBoxStyle,
    });
  }

  const handleSampleSelect = (e: {
    seriesId: string;
    [field: string]: unknown;
  }) => {
    if (!setSelectedId) return;
    // extracts the sample id by removing the prefix/suffix of the series id
    // eslint-disable-next-line no-useless-escape
    const clickedId = e.seriesId.replace(/(sample\-|\-L|\-ab)/gi, '');

    if (
      selectedStandardId
      && (clickedId === selectedStandardId || selectedSampleId === clickedId)
    ) {
      setSelectedId(selectedStandardId);
    } else {
      setSelectedId(clickedId);
    }
  };

  const zoomIn = () => {
    setXRange((oldValue) => ({
      min: oldValue.min + 1,
      max: oldValue.max - 1,
    }));
    setYRange((oldValue) => ({
      min: oldValue.min + 1,
      max: oldValue.max - 1,
    }));
  };

  const zoomOut = () => {
    setXRange((oldValue) => ({
      min: oldValue.min - 1,
      max: oldValue.max + 1,
    }));
    setYRange((oldValue) => ({
      min: oldValue.min - 1,
      max: oldValue.max + 1,
    }));
  };

  const getLegendData = () => {
    if (selectedSampleId) {
      return [{
        name: selectedStandardName ?? t('labels.standard'),
        icon: 'diamond',
      },
      {
        name: selectedSampleName.current,
        icon: 'circle',
      }];
    }
    return [{
      name: selectedStandardName ?? t('labels.standard'),
      icon: 'diamond',
    }];
  };
  const legendData = useMemo(getLegendData, [selectedStandardName, sampleabSeries]);

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <div className={classes.square} ref={abPlotRef}>
          <ReactEchartsCore
            data-testid={`${dataTestId}-ab`}
            className={classes.abPlot}
            echarts={echarts}
            notMerge
            style={{ width: '100%', height: 'auto' }}
            showLoading={loading}
            opts={{ renderer: 'svg' }}
            onEvents={{
              click: handleSampleSelect,
            }}
            option={{
              animation,
              geo: {
                map: shouldUseColoredBackground ? 'colored-background' : 'colored-borders',
                left: 44,
                top: 32,
                right: 8,
                bottom: 43,
              },
              toolbox: {
                show: true,
                showTitle: false,
                orient: 'horizontal',
                right: 0,
                feature: {
                  myZoomIn: {
                    show: xRange.min < -0.5 && xRange.max > 0.5,
                    title: 'Zoom in',
                    icon: 'path://M18.031 16.617L22.314 20.899L20.899 22.314L16.617 18.031C15.0237 19.3082 13.042 20.0029 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20.0029 13.042 19.3082 15.0237 18.031 16.617ZM16.025 15.875C17.2941 14.5699 18.0029 12.8204 18 11C18 7.132 14.867 4 11 4C7.132 4 4 7.132 4 11C4 14.867 7.132 18 11 18C12.8204 18.0029 14.5699 17.2941 15.875 16.025L16.025 15.875V15.875ZM10 10V7H12V10H15V12H12V15H10V12H7V10H10Z',
                    iconStyle: {
                      borderWidth: 0,
                      color: 'white',
                    },
                    onclick: zoomIn,
                  },
                  myZoomOut: {
                    show: true,
                    title: 'Zoom out',
                    icon: 'path://M18.031 16.617L22.314 20.899L20.899 22.314L16.617 18.031C15.0237 19.3082 13.042 20.0029 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20.0029 13.042 19.3082 15.0237 18.031 16.617ZM16.025 15.875C17.2941 14.5699 18.0029 12.8204 18 11C18 7.132 14.867 4 11 4C7.132 4 4 7.132 4 11C4 14.867 7.132 18 11 18C12.8204 18.0029 14.5699 17.2941 15.875 16.025L16.025 15.875V15.875ZM7 10H15V12H7V10Z',
                    iconStyle: {
                      borderWidth: 0,
                      color: 'white',
                    },
                    onclick: zoomOut,
                  },
                },
                tooltip: {
                  show: true,
                  formatter: ({ title }: { title: string }) => title,
                  backgroundColor: theme.palette.surface[3],
                  textStyle: {
                    fontSize: 12,
                    color: theme.palette.text.primary,
                  },
                },
              },
              legend: {
                show: showLegend,
                top: 0,
                right: 50,
                left: 0,
                type: 'scroll',
                itemGap: 20,
                height: 30,
                pageIconColor: theme.palette.surface[4],
                pageIconInactiveColor: theme.palette.action.disabled,
                pageTextStyle: { color: theme.palette.text.secondary },
                textStyle: { color: theme.palette.text.secondary },
                data: legendData,
              },
              tooltip: {
                trigger: 'item',
                confine: true,
                appendToBody: true,
              },
              grid: {
                containLabel: true,
                left: theme.spacing(2),
                right: theme.spacing(1),
                top: theme.spacing(4),
                bottom: theme.spacing(3),
                axisLine: {
                  lineStyle: {
                    color: 'gray',
                  },
                },
              },
              xAxis: {
                data: aAxisLabels,
                type: 'value',
                min: xRange.min,
                max: xRange.max,
                axisTick: {
                  alignWithLabel: true,
                },
                name: 'Δa*',
                nameLocation: 'start',
                nameGap: 20,
              },
              yAxis: {
                show: true,
                type: 'value',
                boundaryGap: ['10%', '10%'],
                data: bAxisLabels,
                min: yRange.min,
                max: yRange.max,
                axisTick: {
                  alignWithLabel: true,
                },
                name: 'Δb*',
                nameLocation: 'start',
                nameGap: 25,
              },
              series: abSeries,
              textStyle: {
                color: theme.palette.text.secondary,
              },
              animationDuration: 200,
            }}
          />
        </div>
        <div className={classes.column}>
          <ReactEchartsCore
            data-testid={`${dataTestId}-L`}
            className={classes.lPlot}
            echarts={echarts}
            notMerge
            showLoading={loading}
            opts={{ renderer: 'svg' }}
            style={{ height: abPlotRef.current?.children.item(0)?.clientHeight, width: '100px' }}
            onEvents={{
              click: handleSampleSelect,
            }}
            option={{
              animation,
              tooltip: {
                trigger: 'item',
                position: 'left',
                appendToBody: true,
              },
              grid: {
                containLabel: true,
                left: theme.spacing(2),
                right: 1,
                top: theme.spacing(4),
                bottom: theme.spacing(3),
              },
              xAxis: {
                type: 'value',
                min: 0,
                max: 0.5,
                axisTick: {
                  show: false,
                },
                axisLabel: {
                  show: false,
                },
                nameGap: 20,
                name: 'ΔL*',
                nameLocation: 'start',
                axisLine: {
                  show: false,
                },
                splitNumber: 1,
                splitLine: {
                  show: true,
                },
              },
              yAxis: {
                show: true,
                type: 'value',
                boundaryGap: ['10%', '10%'],
                data: lAxisLabels,
                min: yRange.min,
                max: yRange.max,
                axisTick: {
                  alignWithLabel: true,
                },
                axisLine: {
                  show: false,
                  lineStyle: {
                    color: 'white',
                  },
                },
                splitLine: {
                  lineStyle: {
                    color: theme.palette.surface[4],
                  },
                },
              },
              series: lSeries,
              textStyle: {
                color: theme.palette.text.secondary,
              },
              animationDuration: 200,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ColorPlot;
