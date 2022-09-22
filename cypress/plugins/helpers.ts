/* eslint-disable @typescript-eslint/no-explicit-any */

import { S3 } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

export const buildZipFromDirectory = (rootPath: string, zip: any, zipRoot?: string) => {
  const list = fs.readdirSync(rootPath);

  list.forEach((file) => {
    const filePathInDirectory = path.join(rootPath, file);
    const stat = fs.statSync(filePathInDirectory);
    const filePathInZip = zipRoot
      ? path.join(zipRoot, file)
      : file;

    if (stat && stat.isDirectory()) {
      zip.folder(filePathInZip);
      buildZipFromDirectory(filePathInDirectory, zip, filePathInZip);
    } else {
      const fileData = fs.readFileSync(filePathInDirectory);
      zip.file(filePathInZip, fileData);
    }
  });
};

export function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

export async function downloadData(subPrefix: string, targetDirectory: string, config: any) {
  const bucket = config.env.fixtureBucket;
  const prefix = config.env.fixturePrefix + subPrefix;
  const region = config.env.fixtureRegion;

  const filesDownloadDirectory = `${targetDirectory}/${subPrefix}`;

  if (!fs.existsSync(filesDownloadDirectory)) {
    fs.mkdirSync(filesDownloadDirectory);
  }

  const s3Client = new S3({ region });

  const objects = await s3Client
    .listObjects({
      Bucket: bucket,
      Prefix: prefix,
    });
  const promises = objects.Contents.filter((x) => x.Size > 0).map(
    (obj) => s3Client.getObject({ Bucket: bucket, Key: obj.Key })
      .then((file) => streamToString(file.Body as Readable))
      .then((convertedFile) => {
        const filePathSplit = obj.Key.split('/');
        const fileName = filePathSplit[filePathSplit.length - 1];
        const file = fs.createWriteStream(`./${filesDownloadDirectory}/${fileName}`);
        file.write(convertedFile);
        return fileName;
      }),
  );

  return Promise.all(promises);
}
