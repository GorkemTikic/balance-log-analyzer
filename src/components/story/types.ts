import { LocalLang } from "@/lib/i18n";
import { Row } from "@/lib/story";

export type StoryInputState = {
  start: string;
  end: string;
  baselineText: string;
  trAmount: string;
  trAsset: string;
};

export type StoryInputSetters = {
  setStart: (v: string) => void;
  setEnd: (v: string) => void;
  setBaselineText: (v: string) => void;
  setTrAmount: (v: string) => void;
  setTrAsset: (v: string) => void;
};

export type StoryTabProps = {
  rows: Row[];
  lang: LocalLang;
  inputs: StoryInputState;
  setters: StoryInputSetters;
};
