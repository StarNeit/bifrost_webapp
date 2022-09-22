import { FMSDevice } from './fms';

// Adds leading zeros for devices of type: exact | metavue
// if the serial number length is bellow 6 characters
const validateFmsDeviceSerialNumber = (fmsDevice: FMSDevice) => {
  const isExactOrMetavueType = ['exact', 'metavue'].includes(fmsDevice.deviceType.toLowerCase());
  if (!isExactOrMetavueType || fmsDevice.serialNumber.length >= 6) return fmsDevice;

  const validSerialNumber = fmsDevice.serialNumber.padStart(6, '0');

  return {
    ...fmsDevice,
    serialNumber: validSerialNumber,
  };
};

export function validateFmsDevice(fmsDevice: FMSDevice) {
  const validatedFmsDevice = validateFmsDeviceSerialNumber(fmsDevice);

  return validatedFmsDevice;
}

export function validateFmsDevices(fmsDevices: FMSDevice[]) {
  const validatedFmsDevices = fmsDevices.map((fmsDevice) => validateFmsDevice(fmsDevice));

  return validatedFmsDevices;
}
