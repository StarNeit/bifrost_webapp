import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
} from 'echarts/components';
import {
  ScatterChart,
  LineChart,
  BarChart,
  CustomChart,
} from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

import { ReportPayload } from './reports/types';

// initialize eCharts library
echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  ScatterChart,
  LineChart,
  BarChart,
  CustomChart,
  CanvasRenderer,
  LegendComponent,
]);

/* eslint-disable no-underscore-dangle */
declare const __HOST__: string;
declare const __DMS_URL__: string;
declare const __DMS_API_KEY__: string;
declare const __CFE_URL__: string;
declare const __FMS_URL__: string;
declare const __REPORTING_SERVICE_URL__: string;
declare const __APPEARANCE_DATA_EXPORT_SERVICE_URL__: string;
declare const __USS_URL__: string;
declare const __CFDB_URL__: string;
declare const __CFDB_API_KEY__: string;
declare const __CDIS_URL__: string;
declare const __CDIS_WS_URL__: string;
declare const __DB_USE_CREDENTIALS__: string;
declare const __GA_ENABLED__: string;
declare const __VERSION__: string;
declare const __GOOGLE_ANALYTICS_ID__: string;
declare const __HOTJAR_ID__: string;
declare const __CREATE_USER_URL__: string;
declare const __FORGOT_PASSWORD_URL__: string;
declare const __ENABLE_TEST_DATA_EXTRACTION__: string;

declare global {
  interface Window {
    XRITE_EFX?: {
      primaryColor?: string;
      secondaryColor?: string;
      appName?: string;
      helpURL?: string;
      forgotPasswordUrl?: string;
      logoUrl?: string;
      version?: string;
      dmsPostMeasurementUrl?: string;
    };
    XRITE_REPORTING_SERVICE?: ReportPayload;
  }
}

const APP_NAME = 'Bifrost Web App';

const ENGINE_IFS = 'IFS';
const ENGINE_EFX = 'EFX';

export const ROOT_ELEMENT_ID = 'bifrostWebApp';

const config = {
  HOST: __HOST__,
  CFE_URL: __CFE_URL__,
  FMS_URL: __FMS_URL__,
  REPORTING_SERVICE_URL: __REPORTING_SERVICE_URL__,
  APPEARANCE_DATA_EXPORT_SERVICE_URL: __APPEARANCE_DATA_EXPORT_SERVICE_URL__,
  CREATE_USER_URL: __CREATE_USER_URL__,
  USS_URL: __USS_URL__,
  CFDB_API_KEY: __CFDB_API_KEY__,
  CFDB_URL: __CFDB_URL__,
  CDIS_URL: __CDIS_URL__,
  CDIS_WS_URL: __CDIS_WS_URL__,
  DB_USE_CREDENTIALS: (__DB_USE_CREDENTIALS__ === 'true'),
  GA_ENABLED: __GA_ENABLED__,
  VERSION: __VERSION__,
  POST_MEASUREMENT_URL: '',
  LANGUAGE_DEFAULT: 'en',
  GOOGLE_ANALYTICS_ID: __GOOGLE_ANALYTICS_ID__,
  HOTJAR_ID: __HOTJAR_ID__,
  APP_NAME,
  ENGINE_IFS,
  ENGINE_EFX,
  HELP_URL: '',
  FORGOT_PASSWORD_URL: __FORGOT_PASSWORD_URL__,
  ENABLE_TEST_DATA_EXTRACTION: __ENABLE_TEST_DATA_EXTRACTION__,
  SESSION_EXPIRATION_TIME: 15 * 60 * 1000, // 15 minutes
  SESSION_WARNING_COUNTDOWN_TIME: 30 * 1000, // 30 seconds
  DMS: {
    url: __DMS_URL__,
    apikey: __DMS_API_KEY__,
  },
  FEEDBACK_URL: 'https://surveys.hotjar.com/2072f2e1-f884-4b58-ae5b-ad00fb7c2e53',
};

export default config;
