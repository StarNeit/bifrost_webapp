import { CreateCSSProperties } from '@material-ui/core/styles/withStyles';

export function clickable(): { clickable: CreateCSSProperties } {
  return {
    clickable: {
      cursor: 'pointer',
    },
  };
}
