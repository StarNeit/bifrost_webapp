import { useTranslation } from 'react-i18next';

import Autura from './autura.png';
import XRite from './xrite-pantone.svg';
import { ClassNameProps, Component } from '../../types/component';

export const AuturaLogo: Component<ClassNameProps> = ({ className }: ClassNameProps) => {
  const { t } = useTranslation();

  return (
    <img alt={t('labels.auturaLogo')} src={Autura} className={className} />
  );
};

export const XriteLogo: Component<ClassNameProps> = ({ className }: ClassNameProps) => {
  const { t } = useTranslation();

  return (
    <img alt={t('labels.xriteLogo')} src={XRite} className={className} />
  );
};
