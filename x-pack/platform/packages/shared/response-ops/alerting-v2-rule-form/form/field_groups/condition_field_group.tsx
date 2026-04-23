/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { i18n } from '@kbn/i18n';
import { EuiSpacer, EuiFormRow, EuiCodeBlock } from '@elastic/eui';
import { useFormContext, useWatch } from 'react-hook-form';
import type { FormValues } from '../types';
import { useRuleFormMeta } from '../contexts';
import { FieldGroup } from './field_group';
import { PageRuleEvaluationFieldGroup } from './page_rule_evaluation_field_group';
import { EvaluationQueryField } from '../fields/evaluation_query_field';
import { GroupFieldSelect } from '../fields/group_field_select';
import { TimeFieldSelect } from '../fields/time_field_select';

interface ConditionFieldGroupProps {
  /**
   * Whether to include the editable base query field.
   * When true, shows an editable ES|QL editor for the base query.
   * When false, shows the base query as read-only (if available).
   */
  includeBase?: boolean;
  /** When true, read-only block uses the "ES|QL query" label (quick edit / builder). */
  readOnlyQueryLabelEsql?: boolean;
}

/**
 * Condition field group for configuring alert trigger conditions.
 *
 * On the **page** layout (and not `quickEdit`), this renders the split-panel
 * “Threshold Alert” evaluation block from RnA Figma; the ES|QL query is
 * read-only in the right column (rule summary). Flyouts and quick edit keep
 * the previous “Rule evaluation” field group.
 *
 * Otherwise: an ES|QL query editor (when includeBase is true) or a read-only
 * base query, plus group and time fields.
 */
export const ConditionFieldGroup = ({
  includeBase = false,
  readOnlyQueryLabelEsql = false,
}: ConditionFieldGroupProps) => {
  const { control } = useFormContext<FormValues>();
  const { layout, formVariant = 'default' } = useRuleFormMeta();
  const usePageEvaluationLayout = layout === 'page' && formVariant !== 'quickEdit';

  // Read the base query from form state (initialized via useFormDefaults)
  const baseQuery = useWatch({ control, name: 'evaluation.query.base' });

  if (usePageEvaluationLayout) {
    return <PageRuleEvaluationFieldGroup />;
  }

  return (
    <FieldGroup
      title={i18n.translate('xpack.alertingV2.ruleForm.condition', {
        defaultMessage: 'Rule evaluation',
      })}
    >
      {includeBase ? (
        // Editable base query
        <>
          <EvaluationQueryField />
          <EuiSpacer size="m" />
        </>
      ) : (
        // Read-only base query (only show if there's a query to display)
        baseQuery && (
          <>
            <EuiFormRow
              label={
                readOnlyQueryLabelEsql
                  ? i18n.translate('xpack.alertingV2.ruleForm.esqlQueryLabel', {
                      defaultMessage: 'ES|QL query',
                    })
                  : i18n.translate('xpack.alertingV2.ruleForm.baseQueryLabel', {
                      defaultMessage: 'Base query',
                    })
              }
              fullWidth
            >
              <EuiCodeBlock language="esql" fontSize="m" paddingSize="m" isCopyable>
                {baseQuery}
              </EuiCodeBlock>
            </EuiFormRow>
            <EuiSpacer size="m" />
          </>
        )
      )}

      <GroupFieldSelect />
      <TimeFieldSelect />
    </FieldGroup>
  );
};
