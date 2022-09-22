import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import {
  ExportPayload,
  getFileFormats,
  FileFormat,
  FormatType,
  downloadFile,
} from './api/appearanceDataExportService';
import { useSession } from './authentication';
import useToast from './useToast';

export const useFileExport = (type: FormatType) => {
  const session = useSession();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [selectedFileFormat, setSelectedFileFormat] = useState<FileFormat>();
  const [isExporting, setIsExporting] = useState(false);

  const { data: fileFormats } = useSWR(['export', type], () => getFileFormats(session.token, type));

  useEffect(() => {
    if (!fileFormats?.length) return;

    const firstFileFormat = fileFormats[0];

    setSelectedFileFormat(firstFileFormat);
  }, [fileFormats]);

  const exportData = async (exportPayload: ExportPayload) => {
    if (!selectedFileFormat) return;

    setIsExporting(true);

    if (exportPayload.type !== type) throw new Error('File format type does not match');

    try {
      await downloadFile(session.token, exportPayload, selectedFileFormat.id);
    } catch (error) {
      if (exportPayload.type === FormatType.Dispenser) showToast(t('messages.dispenseError'), 'error');
      if (exportPayload.type === FormatType.File) showToast(t('messages.exportError'), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    fileFormats,
    selectedFileFormat,
    setSelectedFileFormat,
    exportData,
    isExporting,
  };
};
