/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import {
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { useFormContext, useWatch } from 'react-hook-form';
import type { FormValues } from '../types';
import { OpenInDiscoverLink } from './open_in_discover_link';

/**
 * Read-only ES|QL query for the page layout right column (Rule summary).
 */
export const RuleSummaryQueryPanel = () => {
  const { control } = useFormContext<FormValues>();
  const baseQuery = useWatch({ name: 'evaluation.query.base', control });

  return (
    <EuiPanel hasBorder hasShadow={false} paddingSize="m" data-test-subj="ruleSummaryQueryPanel">
      <EuiTitle size="s">
        <h2>
          {i18n.translate('xpack.alertingV2.ruleForm.ruleSummary.title', {
            defaultMessage: 'Rule Summary',
          })}
        </h2>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiFlexGroup
        alignItems="center"
        justifyContent="spaceBetween"
        responsive={false}
        gutterSize="m"
      >
        <EuiFlexItem grow={false}>
          <EuiText size="s">
            <p>
              <strong>
                {i18n.translate('xpack.alertingV2.ruleForm.ruleSummary.esqlHeading', {
                  defaultMessage: 'ES|QL query',
                })}
              </strong>
            </p>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <OpenInDiscoverLink esql={baseQuery ?? ''} />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      {baseQuery?.trim() ? (
        <EuiCodeBlock language="esql" fontSize="m" paddingSize="m" isCopyable overflowHeight={360}>
          {baseQuery}
        </EuiCodeBlock>
      ) : (
        <EuiText size="s" color="subdued" data-test-subj="ruleSummaryQueryEmpty">
          <p>
            {i18n.translate('xpack.alertingV2.ruleForm.ruleSummary.emptyQuery', {
              defaultMessage:
                'No query yet. Set your rule evaluation query in YAML or update defaults.',
            })}
          </p>
        </EuiText>
      )}
    </EuiPanel>
  );
};
