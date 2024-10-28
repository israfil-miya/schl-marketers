import {
  Query as notice_Query,
  RegexFields as notice_RegexFields,
  RegexQuery as notice_RegexQuery,
} from '@/app/api/notice/route';
import {
  BooleanFields as report_BooleanFields,
  Query as report_Query,
  RegexFields as report_RegexFields,
  RegexQuery as report_RegexQuery,
} from '@/app/api/report/route';

type RegexQuery = report_RegexQuery | notice_RegexQuery;
type Query = report_Query | notice_Query;
type RegexFields = report_RegexFields | notice_RegexFields;
type BooleanFields = report_BooleanFields;

// Helper function to create a regex query
export const createRegexQuery = (
  value?: string,
  exactMatch: boolean = false,
): RegexQuery | undefined =>
  value
    ? { $regex: exactMatch ? `^${value}$` : value, $options: 'i' }
    : undefined;

// Helper function to add boolean fields to the query
export const addBooleanField = (
  query: Query,
  key: BooleanFields,
  value?: boolean,
) => {
  if (value === true) {
    (query as any)[key] = value;
  }
};

// Helper function to add regex fields to the query
export const addRegexField = (
  query: Query,
  key: RegexFields,
  value?: string,
  exactMatch: boolean = false,
) => {
  const regexQuery = createRegexQuery(value, exactMatch);
  if (regexQuery) {
    (query as any)[key] = regexQuery;
  }
};

// Helper function to add fields if they are defined

export const addIfDefined = <T extends Query>(
  query: T,
  key: keyof T,
  value: any,
) => {
  if (
    value !== undefined &&
    value !== null &&
    value !== '' &&
    value !== false
  ) {
    query[key] = value;
  }
};
