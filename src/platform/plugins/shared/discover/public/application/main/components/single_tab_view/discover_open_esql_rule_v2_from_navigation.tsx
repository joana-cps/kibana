/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useEffect, useState } from 'react';
import { useDiscoverServices } from '../../../../hooks/use_discover_services';
import { CreateESQLRuleFlyout } from '../top_nav/app_menu_actions/create_esql_rule_flyout';
import type { MainHistoryLocationState } from '../../../../../common';
import { useIsEsqlMode } from '../../hooks/use_is_esql_mode';
import {
  useCurrentTabSelector,
  useInternalStateGetState,
  useInternalStateSubscribe,
} from '../../state_management/redux';

/**
 * If navigation included `state: { openCreateEsqlRuleV2Flyout: true }` (e.g. from the alerting v2
 * rules list "Create in Discover" action or quick edit "Edit in Discover"), open the v2 ES|QL rule
 * form once the tab is in ES|QL mode. Optional `esqlRuleV2EditRuleId` pre-loads that rule in the form.
 */
export function DiscoverOpenEsqlRuleV2FromNavigation() {
  const services = useDiscoverServices();
  const getState = useInternalStateGetState();
  const subscribe = useInternalStateSubscribe();
  const tabId = useCurrentTabSelector((tab) => tab.id);
  const isEsqlMode = useIsEsqlMode();
  const [pendingOpen, setPendingOpen] = useState(false);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [esqlRuleV2EditRuleId, setEsqlRuleV2EditRuleId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const history = services.getScopedHistory<MainHistoryLocationState>();
    if (!history?.location.state?.openCreateEsqlRuleV2Flyout) {
      return;
    }
    const editId = history.location.state.esqlRuleV2EditRuleId;
    setEsqlRuleV2EditRuleId(typeof editId === 'string' ? editId : undefined);
    const nextState: MainHistoryLocationState = { ...history.location.state };
    delete nextState.openCreateEsqlRuleV2Flyout;
    delete nextState.esqlRuleV2EditRuleId;
    const hasRemainingState = Object.keys(nextState).length > 0;
    history.replace({
      ...history.location,
      state: hasRemainingState ? nextState : undefined,
    });
    setPendingOpen(true);
  }, [services]);

  useEffect(() => {
    if (pendingOpen && isEsqlMode) {
      setFlyoutOpen(true);
      setPendingOpen(false);
    }
  }, [pendingOpen, isEsqlMode]);

  if (!flyoutOpen) {
    return null;
  }

  return (
    <CreateESQLRuleFlyout
      services={services}
      tabId={tabId}
      getState={getState}
      subscribe={subscribe}
      editRuleId={esqlRuleV2EditRuleId}
      onClose={() => setFlyoutOpen(false)}
    />
  );
}
