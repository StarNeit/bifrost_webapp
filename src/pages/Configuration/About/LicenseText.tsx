import { Component, ClassNameProps } from '../../../types/component';
import { useLicense } from '../../../data/licenses';
import { Body } from '../../../components/Typography';

type Props = ClassNameProps & {
  filename: string,
};

const LicenseText: Component<Props> = ({
  filename,
  className,
}) => {
  const { data } = useLicense(filename);

  return (
    <div className={className}>
      {data && (
        <Body>{data.licenseText}</Body>
      )}
    </div>
  );
};

export default LicenseText;
