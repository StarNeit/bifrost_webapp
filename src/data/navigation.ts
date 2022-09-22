import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';

import RoutePathname from '../constants/route';

export const useNavigation = () => {
  const dispatch = useDispatch();

  return {
    goToQC: () => dispatch(push(RoutePathname.QC)),
    goToFormulation: () => dispatch(push(RoutePathname.Formulation)),
    goToCorrection: () => dispatch(push(RoutePathname.Correction)),
    goToSearch: () => dispatch(push(RoutePathname.Search)),
    goToAbout: () => dispatch(push(RoutePathname.About)),
    goToImport: () => dispatch(push(RoutePathname.Import)),
    goToConfiguration: () => dispatch(push(RoutePathname.Configuration)),
  };
};
