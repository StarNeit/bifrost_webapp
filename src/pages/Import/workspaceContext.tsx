import React from 'react';

import { WorkspaceData } from '../../data/cdis.hooks';

const WorkspaceContext = React.createContext<{
   importedObjectIds: string[],
   rejectedObjectIds: string[],
   importingAllObjects: boolean,
   applicationId: string,
   isLoading: boolean,
   isEmpty: boolean,
   reset:() => void,
   workspace?: WorkspaceData,
   error?: Error,
     }>({
       importedObjectIds: [],
       rejectedObjectIds: [],
       importingAllObjects: false,
       applicationId: 'bifrostimport',
       isLoading: false,
       isEmpty: false,
       // eslint-disable-next-line @typescript-eslint/no-empty-function
       reset: () => {},
     });

export default WorkspaceContext;
