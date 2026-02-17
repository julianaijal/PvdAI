export interface TocItem {
  id: string;
  title: string;
  level: number;
  children: TocItem[];
}

export interface Section {
  id: string;
  title: string;
  level: number;
  content: string;
  children: Section[];
}
