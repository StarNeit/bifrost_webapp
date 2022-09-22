import {
  useRef,
  useState,
} from 'react';
import { CircularProgress, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import DeleteButton from './DeleteButton';
import useToast from '../../../data/useToast';
import SearchableTable from '../../../components/SearchableTable';
import CreatingTool from '../../common/UserTable/CreatingTool';
import { useAccessControlList } from '../../../data/api';
import { ACL } from '../../../types/acl';
import { scrollbars } from '../../../theme/components';

const useStyles = makeStyles((theme) => ({
  tableRoot: {
    background: theme.palette.surface[2],
    borderRadius: theme.spacing(0.75),
    overflowX: 'hidden',
    overflowY: 'auto',
    ...scrollbars(theme),
  },
  tool: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1.375),
  },
  numericCell: {
    textAlign: 'right',
  },
}));

type Props = {
  onSelect: (acl: ACL | undefined) => void;
  accessControlLists: ACL[];
  fetching: boolean;
  selectedAcl?: ACL;
};

const AccessControlLists = ({
  onSelect,
  accessControlLists,
  fetching,
  selectedAcl,
}: Props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const deletedAclId = useRef('');

  const [isCreatingEditable, setIsCreatingEditable] = useState(false);

  const {
    mutation: [create, { fetching: isCreating }],
    removal: [remove, { fetching: isDeleting }],
  } = useAccessControlList();

  if (!accessControlLists && !fetching) return <></>;

  return (
    <div className={classes.tableRoot}>
      <SearchableTable
        title={t('titles.accessControlLists')}
        loading={fetching}
        data={accessControlLists}
        onSelect={(acl) => {
          if (selectedAcl?.id === acl.id) {
            onSelect(undefined);
          } else {
            onSelect(acl);
          }
        }}
        selected={(row) => (selectedAcl ? row.id === selectedAcl.id : false)}
        columns={[{
          id: 'name',
          Header: t<string>('labels.name'),
          accessor: 'name',
          width: 'auto',
        },
        {
          id: 'numberOfUsers',
          Header: () => (
            <div className={classes.numericCell}>{t<string>('labels.numberOfUsers')}</div>
          ),
          width: 110,
          Cell: ({ row: { original } }) => (
            <div className={classes.numericCell}>{(original as ACL).entries?.length ?? ''}</div>
          ),
        },
        {
          id: 'action',
          width: 100,
          Header: t<string>('labels.actions'),
          Cell: ({ row }) => (deletedAclId.current === (row.original as ACL).id && isDeleting ? (
            <CircularProgress size={20} />
          ) : (
            <DeleteButton
              data={row.original as ACL}
              onConfirm={async (acl) => {
                deletedAclId.current = acl.id;
                await remove([acl.id]);
                showToast(t('messages.resourceDeleteSuccess', {
                  name: 'ACL',
                }), 'success');
                setIsCreatingEditable(false);
              }}
            />
          )),
        }]}
      />
      {!fetching && (
      <div className={classes.tool}>
        <CreatingTool
          type="text"
          onCheck={async (name: string) => {
            await create({ name });
            showToast(t('messages.resourceCreateSuccess', {
              name: 'ACL',
            }), 'success');
            setIsCreatingEditable(false);
          }}
          isFetching={isCreating}
          isEditable={isCreatingEditable}
          onSetEditable={setIsCreatingEditable}
          placeholder={t('labels.listName')}
        />
      </div>
      )}
    </div>
  );
};

export default AccessControlLists;
