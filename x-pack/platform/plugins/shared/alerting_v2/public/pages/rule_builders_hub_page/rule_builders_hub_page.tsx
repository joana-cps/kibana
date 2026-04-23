/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiPageTemplate, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { useService, CoreStart } from '@kbn/core-di-browser';
import { RuleBuilderChoiceCards } from '../../components/rule_builders/rule_builder_choice_cards';
import { useBreadcrumbs } from '../../hooks/use_breadcrumbs';
import { paths } from '../../constants';

export const RuleBuildersHubPage = () => {
  const { basePath } = useService(CoreStart('http'));
  useBreadcrumbs('create');

  return (
    <EuiPageTemplate.Section
      paddingSize="l"
      grow
      restrictWidth
      data-test-subj="ruleBuildersHub"
    >
      <EuiTitle size="m">
        <h1>
          {i18n.translate('xpack.alertingV2.ruleBuildersHub.pageTitle', {
            defaultMessage: 'New Alerting Experience',
          })}
        </h1>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiText size="s" color="subdued" data-test-subj="ruleBuildersHubDescription">
        {i18n.translate('xpack.alertingV2.ruleBuildersHub.pageDescription', {
          defaultMessage:
            'Powerful ES|QL-driven rules and support for external alerts — consistent, high-quality alert data in a unified experience. Start from a rule builder below.',
        })}
      </EuiText>
      <EuiSpacer size="l" />
      <RuleBuilderChoiceCards
        thresholdHref={basePath.prepend(paths.ruleCreateForm)}
        sectionHeadingAlign="left"
      />
    </EuiPageTemplate.Section>
  );
};
