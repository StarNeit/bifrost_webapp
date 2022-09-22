/* eslint-disable import/no-extraneous-dependencies */
import CloudDownload from '@material-ui/icons/CloudDownload';
import { IconButton } from '@material-ui/core';
import { useStore } from 'react-redux';
import { Component, ClassNameProps } from '../types/component';
import { extractTestDataFromPage, wait } from '../utils/test-utils';
import { useNavigation } from '../data/navigation';

const TestDataButton: Component<ClassNameProps> = ({ className }) => {
  const store = useStore();
  const navigation = useNavigation();

  const handleOnClick = async () => {
    await extractTestDataFromPage('correction');

    navigation.goToFormulation();
    await wait(3000);

    await extractTestDataFromPage('formulation');

    const testObj = {
      ...window.xrtestDataStore,
      state: store.getState(),
    };

    const url = window.URL.createObjectURL(
      new Blob([JSON.stringify(testObj, null, 4)]),
    );

    const assortmentLabel = window.xrtestDataStore.selectedAssortment === undefined
      ? window.xrtestDataStore.correctionSelectedAssortment.label
      : window.xrtestDataStore.selectedAssortment.label;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${window.xrtestDataStore.selectedStandard.label}-${assortmentLabel}.json`,
    );

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <IconButton data-testid="extract-test-data" onClick={handleOnClick} color="primary" className={className}>
      <CloudDownload />
    </IconButton>
  );
};

export default TestDataButton;
