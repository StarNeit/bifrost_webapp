import { makeStyles } from '@material-ui/core/styles';
// import CloseIcon from '@material-ui/icons/Close';
// import CheckIcon from '@material-ui/icons/Check';
import { useTranslation } from 'react-i18next';

import PopupModal from '../../components/PopupModal';
import { Title, Body } from '../../components/Typography';
// import ToggleButton from '../../components/ToggleButton';
import { Component } from '../../types/component';
import Panel from '../../components/Panel';
import ExitButton from '../../components/ExitButton';
import Select from '../../components/Select';
import { useSubstrateDataForSwatch } from '../utils';
import { getCSSColorString } from '../../utils/utils';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
  },
  paper: {
    flex: 1,
    background: theme.palette.surface[3],
    padding: theme.spacing(4),
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing(1.5),
    '&:last-child': {
      marginTop: theme.spacing(2),
    },
  },
  form: {
    maxWidth: 200,
    marginRight: theme.spacing(1),
  },
  select: {
    width: 200,
  },
}));

/* const ColorSetup = [
  { label: 'labels.samplesOnly', key: 'sample' },
  { label: 'labels.samplesVsStandard', key: 'standard' },
  { label: 'labels.showImages', key: 'image' },
]; */

interface ColorSet {
  sample: boolean,
  standard: boolean,
  image: boolean,
}

type SwatchBackgroundColor = (
  'None'
  | 'Black'
  | 'Dark Gray (N3.5)'
  | 'Medium Gray (N5)'
  | 'Gray(N.6)'
  | 'Light Gray(N8)'
  | 'White'
  | 'Active Substrate'
  | 'Opacity Card'
)

const getSwatchBackgroundColors = (
  substrateColor: string,
): Record<SwatchBackgroundColor, string> => ({
  None: 'unset',
  Black: '#000000',
  'Dark Gray (N3.5)': 'rgb(83, 84, 83)',
  'Medium Gray (N5)': 'rgb(122, 123, 121)',
  'Gray(N.6)': 'rgb(162, 162, 159)',
  'Light Gray(N8)': 'rgb(200, 200, 197)',
  White: '#fff',
  'Active Substrate': substrateColor,
  'Opacity Card': 'unset', // TODO: add color of opacity card
});

type Props = {
  colors: ColorSet,
  isOpenModal: boolean,
  closeModal(): void,
  onChangeColors(color: ColorSet): void,
  onChangeBackground(value: string): void,
  backgroundColorMode?: string,
}

const ColorSetupModal: Component<Props> = ({
  // onChangeColors,
  onChangeBackground,
  // colors,
  isOpenModal,
  closeModal,
  backgroundColorMode,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { swatchColors } = useSubstrateDataForSwatch();
  const substrateColorRGB = getCSSColorString(
    swatchColors.length
      ? swatchColors[0].colorOfSubstrate
      : [0, 0, 0], // if substrate color does not exist black color is used
  );

  const allBackgroundColors = Object.entries(getSwatchBackgroundColors(substrateColorRGB)).map(
    ([backgroundColorName, backgroundColor]) => ({
      label: backgroundColorName as SwatchBackgroundColor,
      value: backgroundColor,
    }),
  );

  /* const onChangeColor = (key: string) => (checked: boolean) => {
    onChangeColors({
      image: colors.image,
      sample: false,
      standard: false,
      [key]: checked,
    });
  }; */

  return (
    <PopupModal isOpen={isOpenModal}>
      <>
        <div className={classes.header}>
          <Title>{t('titles.OnScreenColorSetup')}</Title>
          <ExitButton onClick={closeModal} />
        </div>

        <Panel className={classes.paper}>
          {/* {ColorSetup.map((item) => (
            <div className={classes.row} key={item.key}>
              <Body>{t(item.label)}</Body>
              <ToggleButton
                className={classes.form}
                isChecked={colors[item.key as 'image' | 'standard' | 'sample']}
                size="small"
                unCheckedLabel={<CloseIcon />}
                checkedLabel={<CheckIcon />}
                onChange={onChangeColor(item.key)}
                disabled={item.key === 'image'} // TODO: add Show Images functionality
              />
            </div>
          ))} */}

          <div className={classes.row}>
            <Body>{t('labels.background')}</Body>
            <Select
              id="background-color-select"
              instanceId="background-color-select"
              data={allBackgroundColors}
              idProp="label"
              labelProp="label"
              isMulti={false}
              onChange={(selection) => onChangeBackground(selection.value)}
              value={allBackgroundColors.find((backgroundColor) => (
                backgroundColor.value === backgroundColorMode
              ))}
            />
          </div>
        </Panel>
      </>
    </PopupModal>
  );
};

export default ColorSetupModal;
