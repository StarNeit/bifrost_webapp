import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { render } from 'react-dom';

import './i18n';
import App from './App';
import { ROOT_ELEMENT_ID } from './config';

// Add style to root <div>
const rootDiv = document.getElementById(ROOT_ELEMENT_ID) as HTMLElement;
rootDiv.style.display = 'flex';
rootDiv.style.height = '100vh';
rootDiv.style.flexDirection = 'column';

render(<App />, rootDiv);
