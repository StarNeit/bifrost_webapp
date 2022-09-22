export {};

declare global {
  interface Window {
    Cypress: unknown,
    store: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xrtestDataStore: { [key: string]: any },
  }
}
