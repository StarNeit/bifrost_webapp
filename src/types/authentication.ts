export interface Session {
  username: string;
  token: string;
  userId: number;
  companyId: string;
  userAccessLevelId: number;
  hasAdminAccess: boolean;
}
