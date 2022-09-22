import { Vector3D } from '@xrite/cloud-formulation-domain-model/utils/vector';
import * as colorimetry from './colorimetry';

const inPlaneDataSet1 = {
  LIGHT_DIR: [0.707106781186547, 0, -0.707106781186547] as Vector3D,
  VIEW_DIR: [-0.906307787036650, 0, 0.422618261740700] as Vector3D,
  RESULT: [45, 110, 0],
};

const inPlaneDataSet2 = {
  LIGHT_DIR: [0.707106781186547, 0, -0.707106781186547] as Vector3D,
  VIEW_DIR: [0.5, 0, 0.866025403784439] as Vector3D,
  RESULT: [45, 15, 0],
};

const inPlaneDataSet3 = {
  LIGHT_DIR: [0.707106781186547, 0, -0.707106781186547] as Vector3D,
  VIEW_DIR: [0.866025403784439, 0, 0.5] as Vector3D,
  RESULT: [45, -15, 0],
};

const outOfPlaneDataSet1 = {
  LIGHT_DIR: [0.707106781186547, 0, -0.707106781186547] as Vector3D,
  VIEW_DIR: [0.713151411403254, -0.410064693213191, 0.568561352708323] as Vector3D,
  RESULT: [45, 25, -76],
};

const outOfPlaneDataSet2 = {
  LIGHT_DIR: [0.707106781186547, 0, -0.707106781186547] as Vector3D,
  VIEW_DIR: [0.859789397188856, 0.066987298107781, 0.506236006595582] as Vector3D,
  RESULT: [45, 15, 15],
};

const outOfPlaneDataSet3 = {
  LIGHT_DIR: [0.258819045102521, 0, -0.965925826289068] as Vector3D,
  VIEW_DIR: [0.000255605307491, -0.706904885203488, 0.707308573354918] as Vector3D,
  RESULT: [15, 46.9, -104.5],
};

describe('colorimetry.getThetaAspecularCoordinates', () => {
  it('should return correct values in plane with large positive aspecular angle', () => {
    const { VIEW_DIR, LIGHT_DIR, RESULT } = inPlaneDataSet1;
    const result = colorimetry.getThetaAspecularCoordinates(LIGHT_DIR, VIEW_DIR);

    expect(result[0]).toBeCloseTo(RESULT[0]);
    expect(result[1]).toBeCloseTo(RESULT[1]);
    expect(result[2]).toBeCloseTo(RESULT[2]);
  });

  it('should return correct values in plane with small positive aspecular angle', () => {
    const { VIEW_DIR, LIGHT_DIR, RESULT } = inPlaneDataSet2;
    const result = colorimetry.getThetaAspecularCoordinates(LIGHT_DIR, VIEW_DIR);

    expect(result[0]).toBeCloseTo(RESULT[0]);
    expect(result[1]).toBeCloseTo(RESULT[1]);
    expect(result[2]).toBeCloseTo(RESULT[2]);
  });

  it('should return correct values in plane with negative aspecular angle', () => {
    const { VIEW_DIR, LIGHT_DIR, RESULT } = inPlaneDataSet3;
    const result = colorimetry.getThetaAspecularCoordinates(LIGHT_DIR, VIEW_DIR);

    expect(result[0]).toBeCloseTo(RESULT[0]);
    expect(result[1]).toBeCloseTo(RESULT[1]);
    expect(result[2]).toBeCloseTo(RESULT[2]);
  });

  it('should return correct values out of plane with positive aspecular angle', () => {
    const { VIEW_DIR, LIGHT_DIR, RESULT } = outOfPlaneDataSet1;
    const result = colorimetry.getThetaAspecularCoordinates(LIGHT_DIR, VIEW_DIR);

    expect(result[0]).toBeCloseTo(RESULT[0]);
    expect(result[1]).toBeCloseTo(RESULT[1]);
    expect(result[2]).toBeCloseTo(RESULT[2]);
  });

  it('should return correct values out of plane with negative aspecular angle', () => {
    const { VIEW_DIR, LIGHT_DIR, RESULT } = outOfPlaneDataSet2;
    const result = colorimetry.getThetaAspecularCoordinates(LIGHT_DIR, VIEW_DIR);

    expect(result[0]).toBeCloseTo(RESULT[0]);
    expect(result[1]).toBeCloseTo(RESULT[1]);
    expect(result[2]).toBeCloseTo(RESULT[2]);
  });

  // This test is currently failing on the c++ implementation.
  // Once it is fixed there it needs to be updated here as well.
  it('should return correct values out of plane', () => {
    const { VIEW_DIR, LIGHT_DIR, RESULT } = outOfPlaneDataSet3;
    const result = colorimetry.getThetaAspecularCoordinates(LIGHT_DIR, VIEW_DIR);

    expect(result[0]).toBeCloseTo(RESULT[0]);
    expect(result[1]).toBeCloseTo(RESULT[1]);
    expect(result[2]).toBeCloseTo(RESULT[2]);
  });

  const roundedNumberText = (value: number, maxDigits = 1): string => {
    const factor = 10 ** maxDigits;
    const roundedValue = Math.round(factor * value) / factor;
    return roundedValue.toString();
  };

  const toText = (values: number[]): string => {
    if (Math.abs(values[2]) < 1E-7) {
      return `${roundedNumberText(values[0])}as${roundedNumberText(values[1])}`;
    }
    return `${roundedNumberText(values[0])}as${roundedNumberText(values[1])}az${roundedNumberText(values[2])}`;
  };

  it('from carthesian (as, az)', () => {
    const illumination45 = [0.707106781, 0, -0.707106781] as Vector3D;
    const illumination15 = [0.258819045, 0, -0.965925826] as Vector3D;

    const detectionA = [0.640856, 0.422618, 0.640856] as Vector3D;
    const detectionMinusA = [0.640856, -0.422618, 0.640856] as Vector3D;
    const detectionB = [0, 0.707, 0.707] as Vector3D;
    const detectionMinusB = [0, -0.707, 0.707] as Vector3D;

    expect(toText(colorimetry.getThetaAspecularCoordinates(illumination45, detectionA))).toBe('45as25az90');
    expect(toText(colorimetry.getThetaAspecularCoordinates(illumination45, detectionMinusA))).toBe('45as25az-90');
    expect(toText(colorimetry.getThetaAspecularCoordinates(illumination45, detectionB))).toBe('45as60az125.3');
    expect(toText(colorimetry.getThetaAspecularCoordinates(illumination45, detectionMinusB))).toBe('45as60az-125.3');

    expect(toText(colorimetry.getThetaAspecularCoordinates(illumination15, detectionA))).toBe('15as38.3az43');
    expect(toText(colorimetry.getThetaAspecularCoordinates(illumination15, detectionMinusA))).toBe('15as38.3az-43');
    expect(toText(colorimetry.getThetaAspecularCoordinates(illumination15, detectionB))).toBe('15as46.9az104.5');
    expect(toText(colorimetry.getThetaAspecularCoordinates(illumination15, detectionMinusB))).toBe('15as46.9az-104.5');
  });
});
