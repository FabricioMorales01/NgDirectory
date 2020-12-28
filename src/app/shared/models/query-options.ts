export interface QueryOptions {
  sortField?: string;
  sortAsc?: boolean | null;
  pagSize?: number;
  pagNumber?: number;
  filters?: any;
  query?: string;
}
