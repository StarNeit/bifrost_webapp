import clsx from 'clsx';
import map from 'lodash/map';
import uniq from 'lodash/uniq';
import {
  IconButton,
  makeStyles,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/AddCircle';
import CheckIcon from '@material-ui/icons/Check';
import CancelIcon from '@material-ui/icons/Cancel';
import { Colorant } from '@xrite/cloud-formulation-domain-model';

import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApplyTag } from '../../../data/api';
import Select from '../../../components/Select';
import { FormulationComponent } from '../../../types/formulation';
import ConfirmationPopover from '../../../components/ConfirmationPopover';
import { Body } from '../../../components/Typography';
import InputField from '../../../components/InputField';
import RefreshIcon from '../../../components/RefreshIcon';

const useStyles = makeStyles((theme) => ({
  row: {
    display: 'flex',
    height: theme.spacing(4),
  },
  buttons: {
    marginLeft: theme.spacing(2),
    width: theme.spacing(4),
    height: '100%',
    color: 'white',
  },
  centered: {
    alignItems: 'center',
  },
  input: {
    width: theme.spacing(22.5),
  },
  spinner: {
    marginLeft: theme.spacing(2),
    position: 'relative',
  },
  groupSelectContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  deleteButtonIcon: {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    color: 'white',
  },
}));

type Props = {
  colorants: Colorant[] | undefined;
  components: FormulationComponent[] | undefined;
  selectedComponentIds: string[];
  onSelectComponents: (arg: string[]) => void;
  showSelectAll: boolean;
  showDelete: boolean;
  showCreate: boolean;
};

type ComponentGroup = {
  name: string;
  componentIds: string[];
  colorantIds: string[];
};

const ColorantGroupSelect = ({
  colorants,
  components,
  selectedComponentIds,
  onSelectComponents,
  showSelectAll,
  showDelete,
  showCreate,
}: Props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const options = useMemo<ComponentGroup[]>(() => {
    const SELECT_ALL: ComponentGroup = {
      name: t('labels.selectAll'),
      componentIds: components
        ?.filter(({ isLeftover }) => !isLeftover)
        .map(({ id }) => id) || [],
      colorantIds: colorants
        ?.filter(({ isLeftover }) => !isLeftover)
        .map(({ id }) => id) || [],
    };

    const groupsData = colorants?.reduce((groups, colorant) => {
      colorant.tags?.forEach((tag) => {
        const component = components?.find(({ id }) => id === colorant.id
          || colorant.components.some((colComp) => colComp.basicMaterial.id === id));
        if (!component) return;
        const mergedTags = groups[tag]
          ? {
            componentIds: uniq([...groups[tag].componentIds, component.id]),
            colorantIds: uniq([...groups[tag].colorantIds, colorant.id]),
          }
          : {
            componentIds: [component.id],
            colorantIds: [colorant.id],
          };
        // eslint-disable-next-line no-param-reassign
        groups[tag] = mergedTags;
      });
      return groups;
    }, {} as Record<string, {componentIds: string[], colorantIds: string[]}>);
    const colorantOptions = map(
      groupsData,
      (ids, name): ComponentGroup => ({ ...ids, name }),
    );
    const allOptions = showSelectAll ? [SELECT_ALL, ...colorantOptions] : colorantOptions;
    return allOptions;
  },
  [components]);
  const {
    mutation: [createGroup],
    removal: [deleteGroup],
  } = useApplyTag();

  const [isMutatingGroup, setMutatingGroup] = useState(false);
  const [isCreatingGroup, setCreatingGroup] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<ComponentGroup>();
  const [newGroupName, setNewGroupName] = useState<string>();

  const [openConfirmationPopover, setOpenConfirmationPopover] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleGroupCreation = async () => {
    if (newGroupName && selectedComponentIds && colorants) {
      try {
        setMutatingGroup(true);
        const selectedColorantIds = colorants.filter(
          (colorant) => selectedComponentIds.includes(colorant.id)
            || colorant.components.some(
              (colComp) => selectedComponentIds.includes(colComp.basicMaterial.id),
            ),
        ).map(({ id }) => id);
        await createGroup(selectedColorantIds, newGroupName, 'Colorant');
      } finally {
        setMutatingGroup(false);
        setCreatingGroup(false);
      }
    }
  };

  const GroupCreation = (
    <div className={classes.row}>
      <InputField
        className={classes.input}
        value={newGroupName}
        onChange={setNewGroupName}
        disabled={isMutatingGroup}
        placeholder={t('labels.enterName')}
      />
      {isMutatingGroup ? <RefreshIcon fetching className={classes.spinner} /> : (
        <>
          <IconButton
            className={classes.buttons}
            onClick={handleGroupCreation}
            disabled={!newGroupName}
          >
            <CheckIcon />
          </IconButton>
          <IconButton
            className={classes.buttons}
            onClick={() => {
              setCreatingGroup(false);
              setNewGroupName(undefined);
            }}
          >
            <CancelIcon />
          </IconButton>
        </>
      )}
    </div>
  );

  return (
    <>
      {!isCreatingGroup ? (
        <div ref={anchorRef} className={clsx(classes.row, classes.centered)}>
          <Select
            data={options}
            idProp="name"
            labelProp="name"
            isMulti={false}
            placeholder={t('messages.selectColorantGroup')}
            isLoading={isMutatingGroup}
            onChange={({ componentIds }) => {
              onSelectComponents(uniq([...selectedComponentIds, ...componentIds]));
            }}
            formatOptionLabel={(option, { context }) => (
              context !== 'value' && (
              <div className={classes.groupSelectContainer}>
                <Body>{option.label}</Body>
                {showDelete && (
                <IconButton
                  className={classes.deleteButton}
                  onClick={() => {
                    setOpenConfirmationPopover(true);
                    setGroupToDelete(option.value);
                  }}
                >
                  <DeleteIcon className={classes.deleteButtonIcon} />
                </IconButton>
                )}
              </div>
              )
            )}
          />
          {showCreate && (
          <IconButton
            className={classes.buttons}
            disabled={selectedComponentIds.length === 0}
            onClick={() => setCreatingGroup((prev) => !prev)}
          >
            <AddIcon />
          </IconButton>
          )}
          <ConfirmationPopover
            isDestructive
            onClose={() => setOpenConfirmationPopover(false)}
            message={t('labels.doYouWantToDelete')}
            open={openConfirmationPopover}
            anchorEl={anchorRef.current}
            cancelText={t('labels.cancel')}
            confirmText={t('labels.delete')}
            onConfirm={async () => {
              try {
                setMutatingGroup(true);
                setOpenConfirmationPopover(false);
                if (groupToDelete?.colorantIds && groupToDelete?.name) {
                  await deleteGroup(groupToDelete.colorantIds, [groupToDelete.name]);
                }
              } finally {
                setMutatingGroup(false);
              }
            }}
          />
        </div>
      ) : GroupCreation}

    </>
  );
};

export default ColorantGroupSelect;
