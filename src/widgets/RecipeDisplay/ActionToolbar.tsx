import {
  MouseEvent,
} from 'react';
import {
  makeStyles,
  useTheme,
  Toolbar,
  IconButton,
  CircularProgress,
} from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import clsx from 'clsx';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import PrintIcon from '@material-ui/icons/Print';
import InvertColorsIcon from '@material-ui/icons/InvertColors';
import CopyIcon from '@material-ui/icons/FileCopy';
import { OptionTypeBase, StylesConfig } from 'react-select';
import { useTranslation } from 'react-i18next';

import { Tiny } from '../../components/Typography';
import { Component } from '../../types/component';
import Select from '../../components/Select';
import ButtonMenu from '../../components/ButtonMenu';
import { RecipeUnit, TotalMode } from '../../types/recipe';
import NumberInput from '../../components/ValidationInput';
import { allRecipeUnits } from '../../utils/utilsRecipe';
import { useDefaultPrecision } from '../../utils/utils';

const useStyles = makeStyles((theme) => ({
  stickyHead: {
    paddingLeft: theme.spacing(1),
    left: 0,
    position: 'sticky',
    zIndex: 3,
  },
  topToolbar: {
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 0,
    padding: 0,
    margin: theme.spacing(1.5),
    minHeight: 0,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  actions: {
    display: 'flex',
  },
  buttonActions: {
    justifyContent: 'flex-end',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.text.primary,
    background: 'transparent',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  menuItem: {
    width: theme.spacing(10),
  },
  buttonIcon: {
    width: theme.spacing(2.5),
  },
  marginRight: {
    marginRight: theme.spacing(1),
  },
  canInput: {
    width: theme.spacing(13),
    height: theme.spacing(5),
  },
  thicknessInput: {
    width: theme.spacing(10),
    height: theme.spacing(5),
  },
  select: {
    margin: theme.spacing(0, 2),
    width: theme.spacing(25),
    marginLeft: 0,
  },
  weightLabel: {
    paddingLeft: theme.spacing(0.1),
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.2),
    marginRight: theme.spacing(2),
  },
  selectField: {
    width: theme.spacing(10),
  },
  totalModeSelectField: {
    width: theme.spacing(16),
  },
}));

type Props = {
  canUnit: RecipeUnit,
  updateCanUnit: (newUnit: RecipeUnit) => void,
  recipeUnit: RecipeUnit,
  updateRecipeUnit: (newUnit: RecipeUnit) => void,
  totalMode: TotalMode,
  updateTotalMode: (newTotalMode: TotalMode) => void,
  canSize: number,
  updateCanSize: (newCanSize: number) => void,
  copyCSV: () => void,
  downloadCSV: () => void,
  downloadJSON: () => void,
  printPDF: () => void,
  isPrinting: boolean,
  openDispense: (e: MouseEvent<HTMLButtonElement>) => void,
  isDispensing: boolean,
  showTotalMode?: boolean,
  availableRecipeUnits: RecipeUnit[],
  relativeThickness?: number,
  disableCanResize: boolean,
};

const ActionToolbar: Component<Props> = ({
  canSize,
  updateCanSize,
  recipeUnit,
  updateRecipeUnit,
  canUnit,
  updateCanUnit,
  copyCSV,
  downloadCSV,
  downloadJSON,
  printPDF,
  openDispense: dispense,
  isDispensing,
  isPrinting,
  showTotalMode,
  availableRecipeUnits,
  relativeThickness,
  disableCanResize,
  totalMode,
  updateTotalMode,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const { round, toNumber } = useDefaultPrecision();

  const selectStyle: StylesConfig<OptionTypeBase, boolean> = {
    container: (provided) => ({
      ...provided,
      minWidth: 'unset',
      width: '100%',
    }),
    control: (provided) => ({
      ...provided,
      borderStyle: 'none',
      boxShadow: 'none',
      background: theme.palette.surface[3],
      borderRadius: theme.spacing(1),
      minHeight: theme.spacing(5),
      ...theme.typography.body1,
      '@font-face': undefined,
    }),
  };

  return (
    <Toolbar className={clsx(classes.stickyHead, classes.topToolbar)}>
      <div className={classes.actions}>
        <div className={classes.field}>
          <Tiny className={classes.weightLabel}>{t('labels.canSize')}</Tiny>
          <NumberInput
            type="number"
            invokeImmediately
            className={classes.canInput}
            placeholder={t('labels.canSize')}
            value={`${Number.isInteger(canSize) ? canSize : round(canSize)}`}
            onChange={(value) => {
              updateCanSize(round(value, toNumber) || 1);
            }}
            disabled={disableCanResize}
          />
        </div>
        <div className={clsx(classes.field, classes.selectField)}>
          <Tiny className={classes.weightLabel}>{t('labels.canUnit')}</Tiny>
          <Select<RecipeUnit>
            id="can-size-select"
            instanceId="can-size-select"
            className={classes.select}
            isMulti={false}
            value={canUnit}
            onChange={updateCanUnit}
            data={allRecipeUnits}
            idProp="id"
            labelProp="name"
            isSmall
            selectStyles={selectStyle}
            isSearchable={false}
          />
        </div>
        {showTotalMode
          && (
            <div className={clsx(classes.field, classes.totalModeSelectField)}>
              <Tiny className={classes.weightLabel}>{t('labels.totalMode')}</Tiny>
              <Select<TotalMode>
                id="totalMode"
                instanceId="totalMode"
                className={classes.select}
                isMulti={false}
                value={totalMode}
                onChange={updateTotalMode}
                data={['BasicInkTotal', 'Total']}
                labelProp={(mode: TotalMode) => (mode === 'BasicInkTotal' ? t('labels.totalBasicInk') : t('labels.totalInk'))}
                isSmall
                selectStyles={selectStyle}
                isSearchable={false}
                disabled={disableCanResize}
              />
            </div>
          )}
        <div className={clsx(classes.field, classes.selectField)}>
          <Tiny className={classes.weightLabel}>
            {t('labels.recipeUnit')}
          </Tiny>
          <Select<RecipeUnit>
            id="recipe-unit-select"
            instanceId="recipe-unit-select"
            className={classes.select}
            isMulti={false}
            data={availableRecipeUnits}
            value={recipeUnit}
            idProp="id"
            labelProp="name"
            onChange={updateRecipeUnit}
            isSmall
            selectStyles={selectStyle}
            isSearchable={false}
          />
        </div>
        {relativeThickness && (
          <div className={clsx(classes.field)}>
            <Tiny className={classes.weightLabel}>{t('labels.thickness')}</Tiny>
            <NumberInput
              type="number"
              disabled
              invokeImmediately
              className={classes.thicknessInput}
              value={(relativeThickness * 100).toFixed(2)}
            />
          </div>
        )}
      </div>
      <div className={clsx(classes.actions, classes.buttonActions)}>
        <IconButton
          className={clsx(classes.button, classes.marginRight)}
          onClick={dispense}
          disabled={isDispensing}
        >
          {isDispensing
            ? (
              <CircularProgress
                className={clsx(classes.buttonIcon)}
                size={theme.spacing(2.5)}
              />
            )
            : (
              <InvertColorsIcon className={classes.buttonIcon} />
            )}
        </IconButton>
        <IconButton
          className={clsx(classes.button, classes.marginRight)}
          onClick={printPDF}
          disabled={isPrinting}
        >
          {isPrinting
            ? (
              <CircularProgress
                className={clsx(classes.buttonIcon)}
                size={theme.spacing(2.5)}
              />
            )
            : (
              <PrintIcon className={classes.buttonIcon} />
            )}
        </IconButton>
        <IconButton className={classes.button} onClick={copyCSV}>
          <CopyIcon className={classes.buttonIcon} />
        </IconButton>
        <ButtonMenu
          type="icon"
          className={classes.button}
          icon={<SaveAltIcon />}
        >
          <MenuItem
            className={classes.menuItem}
            onClick={downloadCSV}
          >
            CSV
          </MenuItem>
          <MenuItem
            className={classes.menuItem}
            onClick={downloadJSON}
          >
            JSON
          </MenuItem>
        </ButtonMenu>
      </div>
    </Toolbar>
  );
};

export default ActionToolbar;
