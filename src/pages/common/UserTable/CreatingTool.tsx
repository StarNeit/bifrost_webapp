import clsx from 'clsx';
import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';

import SelectMenuWithFilter from '../../../components/SelectMenuWithFilter';
import InputField from '../../../components/InputField';
import RefreshIcon from '../../../components/RefreshIcon';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  iconBtn: {
    padding: theme.spacing(0.5),
    width: theme.spacing(4),
    height: theme.spacing(4),
    borderRadius: theme.spacing(0.5),
    marginRight: theme.spacing(1.5),
    '& svg': {
      fontSize: theme.spacing(2),
    },
  },
  disabled: {
    color: theme.palette.text.disabled,
  },
  check: {
    color: theme.palette.success.main,
  },
  close: {
    color: theme.palette.error.main,
  },
  add: {
    color: theme.palette.text.primary,
  },
  refresh: {
    color: theme.palette.primary.main,
    position: 'static',
    fontSize: theme.spacing(2.25),
  },
  refreshWrapper: {
    paddingTop: theme.spacing(0.5),
    paddingLeft: theme.spacing(2),
  },
  tool: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(1.5),
  },
  edit: {
    width: theme.spacing(26.5),
  },
}));

type BaseProps = {
  isFetching?: boolean,
  isEditable: boolean,
  placeholder?: string,
  onSetEditable: (status: boolean) => void,
}

type TextProps = {
  type: 'text',
  onCheck: (value: string) => void,
}

type SelectProps<T> = {
  type: 'select',
  onCheck: (value: T) => void,
  options: T[] | undefined,
  label: ((element: T | undefined) => string),
}

type DataProps<T> = TextProps | SelectProps<T>;

type Props<T> = DataProps<T> & BaseProps;

export default function CreatingTool<T extends { id: string }>({
  isFetching,
  isEditable,
  onSetEditable,
  placeholder,
  ...rest
}: Props<T>) {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState<string>('');
  const [selectValue, setSelectValue] = useState<T>();

  const handleClose = () => {
    setInputValue('');
    onSetEditable(false);
  };

  const handleCheck = () => {
    if (rest.type === 'text') {
      setInputValue('');
      rest.onCheck(inputValue);
    } else if (selectValue) {
      setSelectValue(undefined);
      rest.onCheck(selectValue);
    }
  };

  let field;
  if (rest.type === 'text') {
    field = (
      <InputField
        autoFocus
        value={inputValue}
        onChange={(val) => setInputValue(val)}
        placeholder={placeholder}
        onAbort={() => handleClose()}
        onKeyDown={
          (e) => {
            switch (e.key) {
              case 'Enter':
                handleCheck();
                break;
              case 'Escape':
                handleClose();
                break;
              default:
            }
          }
        }
      />
    );
  } else {
    const { options = [], label } = rest;
    field = (
      <SelectMenuWithFilter
        options={options}
        value={selectValue}
        onSelect={setSelectValue}
        label={label}
      />
    );
  }

  return (
    <div className={classes.root}>
      {!isEditable ? (
        <IconButton
          className={classes.iconBtn}
          onClick={() => onSetEditable(true)}
        >
          <AddIcon className={classes.add} />
        </IconButton>
      ) : (
        <>
          <div className={classes.edit}>
            {field}
          </div>
          {isFetching ? (
            <div className={classes.refreshWrapper}>
              <RefreshIcon
                fetching={isFetching}
                className={classes.refresh}
              />
            </div>
          ) : (
            <div className={classes.tool}>
              <IconButton
                className={classes.iconBtn}
                onClick={handleCheck}
                disabled={!(selectValue || inputValue)}
              >
                <DoneIcon
                  className={clsx({
                    [classes.disabled]: !(selectValue || inputValue),
                    [classes.check]: selectValue || inputValue,
                  })}
                />
              </IconButton>
              <IconButton
                className={classes.iconBtn}
                onClick={handleClose}
              >
                <CloseIcon className={classes.close} />
              </IconButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}
