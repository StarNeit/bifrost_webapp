import {
  GoogleAnalyticsClient,
  TrackScreenParams,
  TrackExceptionsParams,
} from '@xrite/analytics-client/google';
import { HotjarClient } from '@xrite/analytics-client/hotjar';

import config from '../config';
import store from '../store';
import { routePathnameMap } from '../constants/route';

let googleAnalyticsClient: GoogleAnalyticsClient;
function getGoogleAnalyticsClient() {
  if (!googleAnalyticsClient) {
    googleAnalyticsClient = new GoogleAnalyticsClient({
      gtagId: config.GOOGLE_ANALYTICS_ID,
      gtagSettings: {
        app_name: config.APP_NAME,
        app_version: config.VERSION,
      },
      getUserId: () => {
        const storeState = store.getState();
        return storeState.authentication.session?.userId.toString();
      },
      getPageTitle: () => {
        const storeState = store.getState();
        return routePathnameMap[storeState.router.location.pathname];
      },
    });
    googleAnalyticsClient.initialize();
  }
  return googleAnalyticsClient;
}

let hotjarClient: HotjarClient;
function getHotjarClient() {
  if (!hotjarClient) {
    hotjarClient = new HotjarClient(config.HOTJAR_ID);
    hotjarClient.initialize();
  }
  return hotjarClient;
}

export const trackEvent = (action: string) => {
  const client = getGoogleAnalyticsClient();
  client.trackEvent(action);
};

export const trackScreen = (params: TrackScreenParams) => {
  const client = getGoogleAnalyticsClient();
  client.trackScreen(params);
};

export const trackException = (params: TrackExceptionsParams) => {
  const client = getGoogleAnalyticsClient();
  client.trackException(params);
};

export const trackPageLoadTiming = () => {
  const client = getGoogleAnalyticsClient();
  client.trackPageLoadTiming();
};

export const trackStateChange = (path: string) => {
  const client = getHotjarClient();
  client.trackStateChange(path);
};
