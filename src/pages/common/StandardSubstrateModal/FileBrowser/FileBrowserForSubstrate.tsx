import {
  useState,
  useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Measurement } from '@xrite/cloud-formulation-domain-model';

import { Component } from '../../../../types/component';
import {
  useGetSubstrateDetails,
  useGetSubstrates,
} from '../../../../data/cdis.hooks';
import FileBrowser from './FileBrowser';

type Props = {
  onFileSelected: (measurement: Measurement, substrateName: string) => void;
}

const FileBrowserForSubstrate: Component<Props> = ({ onFileSelected }: Props) => {
  const { t } = useTranslation();
  const [substrateId, setSubstrateId] = useState<string>();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const applicationId = 'bifrostnewsubstrate';

  const {
    result: substrates,
    loading: substratesLoading,
    revalidate: refetchSubstrates,
  } = useGetSubstrates(applicationId);

  const {
    result: substrateDetails,
    loading: fetchingSubstrateDetails,
  } = useGetSubstrateDetails(applicationId, substrateId);

  useEffect(() => {
    if (substrateDetails) {
      onFileSelected(substrateDetails.measurements[0], substrateDetails.name);
    }
  }, [substrateDetails]);

  const lowercaseSearchQuery = searchQuery.toLowerCase();
  const displayedSubstrates = substrates
    ?.filter((substrate) => substrate.name.toLowerCase().includes(lowercaseSearchQuery)) ?? [];

  return (
    <FileBrowser
      entriesLoading={substratesLoading}
      entries={substrates}
      fetchingEntryDetails={fetchingSubstrateDetails}
      displayedEntries={displayedSubstrates}
      setEntryId={setSubstrateId}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      refetchEntries={refetchSubstrates}
      applicationId={applicationId}
      headerTitle={t('labels.sample')}
    />
  );
};

export default FileBrowserForSubstrate;
