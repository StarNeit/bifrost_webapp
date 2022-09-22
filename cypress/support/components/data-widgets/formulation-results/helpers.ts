export const testColumns = ['name', 'score', 'deltae', 'numComponents', 'price'];
export const orderList = ['desc', 'asc'];

export const compare = (a: string, b: string) => {
  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
};

export const toString = (x: string | number) => (Number.isNaN(Number(x))
  ? String(x)
  : Number(x).toFixed(2));

export const toNumber = (x: string | number) => parseFloat(toString(x));

export const toPrecisePrice = (price: string) => {
  const parsedPrice = Cypress._.round(toNumber(price), 2).toFixed(2);
  const currency = price.charAt(price.length - 1);
  return `${parsedPrice} ${currency}`;
};
