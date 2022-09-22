import { Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import { Credit } from '@xrite/licenses-credits/types';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { Component, ClassNameProps } from '../../../types/component';
import { Body } from '../../../components/Typography';
import LicenseText from './LicenseText';

const useStyles = makeStyles((theme) => ({
  detail: {
    paddingBottom: theme.spacing(2),
  },
  name: {
    fontWeight: 'bold',
  },
  accordion: {
    background: theme.palette.surface[2],
  },
}));

type Props = ClassNameProps & {
  license: Credit,
};

const License: Component<Props> = ({
  license,
}) => {
  const classes = useStyles();

  const { t } = useTranslation();

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }} classes={{ root: classes.accordion }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Body className={classes.name}>{license.name}</Body>
      </AccordionSummary>
      <AccordionDetails>
        <div>
          { license.author && <Body className={classes.detail}>{t('labels.author', { author: license.author })}</Body> }
          { license.repository && <Body className={classes.detail}>{t('labels.link', { link: license.repository })}</Body> }
          <LicenseText filename={license.filename} />
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export default License;
