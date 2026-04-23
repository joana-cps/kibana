/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useCallback, useMemo } from 'react';
import { useService, CoreStart } from '@kbn/core-di-browser';
import { DISCOVER_APP_LOCATOR } from '@kbn/deeplinks-analytics';
import type { DiscoverAppLocatorParams } from '@kbn/discover-plugin/common';
import { useAlertingV2KibanaServices } from '../../kibana_services';

export const DEFAULT_ESQL_FOR_CREATE_RULE = 'FROM logs-*\n| LIMIT 1';

export function useRuleListCreationActions() {
  const application = useService(CoreStart('application'));
  const { capabilities } = application;
  const kibana = useAlertingV2KibanaServices();
  const share = kibana?.share;
  const agentBuilder = kibana?.agentBuilder;

  const canCreateInDiscover = useMemo(
    () =>
      Boolean(share) &&
      Boolean(capabilities.discover_v2?.show) &&
      Boolean(capabilities.alertingVTwo) &&
      Boolean(share?.url?.locators?.get?.(DISCOVER_APP_LOCATOR)),
    [capabilities.alertingVTwo, capabilities.discover_v2?.show, share]
  );

  const canCreateWithAi = Boolean(agentBuilder?.openChat);

  const openCreateInDiscover = useCallback(async () => {
    if (!share) {
      return;
    }
    const locator = share.url.locators.get<DiscoverAppLocatorParams>(DISCOVER_APP_LOCATOR);
    if (!locator?.getLocation) {
      return;
    }
    const { app, path, state } = await locator.getLocation({
      query: { esql: DEFAULT_ESQL_FOR_CREATE_RULE },
      openCreateEsqlRuleV2Flyout: true,
    });
    await application.navigateToApp(app, { path, state });
  }, [application, share]);

  const openCreateWithAiAgent = useCallback(() => {
    agentBuilder?.openChat();
  }, [agentBuilder]);

  return {
    canCreateInDiscover,
    canCreateWithAi,
    openCreateInDiscover,
    openCreateWithAiAgent,
  };
}
