import { useRef, ChangeEvent } from 'react';
import { makeStyles, Input } from '@material-ui/core';

import { Component, ClassNameProps } from '../types/component';
import Button from './Button';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    display: 'none',
  },
  button: {
    padding: theme.spacing(1.5, 3),
    borderRadius: theme.spacing(0.75),
    background: theme.palette.action.active,
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap',

    '&:hover': {
      background: theme.palette.divider,
    },

    '&:disabled': {
      color: theme.palette.text.hint,
    },
  },
  fileInput: {
    display: 'none',
  },
  selectFileButton: {
    height: theme.spacing(5.25),
    fontSize: theme.spacing(1.5),
    marginLeft: theme.spacing(2),
  },
}));

type Props = ClassNameProps & {
  dataTestId?: string,
  accept: string,
  disabled?: boolean,
  onChange: (event: ChangeEvent<HTMLInputElement>) => void,
};

const FileInput: Component<Props> = ({
  dataTestId,
  accept,
  disabled,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>();
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <Button
        data-testid={dataTestId}
        disabled={disabled}
        className={classes.selectFileButton}
        variant="primary"
        onClick={() => {
          fileInputRef?.current?.click();
        }}
      >
        Select file
      </Button>
      <Input
        data-testid={`${dataTestId}-attach-file`}
        type="file"
        className={classes.fileInput}
        inputRef={fileInputRef}
        inputProps={{
          accept,
          multiple: false,
        }}
        onChange={onChange}
      />
    </div>
  );
};

export default FileInput;
