import type { where, orderBy } from "firebase/firestore";

export type UpdateDocFunction<T> = (update: Partial<T>) => Promise<void>;

export type UpdateCollectionFunction<T> = (
  path: string,
  update: Partial<T>
) => Promise<void>;

/** Table settings stored in project settings */
export type TableSettings = {
  id: string;
  collection: string;
  name: string;
  roles: string[];

  description: string;
  section: string;

  tableType: "primaryCollection" | "collectionGroup";

  audit?: boolean;
  auditFieldCreatedBy?: string;
  auditFieldUpdatedBy?: string;
  readOnly?: boolean;
};

/** Table schema document loaded when table or table settings dialog is open */
export type TableSchema = {
  columns?: Record<string, ColumnConfig>;
  rowHeight?: number;
  filters?: TableFilter[];

  functionConfigPath?: string;

  extensionObjects?: any[];
  webhooks?: any[];
};

export type ColumnConfig = {
  fieldName: string;
  key: string;
  name: string;
  type: FieldType;
  index: number;
  width?: number;
  editable?: boolean;
  config: { [key: string]: any };
  [key: string]: any;
};

export type TableFilter = {
  key: Parameters<typeof where>[0];
  operator: Parameters<typeof where>[1];
  value: Parameters<typeof where>[2];
};

export type TableOrder = {
  key: Parameters<typeof orderBy>[0];
  direction: Parameters<typeof orderBy>[1];
};