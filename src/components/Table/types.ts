import { Column } from 'react-table';

export type Sort = 'asc' | 'desc' | 'none';

export type TableColumn<T extends {
  id: string;
}> = (Column<T> & {
  // options for table header menu
  disableToggleHide?: boolean | undefined;
  /**
   * Used for displaying the wanted string to table
   * header menu. If the Header is a JSX.Element this
   * is required in order to be shown as a option
   */
  headerMenuValue?: string;
});
