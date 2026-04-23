/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import {
  EuiButtonEmpty,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiHorizontalRule,
  EuiPanel,
  EuiSelect,
  EuiSpacer,
  EuiSplitPanel,
  EuiText,
  EuiTitle,
  useGeneratedHtmlId,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { Controller, useFormContext } from 'react-hook-form';
import { validateEsqlQuery } from '@kbn/alerting-v2-schemas';
import type { FormValues } from '../types';
import { DataSourceField } from '../fields/data_source_field';
import { GroupFieldSelect } from '../fields/group_field_select';
import { TimeFieldSelect } from '../fields/time_field_select';

const TIME_FIELD_HELP = i18n.translate('xpack.alertingV2.ruleForm.pageEvaluation.timeFieldHelp', {
  defaultMessage: 'Select the timestamp field to use for time-based queries',
});

const StatsPlaceholder = () => {
  const labelId = useGeneratedHtmlId({ prefix: 'statsLabel' });
  const aggId = useGeneratedHtmlId({ prefix: 'statsAgg' });
  const fieldId = useGeneratedHtmlId({ prefix: 'statsField' });

  return (
    <div>
      <EuiTitle size="xxs">
        <h4>
          {i18n.translate('xpack.alertingV2.ruleForm.pageEvaluation.statsSectionTitle', {
            defaultMessage: 'STATS',
          })}
        </h4>
      </EuiTitle>
      <EuiSpacer size="xs" />
      <EuiPanel paddingSize="s" hasBorder grow={false}>
        <EuiFlexGroup gutterSize="s" responsive={false} wrap>
          <EuiFlexItem grow={true} style={{ minWidth: '120px' }}>
            <EuiFormRow
              id={labelId}
              label={i18n.translate('xpack.alertingV2.ruleForm.pageEvaluation.statsLabelField', {
                defaultMessage: 'label',
              })}
            >
              <EuiFieldText
                id={labelId}
                name={labelId}
                placeholder="avg_cpu"
                fullWidth
                compressed
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={true} style={{ minWidth: '100px' }}>
            <EuiFormRow
              id={aggId}
              label={i18n.translate(
                'xpack.alertingV2.ruleForm.pageEvaluation.statsAggregationField',
                {
                  defaultMessage: 'aggregation',
                }
              )}
            >
              <EuiSelect
                id={aggId}
                name={aggId}
                options={[
                  {
                    value: 'avg',
                    text: i18n.translate(
                      'xpack.alertingV2.ruleForm.pageEvaluation.aggregationAverage',
                      {
                        defaultMessage: 'Average',
                      }
                    ),
                  },
                  {
                    value: 'max',
                    text: i18n.translate(
                      'xpack.alertingV2.ruleForm.pageEvaluation.aggregationMax',
                      {
                        defaultMessage: 'Max',
                      }
                    ),
                  },
                ]}
                fullWidth
                compressed
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={true} style={{ minWidth: '180px' }}>
            <EuiFormRow
              id={fieldId}
              label={i18n.translate('xpack.alertingV2.ruleForm.pageEvaluation.statsValueField', {
                defaultMessage: 'field',
              })}
            >
              <EuiSelect
                id={fieldId}
                name={fieldId}
                options={[
                  {
                    value: 'system.cpu',
                    text: 'system.cpu.total.norm.pct',
                  },
                  {
                    value: 'system.memory',
                    text: 'system.memory.used.pct',
                  },
                ]}
                fullWidth
                compressed
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
      <EuiSpacer size="s" />
      <EuiButtonEmpty
        type="button"
        size="xs"
        iconType="plusInCircle"
        flush="both"
        data-test-subj="ruleV2PageRuleEvaluationAddStats"
        onClick={() => {
          // STATS rows will be bound to form state in a follow-up
        }}
      >
        {i18n.translate('xpack.alertingV2.ruleForm.pageEvaluation.addAnotherStats', {
          defaultMessage: 'Add another stats',
        })}
      </EuiButtonEmpty>
    </div>
  );
};

const TriggerPlaceholder = () => {
  const labelId = useGeneratedHtmlId({ prefix: 'trigLabel' });
  const opId = useGeneratedHtmlId({ prefix: 'trigOp' });
  const valueId = useGeneratedHtmlId({ prefix: 'trigValue' });

  return (
    <div>
      <EuiTitle size="xxs">
        <h4>
          {i18n.translate('xpack.alertingV2.ruleForm.pageEvaluation.triggerSectionTitle', {
            defaultMessage: 'Trigger condition',
          })}
        </h4>
      </EuiTitle>
      <EuiSpacer size="xs" />
      <EuiPanel paddingSize="s" hasBorder grow={false}>
        <EuiFlexGroup gutterSize="s" responsive={false} wrap>
          <EuiFlexItem grow={true} style={{ minWidth: '120px' }}>
            <EuiFormRow
              id={labelId}
              label={i18n.translate('xpack.alertingV2.ruleForm.pageEvaluation.triggerLabelField', {
                defaultMessage: 'label',
              })}
            >
              <EuiSelect
                id={labelId}
                name={labelId}
                options={[
                  {
                    value: 'avg_cpu',
                    text: 'avg_cpu',
                  },
                  {
                    value: 'max_mem',
                    text: 'max_mem',
                  },
                ]}
                fullWidth
                compressed
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={true} style={{ minWidth: '100px' }}>
            <EuiFormRow
              id={opId}
              label={i18n.translate(
                'xpack.alertingV2.ruleForm.pageEvaluation.triggerOperatorField',
                {
                  defaultMessage: 'operator',
                }
              )}
            >
              <EuiSelect
                id={opId}
                name={opId}
                options={[
                  {
                    value: 'gt',
                    text: i18n.translate(
                      'xpack.alertingV2.ruleForm.pageEvaluation.triggerOperatorAbove',
                      {
                        defaultMessage: 'is above',
                      }
                    ),
                  },
                  {
                    value: 'lt',
                    text: i18n.translate(
                      'xpack.alertingV2.ruleForm.pageEvaluation.triggerOperatorBelow',
                      {
                        defaultMessage: 'is below',
                      }
                    ),
                  },
                ]}
                fullWidth
                compressed
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={true} style={{ minWidth: '120px' }}>
            <EuiFormRow
              id={valueId}
              label={i18n.translate('xpack.alertingV2.ruleForm.pageEvaluation.triggerValueField', {
                defaultMessage: 'value',
              })}
            >
              <EuiFieldText
                id={valueId}
                name={valueId}
                placeholder={i18n.translate(
                  'xpack.alertingV2.ruleForm.pageEvaluation.triggerValuePlaceholder',
                  {
                    defaultMessage: 'Type text',
                  }
                )}
                fullWidth
                compressed
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
      <EuiSpacer size="s" />
      <EuiButtonEmpty
        type="button"
        size="xs"
        iconType="plusInCircle"
        flush="both"
        data-test-subj="ruleV2PageRuleEvaluationAddCondition"
        onClick={() => {
          // Trigger rows will be bound to form state in a follow-up
        }}
      >
        {i18n.translate('xpack.alertingV2.ruleForm.pageEvaluation.addAnotherCondition', {
          defaultMessage: 'Add another condition',
        })}
      </EuiButtonEmpty>
    </div>
  );
};

/**
 * Full-page "Rule evaluation" block (EuiSplitPanel) aligned with RnA Rule Authoring Figma.
 * The ES|QL query is shown read-only in the right column; this block keeps the builder fields only.
 *
 * Figma: https://www.figma.com/design/tY4wbu3wXh4XK9p4MmYRLQ/RnA---Rule-Authoring-experience?node-id=1441-15488
 */
export const PageRuleEvaluationFieldGroup = () => {
  const { control } = useFormContext<FormValues>();
  const evaluationTitle = i18n.translate('xpack.alertingV2.ruleForm.pageEvaluation.typeThreshold', {
    defaultMessage: 'Threshold Alert',
  });

  return (
    <>
      <EuiSplitPanel.Outer
        hasBorder
        hasShadow={false}
        data-test-subj="pageRuleEvaluationFieldGroup"
      >
        <EuiSplitPanel.Inner color="subdued" paddingSize="s">
          <EuiText size="s" data-test-subj="pageRuleEvaluationTitle">
            <p>
              <strong>{evaluationTitle}</strong>
            </p>
          </EuiText>
        </EuiSplitPanel.Inner>
        <EuiSplitPanel.Inner paddingSize="m" color="plain">
          <EuiFlexGroup direction="column" gutterSize="m" alignItems="stretch" responsive={false}>
            <EuiFlexItem grow={false}>
              <DataSourceField />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <GroupFieldSelect />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <TimeFieldSelect helpText={TIME_FIELD_HELP} />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiHorizontalRule margin="xs" />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <StatsPlaceholder />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiHorizontalRule margin="xs" />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <TriggerPlaceholder />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiSplitPanel.Inner>
      </EuiSplitPanel.Outer>
      <Controller
        name="evaluation.query.base"
        control={control}
        rules={{
          required: i18n.translate('xpack.alertingV2.ruleForm.queryRequiredError', {
            defaultMessage: 'ES|QL query is required.',
          }),
          validate: (value) => validateEsqlQuery(value) ?? true,
        }}
        render={() => null}
      />
    </>
  );
};
