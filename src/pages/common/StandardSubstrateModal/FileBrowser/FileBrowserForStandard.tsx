import {
  useState,
  useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Measurement } from '@xrite/cloud-formulation-domain-model';

import { Component } from '../../../../types/component';
import {
  useGetStandardDetails,
  useGetStandards,
} from '../../../../data/cdis.hooks';
import FileBrowser from './FileBrowser';

type Props = {
  onFileSelected: (measurement: Measurement, standardName: string) => void;
}

const FileBrowserForStandard: Component<Props> = ({ onFileSelected }: Props) => {
  const { t } = useTranslation();
  const [standardId, setStandardId] = useState<string>();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const applicationId = 'bifrostnewstd';

  const {
    result: standards,
    loading: standardsLoading,
    revalidate: refetchStandards,
  } = useGetStandards(applicationId);

  const {
    result: standardDetails,
    loading: fetchingStandardDetails,
  } = useGetStandardDetails(applicationId, standardId);

  useEffect(() => {
    if (standardDetails) {
      onFileSelected(standardDetails.measurements[0], standardDetails.name);
    }
  }, [standardDetails]);

  const lowercaseSearchQuery = searchQuery.toLowerCase();
  const displayedStandards = standards
    ?.filter((standard) => standard.name.toLowerCase().includes(lowercaseSearchQuery)) ?? [];

  return (
    <FileBrowser
      entriesLoading={standardsLoading}
      entries={standards}
      fetchingEntryDetails={fetchingStandardDetails}
      displayedEntries={displayedStandards}
      setEntryId={setStandardId}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      refetchEntries={refetchStandards}
      applicationId={applicationId}
      headerTitle={t('labels.sample')}
    />
  );
};

export default FileBrowserForStandard;
