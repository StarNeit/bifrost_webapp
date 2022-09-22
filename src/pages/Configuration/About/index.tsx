import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { Credit } from '@xrite/licenses-credits/types';

import config from '../../../config';
import Label from './Label';
import { useLicensesList } from '../../../data/licenses';
import License from './License';
import { Body, Header } from '../../../components/Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
    flexDirection: 'column',
    display: 'flex',
    height: '100%',
    overflow: 'auto',
  },
  section: {
    marginTop: theme.spacing(2),
  },
}));

const About = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data } = useLicensesList();

  const clientVersion = `${t('labels.client')}: ${config.VERSION}`;

  return (
    <form className={classes.root}>
      <Label
        label={t('labels.version')}
        body={clientVersion}
      />

      { config.POST_MEASUREMENT_URL && (
        <Label
          className={classes.section}
          label={t('labels.deviceMeasurementUrl')}
          body={config.POST_MEASUREMENT_URL}
        />
      )}

      <Header className={classes.section}>{t('labels.librariesWeUse')}</Header>
      <Body>{t('messages.openSourceIntroMessage')}</Body>
      <div className={classes.section}>
        {data && (
          // eslint-disable-next-line react/no-array-index-key
          data.map((license: Credit, index: number) => <License key={index} license={license} />)
        )}
      </div>
    </form>
  );
};

export default About;
