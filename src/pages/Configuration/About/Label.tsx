import { InputLabel, Typography } from '@material-ui/core';
import { Component, ClassNameProps } from '../../../types/component';

type Props = ClassNameProps & {
  label: string,
  body?: string,
};

const AboutLabel: Component<Props> = ({
  label,
  body,
  className,
}) => (
  <div className={className}>
    <InputLabel shrink>{label}</InputLabel>
    <Typography variant="body1">{body}</Typography>
  </div>
);

export default AboutLabel;
