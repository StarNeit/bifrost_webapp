import {
  ChangeEvent, useEffect,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core';
import { TreeView } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { AppearanceSample, Standard } from '@xrite/cloud-formulation-domain-model';

import { Component } from '../../../types/component';
import { scrollbars } from '../../../theme/components';
import StandardIcon from '../../../assets/StandardIcon';
import TreeItem from './TreeItem';
import { setExpandedSampleTreeIds } from '../../../data/reducers/common';
import FormulaTree from './SampleTreeItems';
import RefreshIcon from '../../../components/RefreshIcon';
import { useSampleId } from '../../../data/common';
import { makeShortName, replaceSpaceInSelector } from '../../../../cypress/support/util/selectors';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
    width: '100%',
    height: theme.spacing(42),
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    padding: theme.spacing(0.5),
    overflow: 'auto',
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.surface[2],
    ...scrollbars(theme),
  },
  '@keyframes spin': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },
  spinner: {
    animation: '$spin 1s linear infinite',
    position: 'absolute',
    right: theme.spacing(0.75),
    top: theme.spacing(0.75),
    color: theme.palette.text.disabled,
  },
}));

type Props = {
  appearanceSamples: AppearanceSample[] | undefined;
  appearanceSamplesFetching?: boolean;
  dataTestId?: string;
  standard?: Standard;
  standardFetching?: boolean;
}

const NavigationTree: Component<Props> = ({
  dataTestId,
  standard,
  standardFetching,
  appearanceSamples,
  appearanceSamplesFetching,
}) => {
  const classes = useStyles();
  const expandedSampleTreeIds = useSelector((state) => state.common.expandedSampleTreeIds);
  const { selectedSampleId, setSampleId } = useSampleId();
  const dispatch = useDispatch();

  const handleChange = (event: ChangeEvent<unknown>, nodes: string[]) => {
    dispatch(setExpandedSampleTreeIds({ ids: nodes }));
  };

  useEffect(() => {
    if (standard) dispatch(setExpandedSampleTreeIds({ ids: [standard.id] }));
  }, [standard]);

  return (
    <div className={classes.container}>
      <RefreshIcon fetching={(appearanceSamplesFetching || standardFetching)} />
      {!standardFetching && standard && (
        <TreeView
          data-testid={dataTestId}
          expanded={expandedSampleTreeIds}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          onNodeToggle={handleChange}
        >
          <TreeItem
            id={standard.id}
            dataTestId={`${dataTestId}-${replaceSpaceInSelector(standard.name.toLowerCase())}-root`}
            name={standard.name}
            icon={<StandardIcon />}
            selected={selectedSampleId === standard?.id || !selectedSampleId}
            onClick={setSampleId}
          >
            {appearanceSamples && appearanceSamples.length > 0 && (
              <FormulaTree
                dataTestId={
                  makeShortName(
                    `${replaceSpaceInSelector(standard.name.toLowerCase())}-${dataTestId}`,
                  )
                }
                standardId={standard.id}
                selectedId={selectedSampleId}
                onSelectSample={setSampleId}
                appearanceSamples={appearanceSamples}
                trialInPath={false}
              />
            )}
          </TreeItem>
        </TreeView>
      )}
    </div>
  );
};

export default NavigationTree;
