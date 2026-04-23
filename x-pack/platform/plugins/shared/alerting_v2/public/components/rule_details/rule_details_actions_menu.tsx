/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback } from 'react';
import { CoreStart, useService } from '@kbn/core-di-browser';
import { paths } from '../../constants';
import { useToggleRuleEnabled } from '../../hooks/use_toggle_rule_enabled';
import { useRuleListRowMenuActions } from '../../pages/rules_list_page/use_rule_list_row_menu_actions';
import { RuleActionsMenu } from '../../pages/rules_list_page/rule_actions_menu';
import { useRule } from './rule_context';
import type { RuleApiResponse } from '../../services/rules_api';

export interface RuleDetailsActionsMenuProps {
  showDeleteConfirmation: () => void;
}

export const RuleDetailsActionsMenu: React.FunctionComponent<RuleDetailsActionsMenuProps> = ({
  showDeleteConfirmation,
}) => {
  const rule = useRule();
  const { navigateToUrl } = useService(CoreStart('application'));
  const { basePath } = useService(CoreStart('http'));
  const { mutate: toggleRuleEnabled } = useToggleRuleEnabled();
  const {
    canOpenEditInDiscover,
    canEditWithAi,
    onEditInDiscover,
    onEditInBuilder,
    onEditWithAiAgent,
    onRunRule,
    onUpdateApiKey,
  } = useRuleListRowMenuActions();

  const onClone = useCallback(
    (r: RuleApiResponse) => {
      navigateToUrl(
        basePath.prepend(`${paths.ruleCreateForm}?cloneFrom=${encodeURIComponent(r.id)}`)
      );
    },
    [navigateToUrl, basePath]
  );

  const onDelete = useCallback(
    (_rule: RuleApiResponse) => {
      showDeleteConfirmation();
    },
    [showDeleteConfirmation]
  );

  const onToggleEnabled = useCallback(
    (r: RuleApiResponse) => {
      toggleRuleEnabled({ id: r.id, enabled: !r.enabled });
    },
    [toggleRuleEnabled]
  );

  return (
    <RuleActionsMenu
      rule={rule}
      canOpenEditInDiscover={canOpenEditInDiscover}
      canEditWithAi={canEditWithAi}
      onEditInDiscover={onEditInDiscover}
      onEditInBuilder={onEditInBuilder}
      onEditWithAiAgent={onEditWithAiAgent}
      onRunRule={onRunRule}
      onUpdateApiKey={onUpdateApiKey}
      onClone={onClone}
      onDelete={onDelete}
      onToggleEnabled={onToggleEnabled}
    />
  );
};
