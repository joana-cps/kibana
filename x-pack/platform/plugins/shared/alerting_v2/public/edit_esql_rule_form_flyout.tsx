/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiCallOut, EuiLoadingSpinner, EuiSpacer } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import type { RuleResponse } from '@kbn/alerting-v2-schemas';
import { ALERTING_V2_RULE_API_PATH } from '@kbn/alerting-v2-constants';
import {
  mapRuleResponseToFormValues,
  RuleFormFlyout,
  StandaloneRuleForm,
  useUpdateRule,
  type FormValues,
} from '@kbn/alerting-v2-rule-form';
import { QueryClient, QueryClientProvider, useQuery } from '@kbn/react-query';
import React, { useCallback, useMemo } from 'react';
import { ruleKeys } from './hooks/query_key_factory';
import type { AlertingV2KibanaServices } from './kibana_services';

export interface EditEsqlRuleFormFlyoutProps {
  ruleId: string;
  onClose: () => void;
  push?: boolean;
  services: AlertingV2KibanaServices;
}

const EditEsqlRuleFormFlyoutInner = ({
  ruleId,
  onClose,
  push = true,
  services,
}: EditEsqlRuleFormFlyoutProps) => {
  // Use http from props instead of useFetchRule (useService(RulesApi)) so this flyout works
  // when mounted from Discover, where the alerting v2 plugin DI container is not in context.
  const { data: rule, isLoading, isError, error } = useQuery({
    queryKey: ruleKeys.detail(ruleId),
    queryFn: () =>
      services.http.get<RuleResponse>(
        `${ALERTING_V2_RULE_API_PATH}/${encodeURIComponent(ruleId)}`
      ),
    enabled: Boolean(ruleId),
    onError: () => {
      services.notifications.toasts.addDanger(
        i18n.translate('xpack.alertingV2.editEsqlRuleFormFlyout.loadErrorToast', {
          defaultMessage: 'Failed to load rule',
        })
      );
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { updateRule, isLoading: isSaving } = useUpdateRule({
    http: services.http,
    notifications: services.notifications,
    ruleId,
  });

  const handleSubmit = useCallback(
    (values: FormValues) => {
      updateRule(values, { onSuccess: onClose });
    },
    [updateRule, onClose]
  );

  const formBody = (() => {
    if (isLoading) {
      return <EuiLoadingSpinner size="l" />;
    }
    if (isError || !rule) {
      return (
        <EuiCallOut
          color="danger"
          title={
            <FormattedMessage
              id="xpack.alertingV2.editEsqlRuleFormFlyout.loadErrorTitle"
              defaultMessage="We couldn’t load this rule."
            />
          }
        >
          {error instanceof Error ? error.message : String(error ?? '')}
        </EuiCallOut>
      );
    }
    const isDiscoverSource = rule.metadata?.source === 'discover';
    return (
      <StandaloneRuleForm
        key={ruleId}
        query={rule.evaluation.query.base}
        initialValues={mapRuleResponseToFormValues(rule)}
        ruleId={ruleId}
        onSubmit={handleSubmit}
        services={services}
        layout="flyout"
        includeYaml
        includeSubmission={false}
        isSubmitting={isSaving}
        includeQueryEditor={isDiscoverSource}
      />
    );
  })();

  return (
    <RuleFormFlyout
      variant="edit"
      push={push}
      onClose={onClose}
      isLoading={isLoading || isSaving}
    >
      <EuiSpacer size="s" />
      {formBody}
    </RuleFormFlyout>
  );
};

export const EditEsqlRuleFormFlyout = (props: EditEsqlRuleFormFlyoutProps) => {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <EditEsqlRuleFormFlyoutInner {...props} />
    </QueryClientProvider>
  );
};
