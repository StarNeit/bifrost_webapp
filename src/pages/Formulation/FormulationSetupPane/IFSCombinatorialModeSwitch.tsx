import { useTranslation } from 'react-i18next';

import { Component } from '../../../types/component';
import Switch from '../../../components/Switch';

type Props = {
  isChecked: boolean;
  onChange(checked: boolean): void;
  disabled?: boolean;
}

const IFSCombinatorialModeSwitch: Component<Props> = ({ isChecked, onChange, disabled }) => {
  const { t } = useTranslation();

  return (
    <Switch
      dataTestId="selectedCombinatorialMode"
      isChecked={isChecked}
      onChange={onChange}
      uncheckedElement={t('labels.fastMatch')}
      checkedElement={t('labels.default')}
      width={12.5}
      disabled={disabled}
    />
  );
};

export default IFSCombinatorialModeSwitch;
