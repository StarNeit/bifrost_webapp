import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';

import InputField from '../../../../../components/InputField';
import { Body, Subtitle } from '../../../../../components/Typography';
import { Component } from '../../../../../types/component';
import Button from '../../../../../components/Button';

const useStyles = makeStyles((theme) => ({
  title: {
    textTransform: 'uppercase',
  },
  filter: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  field: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallInput: {
    '&$smallInput': {
      width: theme.spacing(31.88),
    },
  },
  smallButton: {
    marginLeft: theme.spacing(1),
    height: theme.spacing(4.25),
    fontSize: theme.spacing(1.25),
    textTransform: 'capitalize',
  },

  // utilities classes
  mb2: {
    marginBottom: theme.spacing(2),
  },
}));

interface FiltersProps {
  dataTestId?: string;
  from: Date | null;
  to: Date | null;
  clearFilters: () => void;
  handleDateChangeFrom: (date: Date | null) => void;
  handleDateChangeTo: (date: Date | null) => void;
}

const parseDate = (dateFilterInputString?: string): Date | null => {
  if (!dateFilterInputString) return null;

  const date = parseISO(dateFilterInputString);
  if (date instanceof Date && !Number.isNaN(Number(date))) {
    return date;
  }
  return null;
};

const Filters: Component<FiltersProps> = ({
  dataTestId,
  handleDateChangeFrom,
  handleDateChangeTo,
  from,
  to,
  clearFilters,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.filter}>
      <div className={classes.field}>
        <Subtitle className={clsx(classes.title)}>
          {`${t('labels.filters')}`}
        </Subtitle>
        <Button
          variant="primary"
          disabled={false}
          className={classes.smallButton}
          onClick={clearFilters}
        >
          {t('labels.clear')}
        </Button>
      </div>
      {/*  <div className={classes.field}>
              <Body>
                {t('labels.substrate')}
              </Body>
              <Select
                instanceId="substrate-select"
                id="substrate-select"
                dataTestId="selectedSubstrate"
                className={classes.input}
                value={selectedSubstrate}
                placeholder={t('labels.filterBySubstrate')}
                data={substrates}
                isMulti={false}
                idProp="id"
                labelProp="name"
                onChange={(substrate: SubstratesData) => setSelectedSubstrate(substrate)}
                disabled={fetching}
              />
            </div>

            <div className={classes.field}>
              <Body>
                {t('labels.type')}
              </Body>
              <Select
                instanceId="substrate-select"
                id="substrate-select"
                dataTestId="selectedSubstrate"
                className={classes.input}
                value={selectedSubstrate}
                placeholder={`${t('labels.standard')} / ${t('labels.sample')}`}
                data={substrates}
                isMulti={false}
                idProp="id"
                labelProp="name"
                // onChange={(substrate: SubstratesData) => onChangeSubstrate(substrate.id)}
                onChange={(substrate: SubstratesData) => setSelectedSubstrate(substrate)}
                disabled={fetching}
              />
            </div>

            <div className={classes.field}>
              <Body>
                {t('labels.includeTags')}
              </Body>
              <Select
                instanceId="substrate-select"
                id="substrate-select"
                dataTestId="selectedSubstrate"
                className={classes.input}
                value={selectedSubstrate}
                placeholder={t('labels.filterBySubstrate')}
                data={substrates}
                isMulti={false}
                idProp="id"
                labelProp="name"
                // onChange={(substrate: SubstratesData) => onChangeSubstrate(substrate.id)}
                onChange={(substrate: SubstratesData) => setSelectedSubstrate(substrate)}
                disabled={fetching}
              />
            </div>

            <div className={classes.field}>
              <Body>
                {t('labels.excludeTags')}
              </Body>
              <Select
                instanceId="substrate-select"
                id="substrate-select"
                dataTestId="selectedSubstrate"
                className={classes.input}
                value={selectedSubstrate}
                placeholder={t('labels.filterBySubstrate')}
                data={substrates}
                isMulti={false}
                idProp="id"
                labelProp="name"
                // onChange={(substrate: SubstratesData) => onChangeSubstrate(substrate.id)}
                onChange={(substrate: SubstratesData) => setSelectedSubstrate(substrate)}
                disabled={fetching}
              />
            </div> */}

      <div>
        <Body className={classes.mb2}>
          {t('labels.timePeriod')}
        </Body>
        <div className={classes.field}>
          <Body>
            {t('labels.from')}
          </Body>
          <InputField
            dataTestId={`${dataTestId}-from-date`}
            type="date"
            className={classes.smallInput}
            onChange={(e) => handleDateChangeFrom(parseDate(e))}
            value={from ? format(from, 'yyyy-MM-dd') : ''}
          />
          <Body>
            {t('labels.to')}
          </Body>
          <InputField
            dataTestId={`${dataTestId}-to-date`}
            type="date"
            className={classes.smallInput}
            onChange={(e) => handleDateChangeTo(parseDate(e))}
            value={to ? format(to, 'yyyy-MM-dd') : ''}
          />
        </div>
      </div>
    </div>
  );
};

export default Filters;
