import { ReactElement, ReactNode } from 'react';

// The {} type is banned by eslint since it actually means "any non-nullish value".
// see https://github.com/typescript-eslint/typescript-eslint/issues/2063#issuecomment-675156492
// We create our own EmptyObject type instead.
export type EmptyObject = Record<string, never>;

export type AnyObject = Record<string, unknown>;

export interface Component<P = EmptyObject> {
  (props: P): ReactElement | null;
}

export type ChildrenProps = { children?: ReactNode };

export type ClassNameProps = { className?: string };
