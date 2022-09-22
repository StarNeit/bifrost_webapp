import { Typography } from '@material-ui/core';
import { ComponentProps, forwardRef } from 'react';
import { Component } from '../types/component';

type Props = ComponentProps<typeof Typography>;

export const Header: Component<Props> = forwardRef((props, ref) => <Typography innerRef={ref} variant="h2" {...props} />);

export const Title: Component<Props> = forwardRef((props, ref) => <Typography innerRef={ref} variant="h1" {...props} />);

export const Subtitle: Component<Props> = forwardRef((props, ref) => <Typography innerRef={ref} variant="h3" {...props} />);

export const Caption: Component<Props> = forwardRef((props, ref) => <Typography innerRef={ref} variant="h4" {...props} />);

export const Body: Component<Props> = forwardRef((props, ref) => <Typography innerRef={ref} variant="body1" {...props} />);

export const Tiny: Component<Props> = forwardRef((props, ref) => <Typography innerRef={ref} variant="subtitle1" {...props} />);

export const TinyBold: Component<Props> = forwardRef((props, ref) => <Typography innerRef={ref} variant="subtitle2" {...props} />);
