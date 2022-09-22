import axios from 'axios';
import config from '../../config';

import { RecipeTableReportProps } from '../../reports/types';

const REPORTING_SERVICE_URL = `${config.REPORTING_SERVICE_URL}/report`;

export async function getPDFReport(
  token: string, fileName: string, payload: RecipeTableReportProps,
) {
  const response = await axios.post(REPORTING_SERVICE_URL, {
    templateName: 'bifrost/formulation',
    payload,
  }, {
    headers: {
      'xr-token': token,
    },
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName}.pdf`);
  document.body.appendChild(link);
  link.click();
}
