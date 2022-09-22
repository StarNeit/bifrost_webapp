/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import axios from 'axios';

import { SectionSettings, ValidationError } from './api/uss/api';
import { useSession } from './authentication';
import useToast from './useToast';
import { useDebouncedCallback } from '../utils/utils';

export const createUseSettings = <T>({
  sectionSettings,
  debounceDelay,
  showDefaultWarning,
}: {
  sectionSettings: SectionSettings<T>,
  debounceDelay?: number,
  showDefaultWarning?: boolean,
}) => () => {
    const session = useSession();
    const { showToast } = useToast();
    const { t } = useTranslation();

    const { data, isValidating, mutate } = useSWR(
      sectionSettings.id,
      async () => {
        try {
          return await sectionSettings.get(session.token);
        } catch (e) {
          if (!(e instanceof ValidationError)
            && !(axios.isAxiosError(e) && e?.response?.status === 404)) {
            showToast(t('messages.ussFetchingError'), 'error');
          }

          if (showDefaultWarning) {
            showToast(t('messages.ussFetchingDefaultWarning', { section: sectionSettings.id }), 'warning');
          }

          await sectionSettings.set(
            session.token,
            sectionSettings.defaultConfiguration.values,
            sectionSettings.defaultConfiguration.lockedForDescendants,
          );
          return Promise.resolve(sectionSettings.defaultConfiguration);
        }
      },
    );

    const [isUpdating, setUpdating] = useState(false);

    const debounceSet = useDebouncedCallback(async (newConfiguration) => {
      await sectionSettings.set(
        session.token,
        newConfiguration,
      );
      setUpdating(false);
    }, debounceDelay || 1000);

    const debouncedSetConfiguration = async (newConfiguration: T) => {
      setUpdating(true);
      mutate({
        values: newConfiguration,
      }, false);

      try {
        await debounceSet(newConfiguration);
      } catch (e) {
        showToast(t('messages.ussSettingError'), 'error');
      }
    };

    const setConfiguration = async (newConfiguration: T) => {
      setUpdating(true);
      mutate({
        values: newConfiguration,
      }, false);

      try {
        await sectionSettings.set(
          session.token,
          newConfiguration,
        );
        mutate({
          values: newConfiguration,
        }, false);
      } catch (e) {
        showToast(t('messages.ussSettingError'), 'error');
      }
      setUpdating(false);
    };

    useEffect(() => {
      const beforeUnloadHandler = () => {
        debounceSet.flush();
      };

      window.addEventListener('beforeunload', beforeUnloadHandler);
      return () => {
        window.removeEventListener('beforeunload', beforeUnloadHandler);
        debounceSet.flush();
      };
    }, []);

    return {
      configuration: data?.values,
      isValidating,
      /** The initial data is still being fetched. */
      isLoading: !data && isValidating,
      setConfiguration,
      debouncedSetConfiguration,
      /** The user's update request is still pending. */
      isUpdating,
    };
  };
