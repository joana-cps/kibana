/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import {
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiIcon,
  EuiLink,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { css } from '@emotion/react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { useService, CoreStart } from '@kbn/core-di-browser';
import { paths } from '../../constants';
import { RuleBuilderChoiceCards } from '../../components/rule_builders/rule_builder_choice_cards';
import { useRuleListCreationActions } from './use_rule_list_creation_actions';

export const RulesListEmptyState = () => {
  const { basePath } = useService(CoreStart('http'));
  const docLinks = useService(CoreStart('docLinks'));
  const guideHref = docLinks.links.alerting.guide;
  const {
    canCreateInDiscover,
    canCreateWithAi,
    openCreateInDiscover,
    openCreateWithAiAgent,
  } = useRuleListCreationActions();

  const discoverCard = (
    <EuiCard
      data-test-subj="rulesListEmptyCreateInDiscover"
      layout="horizontal"
      hasBorder
      paddingSize="l"
      icon={<EuiIcon type="discoverApp" size="m" color="text" />}
      title={i18n.translate('xpack.alertingV2.rulesList.empty.createInDiscoverTitle', {
        defaultMessage: 'Create in discover',
      })}
      titleElement="h3"
      titleSize="xs"
      description={i18n.translate('xpack.alertingV2.rulesList.empty.createInDiscoverDescription', {
        defaultMessage: 'Create as an ES|QL query with live preview. YAML editor available.',
      })}
      onClick={canCreateInDiscover ? () => void openCreateInDiscover() : undefined}
      isDisabled={!canCreateInDiscover}
    />
  );

  const aiCard = (
    <EuiCard
      data-test-subj="rulesListEmptyCreateWithAi"
      layout="horizontal"
      hasBorder
      paddingSize="l"
      icon={<EuiIcon type="productAgent" size="m" color="text" aria-hidden={true} />}
      title={i18n.translate('xpack.alertingV2.rulesList.empty.createWithAiTitle', {
        defaultMessage: 'Create with AI Agent',
      })}
      titleElement="h3"
      titleSize="xs"
      description={i18n.translate('xpack.alertingV2.rulesList.empty.createWithAiDescription', {
        defaultMessage: 'Set up an Alerting rule with the help of the AI Agent.',
      })}
      onClick={canCreateWithAi ? openCreateWithAiAgent : undefined}
      isDisabled={!canCreateWithAi}
    />
  );

  return (
    <EuiPanel
      data-test-subj="rulesListEmptyState"
      grow={false}
      hasBorder
      paddingSize="xl"
      css={css`
        max-width: 900px;
        width: 100%;
        flex-shrink: 0;
        margin: 0;
      `}
    >
      <EuiFlexGroup direction="column" alignItems="center" gutterSize="s">
        <EuiTitle size="m" textAlign="center">
          <h2>
            {i18n.translate('xpack.alertingV2.rulesList.empty.welcomeTitle', {
              defaultMessage: 'Welcome to the new Alerting experience',
            })}
          </h2>
        </EuiTitle>
        <EuiText textAlign="center" size="s" color="subdued">
          {i18n.translate('xpack.alertingV2.rulesList.empty.welcomeDescription', {
            defaultMessage:
              'Powerful ES|QL-driven rules and support for external alerts, it delivers consistent, high-quality alert data into a unified experience.',
          })}
        </EuiText>
      </EuiFlexGroup>
      <EuiSpacer size="l" />
      <EuiFlexGroup alignItems="stretch" gutterSize="m">
        <EuiFlexItem>{discoverCard}</EuiFlexItem>
        <EuiFlexItem>{aiCard}</EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="l" />
      <EuiFlexGroup alignItems="center" gutterSize="m" responsive={false}>
        <EuiFlexItem>
          <EuiHorizontalRule margin="none" />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText size="s" color="subdued" textAlign="center">
            {i18n.translate('xpack.alertingV2.rulesList.empty.orSeparator', {
              defaultMessage: 'or',
            })}
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiHorizontalRule margin="none" />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="l" />
      <RuleBuilderChoiceCards
        thresholdHref={basePath.prepend(paths.ruleCreateForm)}
      />
      <EuiSpacer size="l" />
      <EuiPanel
        color="subdued"
        grow={false}
        borderRadius="m"
        paddingSize="m"
        hasShadow={false}
        css={css`
          text-align: center;
        `}
      >
        <EuiText size="s">
          <FormattedMessage
            id="xpack.alertingV2.rulesList.empty.docFooter"
            defaultMessage="Want to learn more? {docLink}"
            values={{
              docLink: (
                <EuiLink
                  data-test-subj="rulesListEmptyReadDocumentation"
                  href={guideHref}
                  target="_blank"
                  external
                >
                  {i18n.translate('xpack.alertingV2.rulesList.empty.readDocumentation', {
                    defaultMessage: 'Read documentation',
                  })}
                </EuiLink>
              ),
            }}
          />
        </EuiText>
      </EuiPanel>
    </EuiPanel>
  );
};
