import { Document } from '@xrite/reporting-service-ui';

import { Component } from '../types/component';
import { ReportPayload } from './types';

type Props = { payload?: ReportPayload };

const Report: Component<Props> = () => {
  return (
    <Document>
      Content
    </Document>
  );
};

export default Report;
