import {
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { makeStyles, useTheme } from '@material-ui/core';
import { Measurement } from '@xrite/cloud-formulation-domain-model';
import {
  Layouts,
  Layout,
  Responsive as ResponsiveGridlayout,
} from 'react-grid-layout';
import keyBy from 'lodash/keyBy';
import debounce from 'lodash/debounce';

import { Component } from '../../types/component';
import { WidgetUpdate, WidgetSettings, WidgetType } from './types';
import Widget from './Widget';
import { WIDGET_NON_DRAGGABLE_CLASS } from '../../utils/constants';
import { scrollbars } from '../../theme/components';
import { PageConfiguration } from '../../data/api/uss/pages/types';
import { DEFAULT_PAGE_CONFIGURATION_NAME } from '../../data/api/uss/pages';

const useWidth = (targetRef: RefObject<Element>) => {
  const [width, setWidth] = useState(1280);
  useEffect(() => {
    const onResize = debounce(
      (entries: ResizeObserverEntry[]) => setWidth(entries[0].contentRect.width),
      20,
    );
    const resizeObserver = new ResizeObserver(onResize);
    if (targetRef.current) resizeObserver.observe(targetRef.current);
    return () => resizeObserver.disconnect();
  }, []);
  return width;
};

const useStyles = makeStyles((theme) => ({
  container: {
    flexGrow: 1,
    display: 'flex',
    overflowY: 'auto',
    overflowX: 'hidden',
    borderRadius: theme.spacing(1.5),
    ...scrollbars(theme),
  },
  grid: {
    flexGrow: 1,
  },
  widget: {
    display: 'flex',
  },
}));

type Props = {
  dataTestId?: string;
  configuration: WidgetSettings[];
  setConfiguration: (newConfiguration: PageConfiguration[]) => void;
  newStandardMeasurement?: Measurement;
  availableWidgetTypes: WidgetType[];
  widgetTypeLabels: Partial<Record<WidgetType, string>>;
};

const WidgetLayout: Component<Props> = ({
  dataTestId,
  configuration,
  setConfiguration,
  newStandardMeasurement,
  availableWidgetTypes,
  widgetTypeLabels,
}) => {
  const theme = useTheme();
  const classes = useStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useWidth(containerRef);

  const layouts = {
    lg: configuration.map(({ layout }) => layout),
    xs: configuration.map(({ layout }) => ({ ...layout, minW: 1, w: 1 })),
  };

  const settingsById = useMemo(() => keyBy(configuration, ({ id }) => id), [configuration]);

  const onLayoutChange = (_0: Layout[], allLayouts: Layouts) => {
    const newSettings = allLayouts.lg.map((layout) => ({
      ...settingsById[layout.i],
      layout,
    }));
    setConfiguration([{
      name: DEFAULT_PAGE_CONFIGURATION_NAME,
      widgetSettingsCollection: newSettings,
    }]);
  };

  const onWidgetChange = (id: string, update: WidgetUpdate) => {
    const newSettings = {
      ...settingsById[id],
      ...update,
    };
    const newConfiguration = configuration
      .map((settings) => (settings.id === id ? newSettings : settings));
    setConfiguration([{
      name: DEFAULT_PAGE_CONFIGURATION_NAME,
      widgetSettingsCollection: newConfiguration,
    }]);
  };

  return (
    <div className={classes.container} ref={containerRef}>
      <ResponsiveGridlayout
        data-testid={dataTestId}
        width={width}
        className={classes.grid}
        breakpoints={{ lg: 640, xs: 360 }}
        cols={{ lg: 5, xs: 1 }}
        layouts={layouts}
        margin={[theme.spacing(3), theme.spacing(3)]}
        containerPadding={[0, 0]}
        resizeHandles={['s', 'se', 'e']}
        onLayoutChange={onLayoutChange}
        draggableCancel={`.${WIDGET_NON_DRAGGABLE_CLASS}`}
      >
        {configuration.map(({ layout, ...settings }) => (
          <div data-testid={`${dataTestId}-${settings.id}`} key={settings.id} className={classes.widget}>
            <Widget
              {...settings}
              availableWidgetTypes={availableWidgetTypes}
              widgetTypeLabels={widgetTypeLabels}
              onChange={onWidgetChange}
              newStandardMeasurement={newStandardMeasurement}
            />
          </div>
        ))}
      </ResponsiveGridlayout>
    </div>
  );
};

export default WidgetLayout;
