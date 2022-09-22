/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, useState } from 'react';

import { ChildrenProps, Component } from '../../types/component';
import { SetupDataType } from '../../types/qc';

type ContextType = {
  setQCData: (data: SetupDataType) => void;
  data: SetupDataType;
};

export const QCContext = createContext<ContextType>({
  setQCData: () => { /* Implemented Below */ },
  data: {},
});

const QCContextWrapper: Component<ChildrenProps> = ({ children }) => {
  const [qc, setQC] = useState<SetupDataType>({
    displayFromTolerances: true,
  });

  const setQCData = (data: SetupDataType) => {
    setQC({ ...qc, ...data });
  };

  const providerValue: ContextType = {
    data: qc,
    setQCData,
  };

  return (
    <QCContext.Provider value={providerValue}>
      {children}
    </QCContext.Provider>
  );
};

export default QCContextWrapper;
