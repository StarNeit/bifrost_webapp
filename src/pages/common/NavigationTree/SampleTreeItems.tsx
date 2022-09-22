/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-const */
import { useMemo } from 'react';
import { AppearanceSample } from '@xrite/cloud-formulation-domain-model';

import { Component } from '../../../types/component';
import TreeItem from './TreeItem';
import { storeSelectedSample } from '../../../utils/test-utils';
import config from '../../../config';
import { getAppearanceSampleIcon } from '../../../utils/utilsSamples';
import { replaceSpaceInSelector } from '../../../../cypress/support/util/selectors';

type Props = {
  standardId: string;
  trialInPath: boolean;
  onSelectSample: (id: string) => void;
  appearanceSamples?: AppearanceSample[];
  parentId?: string;
  selectedId?: string;
  dataTestId?: string;
};

const SampleTreeItems: Component<Props> = ({
  dataTestId,
  standardId,
  parentId,
  selectedId,
  trialInPath,
  onSelectSample,
  appearanceSamples,
}) => {
  const samples = useMemo(
    () => (
      appearanceSamples
        ?.filter((sample) => (
          sample.standardId === standardId
          && sample.parentAppearanceSampleId === parentId
        ))
        .map((sample) => {
          const Icon = getAppearanceSampleIcon(
            sample,
            appearanceSamples.find((s) => s.id === sample.parentAppearanceSampleId),
            trialInPath,
          );
          return ({
            id: sample.id,
            name: sample.name,
            Icon,
            isTrial: sample.measurements.length > 0,
            hasChildren: appearanceSamples.some((s) => s.parentAppearanceSampleId === sample.id),
          });
        })
    ),
    [parentId, standardId, appearanceSamples],
  );

  if (config.ENABLE_TEST_DATA_EXTRACTION) {
    const sampleParent = {
      parentId,
      parentName: appearanceSamples?.find((sample) => sample.id === parentId)?.name,
      children: samples,
    };

    if (selectedId && standardId) {
      storeSelectedSample(sampleParent, selectedId);
    }
  }

  return (
    <>
      {
        samples?.map(({
          id, name, hasChildren, Icon, isTrial,
        }) => (
          <TreeItem
            dataTestId={`${dataTestId}-${replaceSpaceInSelector(name)}`}
            key={id}
            id={id}
            name={name}
            icon={<Icon />}
            selected={selectedId === id}
            onClick={onSelectSample}
          >
            {hasChildren && (
              <SampleTreeItems
                dataTestId={`${dataTestId}-${replaceSpaceInSelector(name)}`}
                standardId={standardId}
                parentId={id}
                selectedId={selectedId}
                onSelectSample={onSelectSample}
                appearanceSamples={appearanceSamples}
                trialInPath={trialInPath || isTrial}
              />
            )}
          </TreeItem>
        ))
      }
    </>
  );
};

export default SampleTreeItems;
