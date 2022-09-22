import {
  Grid,
  makeStyles,
} from '@material-ui/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { BasicMaterialType } from '@xrite/cloud-formulation-domain-model';

import Select from '../../../components/Select';
import { useAddPrintApplication, useAssortment, useBasicMaterial } from '../../../data/api/cfdb';
import { Caption } from '../../../components/Typography';
import { ConcentrationPercentages, FormulationComponent } from '../../../types/formulation';
import TransferList from './TransferList';
import AddPrintApplication from './AddPrintApplication';

const useStyles = makeStyles((theme) => ({
  growingSection: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1,
  },
  inputRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
    minHeight: theme.spacing(5.25),

    '&>p': {
      marginRight: theme.spacing(2),
      width: theme.spacing(22),
    },
  },
  printApplications: {
    marginBottom: theme.spacing(1.5),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  marginBottom: {
    marginBottom: theme.spacing(1.5),
  },
}));

type Props = {
  isFetching?: boolean;
  selectedAdditiveIds: string[];
  onSelectAdditives: (arg: string[]) => void;
  concentrationPercentages: ConcentrationPercentages;
  onChangeConcentrationPercentages: (
    componentId: string,
    minConcentrationPercentage?: number,
    maxConcentrationPercentage?: number,
  ) => void;
  selectedAssortmentId?: string;
};

type Additive = FormulationComponent & {
  creationDateTime: string;
  creatorId: string;
  aclId: string;
}

const Additives = ({
  isFetching,
  selectedAdditiveIds,
  onSelectAdditives,
  concentrationPercentages,
  onChangeConcentrationPercentages,
  selectedAssortmentId,
}: Props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selectedPrintApplicationId, setSelectedPrintApplicationId] = useState<string>();
  const [savingPrintApplication, setSavingPrintApplication] = useState(false);

  const {
    mutation: [create],
  } = useAddPrintApplication();

  const { basicMaterials, fetching: basicMaterialsFetching } = useBasicMaterial();
  const {
    result: assortment,
    fetching: assortmentFetching,
  } = useAssortment(selectedAssortmentId);

  const printApplicationOptions = assortment?.printApplications?.map(
    (printApplication) => printApplication?.name,
  );

  const additives = basicMaterials?.reduce((acc, material): Additive[] => {
    const {
      id, name, type, creationDateTime, creatorId, aclId, price,
    } = material;
    if (!id || !name || !type || type !== 'Additive') return acc;

    const additive = {
      id,
      name,
      creationDateTime,
      creatorId,
      aclId,
      price,
      previewColor: [255, 255, 255],
      type: 'Clear',
      basicMaterialType: type,
      specificMass: 0,
      isLeftover: false,
      minConcentrationPercentage: 0,
      maxConcentrationPercentage: 100,
    } as Additive;
    return [...acc, additive];
  }, [] as Additive[]);

  const selectedAdditives = additives?.filter((component) => {
    return selectedAdditiveIds.includes(component.id);
  });
  const selectedAdditivesIds = selectedAdditives?.map((additive) => additive.id) ?? [];

  if (!additives) return null;

  const handleSelectPrintApplication = (selectedName: string) => {
    // set select state
    setSelectedPrintApplicationId(selectedName);

    // set transferList state to the print applications additives
    const selectedPrintApplication = assortment?.printApplications?.filter((printApplication) => {
      return printApplication.name === selectedName;
    });
    const printApplicationAdditiveIds = selectedPrintApplication?.[0]?.components
      ?.map((printApplication) => printApplication.basicMaterial.id) ?? [];
    onSelectAdditives(printApplicationAdditiveIds);

    // set concentrations state to the print applications concentrations
    selectedPrintApplication?.[0]?.components?.map((printApplication) => {
      const componentId = printApplication.basicMaterial.id;
      const concentrationPercentage = printApplication.concentrationPercentage * 100 ?? 0;
      onChangeConcentrationPercentages(
        componentId, concentrationPercentage, concentrationPercentage,
      );
      return true;
    });
  };

  const handleAddPrintApplication = async (name: string) => {
    setSavingPrintApplication(true);

    const components = selectedAdditives.map((additive) => {
      const { id } = additive;
      const concentrationPercentage = concentrationPercentages?.[id]?.maxConcentrationPercentage
        ?? 0;
      return {
        basicMaterial: {
          id,
          name: additive.name,
          type: BasicMaterialType.Additive,
          creationDateTime: additive.creationDateTime,
          creatorId: additive.creatorId,
          aclId: additive.aclId,
          price: additive?.price?.amount ? additive?.price : undefined,
        },
        concentrationPercentage: concentrationPercentage / 100 ?? 0,
      };
    });

    const printApplication = {
      id: uuid(),
      name,
      creationDateTime: new Date().toISOString(),
      components,
    };

    await create({ printApplication, parentId: selectedAssortmentId, parentType: 'assortment' });

    setSelectedPrintApplicationId(printApplication.id);
    setSavingPrintApplication(false);
  };

  return (
    <Grid item className={classes.growingSection}>
      <Caption className={classes.marginBottom}>{t('labels.application')}</Caption>
      <div className={classes.printApplications}>
        <Select
          id="print-application-select"
          dataTestId="selectedPrintApplication"
          disabled={assortmentFetching}
          isMulti={false}
          value={selectedPrintApplicationId}
          data={printApplicationOptions}
          onChange={handleSelectPrintApplication}
        />
        <AddPrintApplication
          saving={savingPrintApplication}
          disabled={selectedAdditivesIds.length === 0}
          handleUserAdded={handleAddPrintApplication}
        />
      </div>
      <TransferList
        dataTestId="additives-transfer-list"
        isFetching={isFetching || basicMaterialsFetching}
        components={additives}
        concentration="single"
        selectedComponentIds={selectedAdditivesIds}
        showRequired={false}
        onSelectComponents={(selectedIds) => onSelectAdditives(selectedIds)}
        concentrationPercentages={concentrationPercentages}
        onChangeConcentrationPercentages={onChangeConcentrationPercentages}
        availableBlockLabel={t('labels.availableAdditives')}
      />
    </Grid>
  );
};

export default Additives;
