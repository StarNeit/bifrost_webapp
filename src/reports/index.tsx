import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { render } from 'react-dom';

import '../i18n';
import ReportApp from './ReportApp';
import { ROOT_ELEMENT_ID } from '../config';
import { ReportPayload } from './types';

declare const XRITE_REPORTING_SERVICE: ReportPayload;

// Add style to root <div>
const rootDiv = document.getElementById(ROOT_ELEMENT_ID) as HTMLElement;
rootDiv.style.display = 'flex';
rootDiv.style.height = '100vh';
rootDiv.style.flexDirection = 'column';

window.XRITE_REPORTING_SERVICE = window.XRITE_REPORTING_SERVICE || XRITE_REPORTING_SERVICE;

const payload = window.XRITE_REPORTING_SERVICE;

render(<ReportApp payload={payload} />, rootDiv);
