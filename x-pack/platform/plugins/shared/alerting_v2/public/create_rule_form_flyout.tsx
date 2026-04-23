/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiLoadingSpinner } from '@elastic/eui';
import useAsync from 'react-use/lib/useAsync';
import { untilPluginStartServicesReady } from './kibana_services';
import { EditEsqlRuleFormFlyout } from './edit_esql_rule_form_flyout';

export interface CreateRuleFormFlyoutProps {
  query: string;
  onClose?: () => void;
  push?: boolean;
  /**
   * When set, opens the flyout in edit mode with the rule loaded from the API
   * (for example, Discover "Edit" from a Discover-origin rule).
   */
  ruleId?: string;
}

export const DynamicRuleFormFlyout = (props: CreateRuleFormFlyoutProps) => {
  const { ruleId, ...createProps } = props;

  const { loading, value } = useAsync(() => {
    const servicesPromise = untilPluginStartServicesReady();
    const modulePromise = import('@kbn/alerting-v2-rule-form');
    return Promise.all([servicesPromise, modulePromise]);
  }, []);

  const services = value?.[0];
  const Flyout = value?.[1]?.DynamicRuleFormFlyout;

  if (loading || !services) return <EuiLoadingSpinner size="l" />;

  if (ruleId) {
    return (
      <EditEsqlRuleFormFlyout
        services={services}
        ruleId={ruleId}
        onClose={createProps.onClose ?? (() => {})}
        push={createProps.push}
      />
    );
  }

  if (!Flyout) return <EuiLoadingSpinner size="l" />;

  return <Flyout {...createProps} services={services} />;
};
