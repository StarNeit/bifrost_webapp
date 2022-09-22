import { useTranslation } from 'react-i18next';
import { Component } from '../../types/component';
import Switch from '../../components/Switch';

type Props = {
  isMulti?: boolean;
  onChange(checked: boolean): void;
}

const SingleMultiSwitch: Component<Props> = ({ isMulti, onChange }) => {
  const { t } = useTranslation();

  return (
    <Switch
      isChecked={isMulti ?? false}
      onChange={onChange}
      checkedElement={t('labels.multi')}
      uncheckedElement={t('labels.single')}
      width={8}
    />
  );
};

export default SingleMultiSwitch;
