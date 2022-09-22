/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import dotenv from 'dotenv';

export const fetchEnvironmentalVariables = (
  path: string,
): any => {
  dotenv.config({ path });

  const prefix = 'CYPRESS_';
  const keys = Object.keys(process.env).filter((key) => key.startsWith(prefix));
  const config = {};

  keys.forEach((key) => {
    const envVariable: string = key.slice(prefix.length);
    config[envVariable] = process.env[key];
  });

  return config;
};
