import {
  Checkbox,
  Grid,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import LoadingContainer from '../../../components/LoadingContainer';
import PercentageInput from '../../../components/PercentageInput';
import { Body } from '../../../components/Typography';
import { ConcentrationPercentages, FormulationComponent } from '../../../types/formulation';
import { getCSSColorString } from '../../../utils/utils';
import { replaceSpaceInSelector } from '../../../../cypress/support/util/selectors';
import { scrollbarsLight } from '../../../theme/components';
import { ClassNameProps } from '../../../types/component';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  headers: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },
  listWrapper: {
    overflow: 'hidden',
    borderRadius: theme.spacing(0.75),
    height: '100%',
  },
  list: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    ...scrollbarsLight(theme),
    background: theme.palette.action.active,
  },
  componentRow: {
    padding: theme.spacing(0.75),
    minHeight: theme.spacing(6),
    textTransform: 'unset',
    fontWeight: 'normal',
    // adding a selected class doesn't help, so the color has to have an !important postfix
    color: `${theme.palette.text.primary} !important`,
    border: 'none',
    borderRadius: 0,
    justifyContent: 'flex-start',
    transition: 'background 250ms ease-out',

    '&:hover': {
      cursor: 'pointer',
      background: theme.palette.action.hover,
    },
  },
  componentType: {
    flex: 1,
    textAlign: 'start',
    marginLeft: theme.spacing(1),
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  disabled: {
    color: theme.palette.text.disabled,
  },
  selectedComponent: {
    color: theme.palette.text.primary,
  },
  chip: {
    marginRight: theme.spacing(1.5),
    pointerEvents: 'none',
  },
  minMaxHeader: {
    width: theme.spacing(6),
  },
  minMaxInputs: {
    width: 'auto',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chipColorDot: {
    boxShadow: `inset 0px 0px 0px 1.5px ${theme.palette.text.disabled}`,
    borderRadius: '100%',
    width: theme.spacing(1),
    height: theme.spacing(1),
  },
  colorBox: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    borderRadius: theme.spacing(0.75),
    borderColor: theme.palette.text.primary,
    borderStyle: 'solid',
    borderWidth: 2,
  },
  requiredHeader: {
    minWidth: theme.spacing(8),
  },
  concentration: {
    minWidth: theme.spacing(14),
  },
  selected: {},
  margin: {
    marginLeft: theme.spacing(2),
  },
}));

type Props = ClassNameProps & {
  dataTestId?: string;
  isFetching?: boolean;
  components: FormulationComponent[] | undefined;
  onComponentsSelected: (selected: FormulationComponent[]) => void;
  type: 'unselected' | 'selected';
  concentration?: 'single' | 'minMax';
  immediatelyAdd?: (selected: FormulationComponent[]) => void;
  showRequired?: boolean;
  concentrationPercentages?: ConcentrationPercentages;
  onChangeConcentrationPercentages?: (
    componentId: string,
    minConcentrationPercentage?: number,
    maxConcentrationPercentage?: number,
  ) => void;

  requiredComponentIds?: string[];
  onChangeColorantsRequired?: (componentId: string, required: boolean) => void;
  disabled?: boolean;
  colorantGroups?: JSX.Element;
  availableBlockLabel?: string;
  selectedBlockLabel?: string;
};

const TransferListBlock = ({
  dataTestId,
  isFetching,
  components,
  onComponentsSelected,
  type,
  immediatelyAdd,
  concentrationPercentages,
  onChangeConcentrationPercentages,
  requiredComponentIds,
  onChangeColorantsRequired,
  className,
  availableBlockLabel,
  selectedBlockLabel,
  concentration = 'minMax',
  showRequired = true,
  disabled = false,
  colorantGroups,
}: Props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [minFocused, setMinFocused] = useState(false);
  const [maxFocused, setMaxFocused] = useState(false);
  const [selected, setSelected] = useState<FormulationComponent[]>();

  const handleSelectionChanged = (
    event: React.MouseEvent<HTMLElement>,
    selection: FormulationComponent[],
  ) => {
    let newSelection: FormulationComponent[] = selection;
    const { shiftKey } = event;

    if (selection.length > 0 && shiftKey && selection.length > 1) {
      const index = components?.findIndex((c) => c.id === selection[selection.length - 1].id) ?? -1;
      const prevIndex = components?.findIndex((c) => {
        return c.id === selection[selection.length - 2].id;
      }) ?? -1;
      const lowerIndex = Math.min(index, prevIndex);
      const higherIndex = Math.max(index, prevIndex);
      newSelection = components?.slice(lowerIndex, higherIndex + 1) ?? selection;
    }

    setSelected(newSelection);
    onComponentsSelected(newSelection);
  };

  useEffect(() => {
    setSelected([]);
  }, [components]);

  return (
    <div data-testid={dataTestId} className={clsx(classes.root, className)}>
      <div className={classes.headers}>
        <Body>
          {
          type === 'unselected'
            ? availableBlockLabel ?? t('labels.available')
            : selectedBlockLabel ?? t('labels.selected')
          }
        </Body>
        <div className={classes.margin}>
          {colorantGroups}
        </div>
        {type === 'selected' && (
        <Grid justify="flex-end" container>
          {concentration === 'minMax' && (
          <>
            <Grid item>
              <Body className={classes.minMaxHeader}>{t('labels.min')}</Body>
            </Grid>
            <Grid item>
              <Body className={classes.minMaxHeader}>{t('labels.max')}</Body>
            </Grid>
          </>
          )}
          {concentration === 'single'
          && (
          <Grid item className={classes.concentration}>
            <Body className={classes.minMaxHeader}>{t('labels.concentration')}</Body>
          </Grid>
          )}
          {showRequired && (
          <Grid item className={classes.requiredHeader}>
            <Body className={classes.minMaxHeader}>{t('labels.required')}</Body>
          </Grid>
          )}
        </Grid>
        )}
      </div>
      <div className={classes.listWrapper}>
        <LoadingContainer fetching={isFetching}>
          <ToggleButtonGroup
            className={classes.list}
            onChange={handleSelectionChanged}
            value={selected}
          >
            {components?.map((component) => (
              <ToggleButton
                value={component}
                className={classes.componentRow}
                key={component.id}
                onDoubleClick={() => {
                  const newSelection = [component];
                  setSelected(newSelection);
                  onComponentsSelected(newSelection);
                  immediatelyAdd?.(newSelection);
                }}
                disableFocusRipple={minFocused || maxFocused}
                disableRipple={minFocused || maxFocused}
                disableTouchRipple={minFocused || maxFocused}
                disabled={disabled}
              >
                <div
                  className={classes.colorBox}
                  style={{
                    backgroundColor: getCSSColorString(component.previewColor),
                  }}
                />
                <Tooltip
                  title={`${component.name} ${component.isLeftover ? t('labels.leftover') : component.type}`}
                >
                  <Body
                    data-testid={`${replaceSpaceInSelector(component.name)}-label-${type}`}
                    className={clsx(classes.componentType, { [classes.disabled]: disabled })}
                  >
                    {component.name}
                    {' '}
                    (
                    {component.isLeftover ? t('labels.leftover') : component.type}
                    )
                  </Body>
                </Tooltip>
                {type === 'selected' && (
                  <Grid
                    onDoubleClick={(e) => e.stopPropagation()}
                    className={classes.minMaxInputs}
                    container
                    spacing={1}
                  >
                    {concentration === 'minMax' && (
                      <>
                        <Grid item>
                          <PercentageInput
                            dataTestId={`${replaceSpaceInSelector(component.name)}-minConcentrationPercentage`}
                            value={
                              concentrationPercentages?.[component.id]?.minConcentrationPercentage
                              ?? component.minConcentrationPercentage
                            }
                            onClick={(event) => event.stopPropagation()}
                            onFocus={() => setMinFocused(true)}
                            onBlur={() => setMinFocused(false)}
                            onChange={(value) => {
                              onChangeConcentrationPercentages?.(
                                component.id,
                                value,
                              );
                            }}
                            alwaysShowControls
                            disabled={disabled}
                          />
                        </Grid>
                        <Grid item>
                          <PercentageInput
                            dataTestId={`${replaceSpaceInSelector(component.name)}-selectedMaxConcentrationPercentage`}
                            value={
                              concentrationPercentages?.[component.id]?.maxConcentrationPercentage
                              ?? component.maxConcentrationPercentage
                            }
                            onClick={(event) => event.stopPropagation()}
                            onFocus={() => setMaxFocused(true)}
                            onBlur={() => setMaxFocused(false)}
                            onChange={(value) => {
                              onChangeConcentrationPercentages?.(
                                component.id,
                                undefined,
                                value,
                              );
                            }}
                            alwaysShowControls
                            disabled={disabled}
                          />
                        </Grid>
                      </>
                    )}
                    {concentration === 'single' && (
                      <Grid item>
                        <PercentageInput
                          dataTestId={`${replaceSpaceInSelector(component.name)}-selectedConcentrationPercentage`}
                          value={
                            concentrationPercentages?.[component.id]?.minConcentrationPercentage
                            ?? component.minConcentrationPercentage
                          }
                          onClick={(event) => event.stopPropagation()}
                          onFocus={() => setMaxFocused(true)}
                          onBlur={() => setMaxFocused(false)}
                          onChange={(value) => {
                            onChangeConcentrationPercentages?.(
                              component.id,
                              value,
                              value,
                            );
                          }}
                          disabled={disabled}
                        />
                      </Grid>
                    )}
                    {showRequired && (
                      <Grid item>
                        <Checkbox
                          data-testid={`${replaceSpaceInSelector(component.name)}-checkbox`}
                          checked={component.isLeftover
                            || requiredComponentIds?.includes(component.id)}
                          color="primary"
                          size="small"
                          onClick={(event) => event.stopPropagation()}
                          onFocus={() => setMaxFocused(true)}
                          onBlur={() => setMaxFocused(false)}
                          onChange={(_event, checked) => onChangeColorantsRequired?.(
                            component.id,
                            checked,
                          )}
                          disabled={disabled}
                        />
                      </Grid>
                    )}
                  </Grid>
                )}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </LoadingContainer>
      </div>
    </div>
  );
};

export default TransferListBlock;
