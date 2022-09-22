import { hexToRGB } from './hexToRGB';

describe('hexToRGB', () => {
  it('should parse 2 digit hex values', () => {
    expect(hexToRGB('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRGB('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
    expect(hexToRGB('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRGB('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('should parse 1 digit hex values', () => {
    expect(hexToRGB('#FF0')).toEqual({ r: 255, g: 255, b: 0 });
    expect(hexToRGB('#0FF')).toEqual({ r: 0, g: 255, b: 255 });
    expect(hexToRGB('#ff0')).toEqual({ r: 255, g: 255, b: 0 });
    expect(hexToRGB('#0ff')).toEqual({ r: 0, g: 255, b: 255 });
  });

  it('should return NaN for unparsable values', () => {
    expect(hexToRGB('#gg0000')).toEqual({ r: Number.NaN, g: 0, b: 0 });
    expect(hexToRGB('ff0000')).toEqual({ r: Number.NaN, g: Number.NaN, b: Number.NaN });
    expect(hexToRGB('#ff00')).toEqual({ r: Number.NaN, g: Number.NaN, b: Number.NaN });
    expect(hexToRGB('#ff00000')).toEqual({ r: Number.NaN, g: Number.NaN, b: Number.NaN });
    expect(hexToRGB('$ff0000')).toEqual({ r: Number.NaN, g: Number.NaN, b: Number.NaN });
  });
});
