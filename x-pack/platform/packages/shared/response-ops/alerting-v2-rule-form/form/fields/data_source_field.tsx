/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EuiFormRow, EuiSelect } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { useFormContext, useWatch } from 'react-hook-form';
import type { DataViewListItem } from '@kbn/data-views-plugin/common';
import type { FormValues } from '../types';
import { useRuleFormMeta, useRuleFormServices } from '../contexts';

const FROM_PATTERN = /^\s*FROM\s+([^\n|]+)/i;

/**
 * Replaces the first `FROM` clause in an ES|QL string, or prepends a minimal query.
 */
export const replaceDataSourceInEsqlQuery = (query: string, dataSource: string): string => {
  const source = dataSource.trim();
  if (!source) {
    return query;
  }
  if (/^\s*FROM\s+/i.test(query)) {
    return query.replace(/^\s*FROM\s+[^\n|]+/im, `FROM ${source}`);
  }
  if (!query?.trim()) {
    return `FROM ${source}\n| LIMIT 1`;
  }
  return `FROM ${source}\n${query}`;
};

const parseFromClause = (baseQuery: string | undefined): string => {
  if (!baseQuery) {
    return '';
  }
  return FROM_PATTERN.exec(baseQuery)?.[1]?.trim() ?? '';
};

/**
 * Data source for page rule evaluation: `FROM` value backed by data views, updates `evaluation.query.base`.
 */
export const DataSourceField = () => {
  const { dataViews } = useRuleFormServices();
  const { layout } = useRuleFormMeta();
  const { control, setValue } = useFormContext<FormValues>();
  const baseQuery = useWatch({ name: 'evaluation.query.base', control });
  const dataSourceRowId = 'ruleV2FormDataSourceField';
  const [dataViewList, setDataViewList] = useState<DataViewListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    dataViews
      .getIdsWithTitle()
      .then((list) => {
        if (!cancel) {
          setDataViewList(list);
        }
      })
      .finally(() => {
        if (!cancel) {
          setIsLoading(false);
        }
      });
    return () => {
      cancel = true;
    };
  }, [dataViews]);

  const fromClause = useMemo(() => parseFromClause(baseQuery), [baseQuery]);

  const selectOptions = useMemo(() => {
    const placeholder = {
      value: '',
      text: i18n.translate('xpack.alertingV2.ruleForm.pageEvaluation.dataSourcePlaceholder', {
        defaultMessage: 'Select a data source',
      }),
      disabled: true,
    };
    const fromDataViews = dataViewList.map((item) => ({
      value: item.title,
      text: item.name?.trim() ? `${item.name} (${item.title})` : item.title,
    }));
    if (fromClause && !fromDataViews.some((o) => o.value === fromClause)) {
      return [placeholder, { value: fromClause, text: fromClause }, ...fromDataViews];
    }
    return [placeholder, ...fromDataViews];
  }, [dataViewList, fromClause]);

  const onDataSourceChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const next = event.target.value;
      setValue('evaluation.query.base', replaceDataSourceInEsqlQuery(baseQuery ?? '', next), {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [baseQuery, setValue]
  );

  return (
    <EuiFormRow
      id={dataSourceRowId}
      label={i18n.translate('xpack.alertingV2.ruleForm.pageEvaluation.dataSourceLabel', {
        defaultMessage: 'Data source',
      })}
      fullWidth
    >
      <EuiSelect
        id={dataSourceRowId}
        data-test-subj="ruleV2FormDataSourceSelect"
        options={selectOptions}
        value={fromClause}
        onChange={onDataSourceChange}
        isLoading={isLoading}
        fullWidth
        compressed={layout === 'flyout'}
        aria-label={i18n.translate('xpack.alertingV2.ruleForm.pageEvaluation.dataSourceAriaLabel', {
          defaultMessage: 'Select data source for the rule query',
        })}
      />
    </EuiFormRow>
  );
};
