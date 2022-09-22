import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import {
  useState,
} from 'react';

import fileSaver from 'file-saver';
import { AppearanceSample, Assortment } from '@xrite/cloud-formulation-domain-model';
import clsx from 'clsx';

import { Body } from '../../components/Typography';
import { Component } from '../../types/component';
import ActionToolbar from './ActionToolbar';
import RecipeDisplayTable from './RecipeDisplayTable';
import {
  OutputRecipeComponentWithColor,
  OutputRecipeWithColors,
  RecipeUnit,
  TotalMode,
} from '../../types/recipe';
import { getPDFReport } from '../../data/api/reportingService';
import { useSession } from '../../data/authentication';
import { useColorants, useStandard } from '../../data/api';
import { useSelectedAppearanceSample } from '../../utils/utilsSamples';
import useToast from '../../data/useToast';
import ExportPopover from '../../pages/common/ExportPopover';
import { FormatType } from '../../data/api/appearanceDataExportService';

import { useDebouncedCallback, useDefaultPrecision } from '../../utils/utils';
import { WidgetUpdate, TableSettings } from '../WidgetLayout/types';
import { CorrectionMode } from '../../types/cfe';
import { RecipeTableReportProps } from '../../reports/types';
import { useFileExport } from '../../data/appearanceDataExportService.hooks';

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: 'column',
    display: 'flex',
    height: '100%',
  },
  infoText: {
    padding: theme.spacing(1, 1, 0, 1),
  },
  recipeTable: {
    flex: 1,
  },
  recipeCostLabel: {
    textAlign: 'right',
    paddingBottom: theme.spacing(1),
  },
}));

export type RecipeDisplayTableProps = {
  data: OutputRecipeWithColors,
  dataTestId?: string,
  canUnit: RecipeUnit,
  updateCanUnit: (newUnit: RecipeUnit) => void,
  recipeUnit: RecipeUnit,
  updateRecipeUnit: (newUnit: RecipeUnit) => void,
  handleAmountChange: (colorantId: string, layerIndex: number, newAmount: number) => void,
  totalMode: TotalMode,
  updateTotalMode: (newTotalMode: TotalMode) => void,
  canSize: number,
  correctionMode: CorrectionMode,
  updateCanSize: (newCanSize: number) => void,
  recipeCost?: string,
  viscosity?: number,
  assortment?: Assortment,
  substrateName?: string,
  showTotalMode?: boolean,
  availableRecipeUnits: RecipeUnit[],
  relativeThickness?: number,
  disableCanResize: boolean,
  isCorrection: boolean,
  onChange: (update: WidgetUpdate) => void,
  tableSettings?: TableSettings,
  originalAppearanceSample?: AppearanceSample,
};

const RecipeDisplay: Component<RecipeDisplayTableProps> = (props) => {
  const {
    data,
    dataTestId,
    canUnit,
    updateCanUnit,
    recipeUnit,
    updateRecipeUnit,
    canSize,
    updateCanSize,
    handleAmountChange,
    recipeCost,
    viscosity,
    assortment,
    substrateName,
    showTotalMode,
    availableRecipeUnits,
    relativeThickness,
    disableCanResize,
    totalMode,
    updateTotalMode,
    onChange,
    tableSettings,
    correctionMode,
    isCorrection,
    originalAppearanceSample,
  } = props;
  const classes = useStyles();
  const { t } = useTranslation();
  const session = useSession();
  const { showToast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);
  const [dispenseAnchorEl, setDispenseAnchorEl] = useState<null | HTMLElement>(null);
  const debouncedHandleAmountChange = useDebouncedCallback(handleAmountChange, 300);
  const { round, toNumber } = useDefaultPrecision();
  const {
    fileFormats,
    selectedFileFormat,
    setSelectedFileFormat,
    isExporting: isDispensing,
    exportData,
  } = useFileExport(FormatType.Dispenser);

  const {
    selectedSample,
    formulaSample,
    type,
  } = useSelectedAppearanceSample();

  const { result: standard } = useStandard({ id: selectedSample?.standardId });
  const { result: colorants } = useColorants(assortment?.id);

  const createCSV = () => {
    const lines = data.layers.map((layer, layerIndex) => {
      const layerLines = layer.components.map((colorant) => {
        return `${colorant.name}\t${colorant.percentage}\t${colorant.amount}`;
      });
      if (data.layers.length > 1) layerLines.unshift(`Layer ${layerIndex}`);
      return layerLines.join('\n');
    });
    lines.unshift('Component\tConcentration\tAmount');
    return lines.join('\n');
  };

  const copyCSV = () => {
    navigator.clipboard.writeText(createCSV());
  };

  const onDispense = async () => {
    if (!selectedSample
      || !assortment
      || !standard?.name
      || !colorants
      || !formulaSample) return;
    setDispenseAnchorEl(null);

    const fullAssortment = {
      ...assortment,
      colorants,
    } as Assortment;

    const { formula } = formulaSample;

    const dispenseSample = AppearanceSample.parse({
      ...selectedSample,
      formula,
    });

    const { recipeOutputMode } = data.layers[0].components[0];

    const IFSDispensePayload = {
      appearanceSample: dispenseSample,
      originalAppearanceSample,
      assortment: fullAssortment,
      standardName: standard?.name,
      recipeOutputMode,
      recipeUnit,
      totalMode,
      isCorrection: type === 'correctionEntry',
    };

    exportData({ type: FormatType.Dispenser, payload: IFSDispensePayload });
  };

  const printPDF = () => {
    const standardName = standard?.name;
    const formulaName = formulaSample?.name;
    const sampleName = selectedSample?.name;
    const assortmentName = assortment?.name;

    const { recipeOutputMode } = data.layers[0].components[0];

    const transformedDataForPrint = {
      ...data,
      layers: data.layers.map((layer) => ({
        ...layer,
        components: layer.components.map<OutputRecipeComponentWithColor>((component) => ({
          ...component,
          isAmountEditable: false,
          allowEditingAdditives: false,
          recipeOutputMode,
        })),
      })),
    };

    const payload: RecipeTableReportProps = {
      formulaName,
      projectName: '',
      standardVersion: '',
      standardName,
      sampleName,
      recipeDisplayTableData: {
        controls: {
          canUnit: canUnit.id,
          recipeUnit: recipeUnit.id,
          canAmount: round(data.canSize, toNumber),
        },
        data: transformedDataForPrint,
        recipeCost,
        onChange,
        tableSettings,
        correctionMode,
        isCorrection,
        assortmentName,
        substrateName,
        viscosity,
      },
    };

    const fileName = `${standardName}-${formulaName}-${sampleName}`;
    setIsPrinting(true);
    getPDFReport(session.token, fileName, payload).catch(() => {
      showToast(t('messages.printError'), 'error');
    }).finally(() => {
      setIsPrinting(false);
    });
  };

  const downloadCSV = () => {
    const blob = new Blob([createCSV()], { type: 'application/text;charset=utf-8' });
    fileSaver.saveAs(blob, 'recipe.txt');
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    fileSaver.saveAs(blob, 'recipe.json');
  };

  return (
    <>
      <div className={classes.container}>
        <Body className={classes.infoText}>{`${t('labels.assortment')}: ${assortment?.name || '-'}`}</Body>
        <Body className={classes.infoText}>{`${t('labels.substrate')}: ${substrateName || '-'}`}</Body>
        {!!viscosity && (<Body className={classes.infoText}>{`${t('labels.viscosity')}: ${viscosity} s`}</Body>)}
        <ActionToolbar
          canUnit={canUnit}
          updateCanUnit={updateCanUnit}
          recipeUnit={recipeUnit}
          updateRecipeUnit={updateRecipeUnit}
          canSize={canSize}
          updateCanSize={updateCanSize}
          totalMode={totalMode}
          updateTotalMode={updateTotalMode}
          copyCSV={copyCSV}
          printPDF={printPDF}
          isPrinting={isPrinting}
          downloadCSV={downloadCSV}
          downloadJSON={downloadJSON}
          showTotalMode={showTotalMode}
          availableRecipeUnits={availableRecipeUnits}
          relativeThickness={relativeThickness}
          disableCanResize={disableCanResize}
          openDispense={(e) => setDispenseAnchorEl(e.currentTarget)}
          isDispensing={isDispensing}
        />
        <div className={classes.recipeTable}>
          <RecipeDisplayTable
            key={selectedSample?.id} // unmount and remount when selected sample changes
            data={data}
            dataTestId={dataTestId}
            recipeCost={recipeCost}
            handleAmountChange={debouncedHandleAmountChange}
            onChange={onChange}
            tableSettings={tableSettings}
            correctionMode={correctionMode}
            isCorrection={isCorrection}
          />
        </div>
        {recipeCost && (
          <Body className={clsx(classes.infoText, classes.recipeCostLabel)}>
            {`${t('labels.recipeCost')}: ${recipeCost || '-'}`}
          </Body>
        )}
      </div>
      <ExportPopover
        message={t<string>('messages.selectDispense')}
        actionLabel={t<string>('labels.dispense')}
        open={!!dispenseAnchorEl}
        onClose={() => setDispenseAnchorEl(null)}
        anchorEl={dispenseAnchorEl}
        setFileFormat={setSelectedFileFormat}
        selectedFileFormat={selectedFileFormat}
        availableFileFormats={fileFormats}
        onExport={onDispense}
      />
    </>
  );
};

export default RecipeDisplay;
