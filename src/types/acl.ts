export type ACLEntry = {
  userId?: string | null;
  userGroupId?: string | null;
  accessFlags: {
    flags: string;
  };
};

export type ACL = {
  id: string;
  creationDateTime: string;
  name: string;
  entries: ACLEntry[];
  creatorId?: string;
  aclId?: string;
};

export type PartialACL = {
  id: string;
  name: string;
};
