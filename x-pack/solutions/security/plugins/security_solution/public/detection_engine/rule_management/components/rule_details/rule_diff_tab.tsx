/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useMemo } from 'react';
import { omit, pick } from 'lodash';
import stringify from 'json-stable-stringify';
import {
  EuiSpacer,
  EuiPanel,
  EuiHorizontalRule,
  EuiFlexGroup,
  EuiTitle,
  EuiIconTip,
} from '@elastic/eui';
import type { Filter } from '@kbn/es-query';
import { normalizeMachineLearningJobIds } from '../../../../../common/detection_engine/utils';
import { filterEmptyThreats } from '../../../rule_creation_ui/pages/rule_creation/helpers';
import type { RuleResponse } from '../../../../../common/api/detection_engine/model/rule_schema/rule_schemas.gen';
import { DiffView } from './json_diff/diff_view';

/* Inclding these properties in diff display might be confusing to users. */
const HIDDEN_PROPERTIES: Array<keyof RuleResponse> = [
  /*
    By default, prebuilt rules don't have any actions or exception lists. So if a user has defined actions or exception lists for a rule, it'll show up as diff. This looks confusing as the user might think that their actions and exceptions lists will get removed after the upgrade, which is not the case - they will be preserved.
  */
  'actions',
  'exceptions_list',

  /*
    Most prebuilt rules are installed as "disabled". Once user enables a rule, it'll show as diff, which doesn't add value.
  */
  'enabled',

  /* Technical property. Hidden because it can be confused with "version" by users. */
  'revision',

  /*
    "updated_at" value is regenerated on every '/upgrade/_review' endpoint run
    and will therefore always show a diff. It adds no value to display it to the user.
  */
  'updated_at',

  /*
    These values make sense only for installed prebuilt rules.
    They are not present in the prebuilt rule package.
    So, showing them in the diff doesn't add value.
  */
  'updated_by',
  'created_at',
  'created_by',
  /*
   * Another technical property that is used for logic under the hood the user doesn't need to be aware of
   */
  'rule_source',
  /* Technical property that changes at rule runtime. */
  'execution_summary',
];

const sortAndStringifyJson = (jsObject: Record<string, unknown>): string =>
  stringify(jsObject, { space: 2 });

/**
 * Normalizes the rule object, making it suitable for comparison with another normalized rule.
 *
 * Normalization is needed to avoid showing diffs for semantically equal property values.
 * Saving a rule via the rule editing UI might change the format of some properties or set default values.
 * This function compensates for those changes.
 *
 * @param {RuleResponse} originalRule - Rule of a RuleResponse type.
 * @returns {RuleResponse} - The updated normalized rule object.
 */
const normalizeRule = (originalRule: RuleResponse): RuleResponse => {
  const rule = { ...originalRule };

  /*
    Default "note" to an empty string if it's not present.
    Sometimes, in a new version of a rule, the "note" value equals an empty string, while
    in the old version, it wasn't specified at all (undefined becomes ''). In this case,
    it doesn't make sense to show diff, so we default falsy values to ''.
  */
  rule.note = rule.note ?? '';

  /*
    Removes empty arrays (techniques, subtechniques) from the MITRE ATT&CK value.
    The same processing is done in the rule editing UI before submitting the edits.
  */
  rule.threat = filterEmptyThreats(rule.threat);

  /*
    The "machine_learning_job_id" property is converted from the legacy string format
    to the new array format during installation and upgrade. Thus, all installed rules
    use the new format. For correct comparison, we must ensure that the rule update is
    also in the new format before showing the diff.
  */
  if ('machine_learning_job_id' in rule) {
    rule.machine_learning_job_id = normalizeMachineLearningJobIds(rule.machine_learning_job_id);
  }

  /*
    Default the "alias" property to null for all threat filters that don't have it.
    Setting a default is needed to match the behavior of the rule editing UI,
    which also defaults the "alias" property to null.
  */
  if (rule.type === 'threat_match' && Array.isArray(rule.threat_filters)) {
    const threatFiltersWithDefaultMeta = (rule.threat_filters as Filter[]).map((filter) => {
      if (!filter.meta.alias) {
        return { ...filter, meta: { ...filter.meta, alias: null } };
      }
      return filter;
    });

    rule.threat_filters = threatFiltersWithDefaultMeta;
  }

  return rule;
};

interface RuleDiffTabProps {
  oldRule: RuleResponse;
  newRule: RuleResponse;
  leftDiffSideLabel: string;
  rightDiffSideLabel: string;
  leftDiffSideDescription: string;
  rightDiffSideDescription: string;
}

export const RuleDiffTab = ({
  oldRule,
  newRule,
  leftDiffSideLabel,
  rightDiffSideLabel,
  leftDiffSideDescription,
  rightDiffSideDescription,
}: RuleDiffTabProps) => {
  const [oldSource, newSource] = useMemo(() => {
    const visibleNewRuleProperties = omit(normalizeRule(newRule), ...HIDDEN_PROPERTIES);
    const visibleOldRuleProperties = omit(
      /* Only compare properties that are present in the update. */
      pick(normalizeRule(oldRule), Object.keys(visibleNewRuleProperties))
    );

    return [
      sortAndStringifyJson(visibleOldRuleProperties),
      sortAndStringifyJson(visibleNewRuleProperties),
    ];
  }, [oldRule, newRule]);

  return (
    <>
      <EuiSpacer size="m" />
      <EuiPanel color="transparent" hasBorder>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          <EuiFlexGroup alignItems="baseline" gutterSize="xs">
            <EuiIconTip
              color="subdued"
              content={leftDiffSideDescription}
              type="info"
              size="m"
              display="block"
            />
            <EuiTitle size="xxxs">
              <h6>{leftDiffSideLabel}</h6>
            </EuiTitle>
          </EuiFlexGroup>
          <EuiFlexGroup alignItems="baseline" gutterSize="xs">
            <EuiIconTip color="subdued" content={rightDiffSideDescription} type="info" size="m" />
            <EuiTitle size="xxxs">
              <h6>{rightDiffSideLabel}</h6>
            </EuiTitle>
          </EuiFlexGroup>
        </EuiFlexGroup>
        <EuiHorizontalRule margin="s" size="full" />
        <DiffView oldSource={oldSource} newSource={newSource} />
      </EuiPanel>
    </>
  );
};
