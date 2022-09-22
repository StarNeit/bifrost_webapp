import axios from 'axios';
import config from '../../config';
import { validateFmsDevices } from './deviceUtils';

const LOGIN_URL = `${config.FMS_URL}/user/login`;
const DEVICES_URL = `${config.FMS_URL}/devices`;
const LOCATIONS_URL = `${config.FMS_URL}/locations`;
const SESSION_URL = `${config.FMS_URL}/company-user/info`;
const COMPANY_USERS_URL = `${config.FMS_URL}/company-user/get-company-users`;

interface UserData {
  companyId: string;
  isAdmin: boolean;
  token: string;
}

export interface FMSDevice {
  deviceType: string;
  locationId: string;
  locationName: string;
  model: string;
  serialNumber: string;
}

interface FMSLocation {
  children: FMSLocation[];
  efxAdmin: boolean;
  locationId: string;
  name: string;
  parentLocationId: string;
}

interface FMSUser {
  companyId: string;
  userId: number;
  userAccessLevelId: number;
}

export interface FMSCompanyUser {
  firstName: string;
  lastName: string;
  email: string;
  userId: number;
  xriteUserId: number;
  userAccessLevelId: number;
  companyId: string;
  acceptedEulaAt: string;
  languageId: number;
  isLocalAdmin: number;
}

export async function login(username: string, password: string): Promise<UserData> {
  const response = await axios.post(LOGIN_URL, {
    username,
    password,
  });
  return ({
    companyId: response.headers['xr-companyid'],
    isAdmin: response.headers['xr-isadmin'] === 'True',
    token: response.headers['xr-token'],
  });
}

export async function getDevices(token: string): Promise<FMSDevice[]> {
  const response = await axios.get<FMSDevice[]>(DEVICES_URL, {
    headers: {
      'xr-token': token,
    },
  });
  return validateFmsDevices(response.data);
}

export async function getLocations(token: string): Promise<FMSLocation[]> {
  const response = await axios.get<FMSLocation[]>(LOCATIONS_URL, {
    headers: {
      'xr-token': token,
    },
  });
  return response.data;
}

export async function getUserInfo(token: string): Promise<FMSUser> {
  const response = await axios.get<FMSUser>(SESSION_URL, {
    headers: {
      'xr-token': token,
    },
  });

  if (response.status !== 200) {
    throw new Error('Invalid session');
  }
  return response.data;
}

export async function getCompanyUsers(token?: string, companyId?: string)
  : Promise<FMSCompanyUser[]> {
  const response = await axios.get<FMSCompanyUser[]>(`${COMPANY_USERS_URL}/${companyId}`, {
    headers: {
      'xr-token': token,
    },
  });

  if (response.status !== 200) {
    throw new Error('Invalid session');
  }
  return response.data;
}
