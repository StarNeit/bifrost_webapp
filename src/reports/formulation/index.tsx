import { makeStyles } from '@material-ui/core';
import { Document } from '@xrite/reporting-service-ui';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { Title, Body } from '../../components/Typography';
import RecipeDisplayTable from '../../widgets/RecipeDisplay/RecipeDisplayTable';
import { Component } from '../../types/component';
import { RecipeTableReportProps } from '../types';

const useStyles = makeStyles((theme) => ({
  title: {
    marginBotton: theme.spacing(2),
  },
  column: {
    flexDirection: 'column',
    display: 'flex',
  },
  infoText: {
    padding: theme.spacing(0, 1, 1, 1),
  },
  boldText: {
    padding: theme.spacing(0, 1, 1, 0),
    fontWeight: 'bold',
  },
  printLabel: {
    marginRight: theme.spacing(2),
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    display: 'flex',
  },
}));

type Props = { payload?: RecipeTableReportProps };

const Report: Component<Props> = ({ payload }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  if (!payload) return <div>NO PAYLOAD WAS SENT</div>;

  const {
    formulaName,
    standardName,
    sampleName,
    projectName,
    standardVersion,
    recipeDisplayTableData,
  } = payload;

  return (
    <Document>
      {/* Project Name - Not currently implimented in front end */}
      <Title className={classes.title}>{`${t('labels.projectName')}: ${projectName ?? ''}`}</Title>
      <Title className={classes.title}>{`${t('labels.standardName')}: ${standardName ?? ''}`}</Title>

      <div className={classes.row}>
        {/* Standard Version - Not currently implimented in front end */}
        <Body className={classes.boldText}>{`${t('labels.standardVersion')}: `}</Body>
        <Body className={classes.infoText}>{standardVersion ?? ''}</Body>

      </div>

      <div className={classes.row}>
        <Body className={classes.boldText}>{`${t('labels.formulaName')}: `}</Body>
        <Body className={classes.infoText}>{formulaName ?? ''}</Body>

      </div>

      <div className={classes.row}>
        <Body className={classes.boldText}>{`${t('labels.sampleName')}: `}</Body>
        <Body className={classes.infoText}>{sampleName ?? ''}</Body>
      </div>

      <div className={classes.column}>

        <div className={classes.row}>
          <Body className={classes.boldText}>{t('labels.assortment')}</Body>
          <Body className={classes.infoText}>
            {recipeDisplayTableData?.assortmentName || '-'}
          </Body>
        </div>

        <div className={classes.row}>
          <Body className={classes.boldText}>{t('labels.substrate')}</Body>
          <Body className={classes.infoText}>
            {recipeDisplayTableData?.substrateName || '-'}
          </Body>
        </div>
        {
          recipeDisplayTableData && (
            <>
              <div className={classes.row}>
                {!!recipeDisplayTableData?.viscosity && (
                  <div className={clsx(classes.column, classes.printLabel)}>
                    <Body className={classes.boldText}>{t('labels.viscosity')}</Body>
                    <Body className={classes.infoText}>
                      {`${recipeDisplayTableData.viscosity} s`}
                    </Body>
                  </div>
                )}
                <div className={clsx(classes.column, classes.printLabel)}>
                  <Body className={classes.boldText}>{t('labels.canSize')}</Body>
                  <div className={classes.row}>
                    <Body className={classes.infoText}>
                      {recipeDisplayTableData?.controls.canAmount}
                    </Body>
                    <Body className={classes.infoText}>
                      {recipeDisplayTableData?.controls.canUnit}
                    </Body>
                  </div>
                </div>
                <div className={classes.column}>
                  <Body className={classes.boldText}>{t('labels.recipeUnit')}</Body>
                  <Body className={classes.infoText}>
                    {recipeDisplayTableData?.controls.recipeUnit}
                  </Body>
                </div>
              </div>
              <RecipeDisplayTable
                {...recipeDisplayTableData}
              />
            </>
          )
        }
      </div>
    </Document>
  );
};

export default Report;
