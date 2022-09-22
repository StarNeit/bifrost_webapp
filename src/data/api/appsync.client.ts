/* eslint-disable compat/compat */
import AWSAppSyncClient, { createAppSyncLink, AWSAppSyncClientOptions } from 'aws-appsync';
import { setContext } from 'apollo-link-context';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';

export type AppSyncConfig = {
  token: string;
  awsConfig: {
    appSyncUri: string;
    region: string; // enum || union type
    appSyncKey: string;
  }
};
export const createClient = (config: AppSyncConfig) => {
  const customHeaders: Record<string, string> = {};
  if (config.token) customHeaders['XR-Token'] = config.token;

  const appsyncClientOptions: AWSAppSyncClientOptions = {
    url: config.awsConfig.appSyncUri,
    region: config.awsConfig.region,
    auth: {
      type: 'API_KEY',
      apiKey: config.awsConfig.appSyncKey,
    },
    disableOffline: true,
  };

  const appSyncLinkOptions = {
    ...appsyncClientOptions,
    complexObjectsCredentials: () => null,
    resultsFetcherLink: ApolloLink.from([
      setContext((request, previousContext) => ({
        headers: {
          ...previousContext.headers,
          ...customHeaders,
        },
      })),
      createHttpLink({
        uri: appsyncClientOptions.url,
      }),
    ]),
  };

  return new AWSAppSyncClient(appsyncClientOptions, {
    link: createAppSyncLink(appSyncLinkOptions),
  });
};
