import invert from 'lodash/invert';

export enum RoutePathname {
  QC = '/qc',
  Search = '/search',
  Formulation = '/formulate',
  Correction = '/correct',
  Import = '/import',
  About = '/about',
  Configuration = '/config',
}

export const routePathnameMap: Record<string, string> = invert(RoutePathname);

export default RoutePathname;
