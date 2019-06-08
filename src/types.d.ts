declare module 'line-column' {
  export interface Url {
    fromIndex: (index: number) => {line: number; col: number;};
  }

  export default function parse(source: string, opts?: {origin: number}): Url;
}
