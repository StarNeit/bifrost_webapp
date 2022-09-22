import { Standard } from '@xrite/cloud-formulation-domain-model';

export type StandardWithPreview = Standard & {
  preview: {
    simulation: {
        rgb: {
            r: number;
            g: number;
            b: number;
        };
    }[];
    isMultiAngle: boolean;
  },
};
