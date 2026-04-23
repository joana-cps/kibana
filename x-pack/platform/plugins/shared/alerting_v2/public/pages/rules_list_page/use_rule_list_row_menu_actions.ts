/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useCallback } from 'react';
import { useService, CoreStart } from '@kbn/core-di-browser';
import { DISCOVER_APP_LOCATOR } from '@kbn/deeplinks-analytics';
import type { DiscoverAppLocatorParams } from '@kbn/discover-plugin/common';
import { useAlertingV2KibanaServices } from '../../kibana_services';
import { paths } from '../../constants';
import type { RuleApiResponse } from '../../services/rules_api';
import { useRuleListCreationActions } from './use_rule_list_creation_actions';

/**
 * Handlers and flags for the rules list / summary overflow menu (Edit in Discover vs Builder, AI, etc.).
 */
export function useRuleListRowMenuActions() {
  const kibana = useAlertingV2KibanaServices();
  const application = useService(CoreStart('application'));
  const http = useService(CoreStart('http'));
  const { canCreateInDiscover, canCreateWithAi, openCreateWithAiAgent } = useRuleListCreationActions();

  const onEditInDiscover = useCallback(
    async (rule: RuleApiResponse) => {
      if (!kibana?.share) {
        return;
      }
      const locator = kibana.share.url.locators.get<DiscoverAppLocatorParams>(DISCOVER_APP_LOCATOR);
      if (!locator) {
        return;
      }
      const esql = rule.evaluation.query.base;
      const { app, path, state } = await locator.getLocation({
        query: { esql },
        openCreateEsqlRuleV2Flyout: true,
        esqlRuleV2EditRuleId: rule.id,
      });
      await application.navigateToApp(app, { path, state });
    },
    [application, kibana?.share]
  );

  const onEditInBuilder = useCallback(
    (rule: RuleApiResponse) => {
      application.navigateToUrl(http.basePath.prepend(paths.ruleEdit(rule.id)));
    },
    [application, http]
  );

  const onEditWithAiAgent = useCallback(
    (_rule: RuleApiResponse) => {
      openCreateWithAiAgent();
    },
    [openCreateWithAiAgent]
  );

  const onRunRule = useCallback((_rule: RuleApiResponse) => {
    // Placeholder until run-rule flow is implemented
  }, []);

  const onUpdateApiKey = useCallback((_rule: RuleApiResponse) => {
    // Placeholder until update API key flow is implemented
  }, []);

  return {
    canOpenEditInDiscover: canCreateInDiscover,
    canEditWithAi: canCreateWithAi,
    onEditInDiscover,
    onEditInBuilder,
    onEditWithAiAgent,
    onRunRule,
    onUpdateApiKey,
  };
}
