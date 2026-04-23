/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { css } from '@emotion/react';
import {
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';

export interface RuleBuilderChoiceCardsProps {
  /** App path for the threshold alert builder (rule create form) */
  thresholdHref: string;
  /** Alignment for “Start from a rule builder”. Rules list empty state uses center; hub uses left. */
  sectionHeadingAlign?: 'left' | 'center';
}

/**
 * "Start from a rule builder" — Threshold Alert and Service Latency (coming soon) cards
 * used on the rules list empty state and the create-rule hub.
 */
export const RuleBuilderChoiceCards = ({
  thresholdHref,
  sectionHeadingAlign = 'center',
}: RuleBuilderChoiceCardsProps) => {
  return (
    <>
      <div
        css={css`
          text-align: ${sectionHeadingAlign};
          width: 100%;
        `}
      >
        <EuiTitle size="xxs">
          <h3>
            {i18n.translate('xpack.alertingV2.rulesList.empty.buildersSectionTitle', {
              defaultMessage: 'Start from a rule builder',
            })}
          </h3>
        </EuiTitle>
      </div>
      <EuiSpacer size="m" />
      <EuiFlexGroup alignItems="stretch" gutterSize="m" responsive>
        <EuiFlexItem>
          <EuiCard
            data-test-subj="ruleBuilderChoiceThreshold"
            layout="horizontal"
            hasBorder
            paddingSize="l"
            icon={<EuiIcon type="visBarVertical" size="m" color="text" />}
            title={i18n.translate('xpack.alertingV2.rulesList.empty.thresholdAlertTitle', {
              defaultMessage: 'Threshold Alert',
            })}
            titleElement="h3"
            titleSize="xs"
            description={i18n.translate(
              'xpack.alertingV2.rulesList.empty.thresholdAlertDescription',
              {
                defaultMessage:
                  'Monitor one or more metrics and alert when they cross a threshold. Multi-condition support with custom aggregations.',
              }
            )}
            href={thresholdHref}
          >
            <EuiText size="xs" color="subdued">
              {i18n.translate('xpack.alertingV2.rulesList.empty.thresholdReplaces', {
                defaultMessage: 'Replaces: Custom threshold, Metric threshold',
              })}
            </EuiText>
          </EuiCard>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiCard
            data-test-subj="ruleBuilderChoiceServiceLatency"
            layout="horizontal"
            hasBorder
            paddingSize="l"
            icon={<EuiIcon type="clock" size="m" color="subdued" />}
            title={i18n.translate('xpack.alertingV2.rulesList.empty.serviceLatencyTitle', {
              defaultMessage: 'Service Latency',
            })}
            titleElement="h3"
            titleSize="xs"
            description={i18n.translate(
              'xpack.alertingV2.rulesList.empty.serviceLatencyDescription',
              {
                defaultMessage:
                  "Alert when a service's response time exceeds a threshold. Pick service, transaction type, percentile, and environment.",
              }
            )}
            isDisabled
            betaBadgeProps={{
              label: i18n.translate('xpack.alertingV2.rulesList.empty.comingSoonBadge', {
                defaultMessage: 'COMING SOON',
              }),
              color: 'hollow',
            }}
          >
            <EuiText size="xs" color="subdued">
              {i18n.translate('xpack.alertingV2.rulesList.empty.serviceLatencyReplaces', {
                defaultMessage: 'Replaces: APM latency rule',
              })}
            </EuiText>
          </EuiCard>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
