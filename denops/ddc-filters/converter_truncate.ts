import {
  BaseFilter,
  Candidate,
} from "https://deno.land/x/ddc_vim@v0.5.0/types.ts#^";

import { eastAsianWidth } from "https://esm.sh/eastasianwidth";

export function charwidth(c: string): number {
  const wc = eastAsianWidth(c) as string;
  return wc.match(/F|W/) ? 2 : 1;
}

export function strwidth(str: string): number {
  let width = 0;
  for (const c of str) {
    width += charwidth(c);
  }
  return width;
}

export function truncate(
  str: string,
  maxWidth: number,
  reverse = false,
): string {
  if (str.length < maxWidth / 2) return str;
  if (strwidth(str) <= maxWidth) return str;

  let width = 0;
  let ret = "";
  for (let i = 0; i < str.length; i++) {
    const c = reverse ? str[str.length - i - 1] : str[i];
    const wc = charwidth(c);
    if (width + wc > maxWidth) break;
    ret += c;
    width += wc;
  }
  return ret;
}

export function truncateSkipping(
  str: string | undefined,
  maxWidth: number,
  footer: string,
  footerLen: number,
): string {
  if (!str) return "";
  if (str.length < maxWidth / 2) return str;
  if (strwidth(str) <= maxWidth) return str;

  footer += str.slice(-truncate(str, footerLen, true).length);
  return truncate(str, maxWidth - strwidth(footer)) + footer;
}

type Params = {
  maxAbbrWidth: number;
  maxInfoWidth: number;
  maxKindWidth: number;
  maxMenuWidth: number;
  ellipsis: string;
};

export class Filter extends BaseFilter {
  filter(args: {
    filterParams: Record<string, unknown>;
    completeStr: string;
    candidates: Candidate[];
  }): Promise<Candidate[]> {
    const param = args.filterParams as Params;
    for (const candidate of args.candidates) {
      if (param.maxAbbrWidth > 0) {
        candidate.abbr = truncateSkipping(
          candidate.abbr ? candidate.abbr : candidate.word,
          param.maxAbbrWidth,
          param.ellipsis,
          param.maxAbbrWidth / 3,
        );
      }
      if (param.maxInfoWidth > 0) {
        candidate.info = truncateSkipping(
          candidate.info,
          param.maxInfoWidth,
          param.ellipsis,
          param.maxInfoWidth / 3,
        );
      }
      if (param.maxKindWidth > 0) {
        candidate.kind = truncateSkipping(
          candidate.kind,
          param.maxKindWidth,
          param.ellipsis,
          param.maxKindWidth / 3,
        );
      }
      if (param.maxMenuWidth > 0) {
        candidate.menu = truncateSkipping(
          candidate.menu,
          param.maxMenuWidth,
          param.ellipsis,
          param.maxMenuWidth / 3,
        );
      }
    }
    return Promise.resolve(args.candidates);
  }

  params(): Record<string, unknown> {
    const params: Params = {
      maxAbbrWidth: 80,
      maxInfoWidth: 200,
      maxKindWidth: 40,
      maxMenuWidth: 40,
      ellipsis: "..",
    };
    return params as unknown as Record<string, unknown>;
  }
}
