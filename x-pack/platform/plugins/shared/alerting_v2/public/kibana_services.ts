/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useSyncExternalStore } from 'react';
import { BehaviorSubject } from 'rxjs';
import type { RuleFormServices } from '@kbn/alerting-v2-rule-form';
import type { AgentBuilderPluginStart } from '@kbn/agent-builder-plugin/public';
import type { ExpressionsStart } from '@kbn/expressions-plugin/public';
import type { SharePluginStart } from '@kbn/share-plugin/public';
import type { UiActionsStart } from '@kbn/ui-actions-plugin/public';

/** Services shared by rule UI, episodes UI, and other alerting_v2 surfaces. */
export type AlertingV2KibanaServices = RuleFormServices & {
  expressions: ExpressionsStart;
  uiActions: UiActionsStart;
  share: SharePluginStart;
  agentBuilder?: AgentBuilderPluginStart;
};

const servicesReady$ = new BehaviorSubject<AlertingV2KibanaServices | undefined>(undefined);

export const untilPluginStartServicesReady = (): Promise<AlertingV2KibanaServices> => {
  if (servicesReady$.value) return Promise.resolve(servicesReady$.value);
  return new Promise<AlertingV2KibanaServices>((resolve) => {
    const sub = servicesReady$.subscribe((deps) => {
      if (deps) {
        sub.unsubscribe();
        resolve(deps);
      }
    });
  });
};

export const setKibanaServices = (services: AlertingV2KibanaServices) => {
  servicesReady$.next(services);
};

/**
 * Resolves to undefined until plugin start has registered services (rare on first paint).
 */
export const useAlertingV2KibanaServices = (): AlertingV2KibanaServices | undefined => {
  return useSyncExternalStore(
    (onChange) => {
      const sub = servicesReady$.subscribe(() => onChange());
      return () => sub.unsubscribe();
    },
    () => servicesReady$.value,
    () => servicesReady$.value
  );
};

