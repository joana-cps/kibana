/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { EuiButtonIcon, EuiContextMenu, EuiPopover, useGeneratedHtmlId } from '@elastic/eui';
import type { EuiContextMenuPanelDescriptor } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import type { RuleApiResponse } from '../../services/rules_api';

/**
 * Rule overflow menu — structure, labels, and EUI icons follow:
 * Figma: RnA Rule Authoring (node 1592:37436)
 * https://www.figma.com/design/tY4wbu3wXh4XK9p4MmYRLQ/RnA---Rule-Authoring-experience?node-id=1592-37436
 */
export interface RuleActionsMenuProps {
  rule: RuleApiResponse;
  canOpenEditInDiscover: boolean;
  canEditWithAi: boolean;
  onEditInDiscover: (rule: RuleApiResponse) => void | Promise<void>;
  onEditInBuilder: (rule: RuleApiResponse) => void;
  onEditWithAiAgent: (rule: RuleApiResponse) => void;
  onRunRule: (rule: RuleApiResponse) => void;
  onUpdateApiKey: (rule: RuleApiResponse) => void;
  onClone: (rule: RuleApiResponse) => void;
  onDelete: (rule: RuleApiResponse) => void;
  onToggleEnabled: (rule: RuleApiResponse) => void;
}

export const RuleActionsMenu = ({
  rule,
  canOpenEditInDiscover,
  canEditWithAi,
  onEditInDiscover,
  onEditInBuilder,
  onEditWithAiAgent,
  onRunRule,
  onUpdateApiKey,
  onClone,
  onDelete,
  onToggleEnabled,
}: RuleActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuKey, setMenuKey] = useState(0);
  const popoverId = useGeneratedHtmlId({ prefix: 'ruleActionsMenu' });

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setMenuKey((k) => k + 1);
  }, []);

  const isDiscoverSource = rule.metadata?.source === 'discover';

  const moreActionsLabel = i18n.translate('xpack.alertingV2.rulesList.action.moreActions', {
    defaultMessage: 'More actions',
  });

  const menuAriaLabel = i18n.translate('xpack.alertingV2.rulesList.action.actionsMenu', {
    defaultMessage: 'Rule actions',
  });

  const panels: EuiContextMenuPanelDescriptor[] = useMemo(() => {
    const editInDiscoverLabel = i18n.translate('xpack.alertingV2.rulesList.action.editInDiscover', {
      defaultMessage: 'Edit in Discover',
    });
    const editInBuilderLabel = i18n.translate('xpack.alertingV2.rulesList.action.editInBuilder', {
      defaultMessage: 'Edit in Builder',
    });
    const editWithAiLabel = i18n.translate('xpack.alertingV2.rulesList.action.editWithAiAgent', {
      defaultMessage: 'Edit with AI Agent',
    });
    const cloneLabel = i18n.translate('xpack.alertingV2.rulesList.action.clone', {
      defaultMessage: 'Clone',
    });
    const runLabel = i18n.translate('xpack.alertingV2.rulesList.action.run', {
      defaultMessage: 'Run',
    });
    const updateApiKeyLabel = i18n.translate('xpack.alertingV2.rulesList.action.updateApiKey', {
      defaultMessage: 'Update API key',
    });
    const deleteLabel = i18n.translate('xpack.alertingV2.rulesList.action.delete', {
      defaultMessage: 'Delete',
    });
    const enableLabel = i18n.translate('xpack.alertingV2.rulesList.action.enable', {
      defaultMessage: 'Enable',
    });
    const disableLabel = i18n.translate('xpack.alertingV2.rulesList.action.disable', {
      defaultMessage: 'Disable',
    });
    const editWithAiUnavailableTooltip = i18n.translate(
      'xpack.alertingV2.rulesList.action.editWithAiAgentUnavailableTooltip',
      {
        defaultMessage: 'Agent Builder isn’t available in this deployment.',
      }
    );

    const items: EuiContextMenuPanelDescriptor[number]['items'] = [];

    if (isDiscoverSource) {
      items.push({
        'data-test-subj': `editInDiscoverRule-${rule.id}`,
        name: editInDiscoverLabel,
        icon: 'discoverApp',
        disabled: !canOpenEditInDiscover,
        onClick: () => {
          if (!canOpenEditInDiscover) {
            return;
          }
          void onEditInDiscover(rule);
          closeMenu();
        },
      });
    } else {
      items.push({
        'data-test-subj': `editInBuilderRule-${rule.id}`,
        name: editInBuilderLabel,
        icon: 'indexOpen',
        onClick: () => {
          onEditInBuilder(rule);
          closeMenu();
        },
      });
    }

    items.push({
      'data-test-subj': `editWithAiRule-${rule.id}`,
      name: editWithAiLabel,
      icon: 'productAgent',
      disabled: !canEditWithAi,
      ...(canEditWithAi
        ? {}
        : { toolTipContent: editWithAiUnavailableTooltip, toolTipProps: { position: 'left' } }),
      onClick: () => {
        if (!canEditWithAi) {
          return;
        }
        onEditWithAiAgent(rule);
        closeMenu();
      },
    });

    items.push({
      'data-test-subj': `cloneRule-${rule.id}`,
      name: cloneLabel,
      icon: 'copy',
      onClick: () => {
        onClone(rule);
        closeMenu();
      },
    });

    items.push({ isSeparator: true, key: 'rule-actions-sep-1', margin: 'xs', size: 'full' });

    items.push({
      'data-test-subj': `runRule-${rule.id}`,
      name: runLabel,
      icon: 'play',
      onClick: () => {
        onRunRule(rule);
        closeMenu();
      },
    });

    items.push({
      'data-test-subj': `toggleEnabledRule-${rule.id}`,
      name: rule.enabled ? disableLabel : enableLabel,
      icon: rule.enabled ? 'crossInCircle' : 'checkCircle',
      onClick: () => {
        onToggleEnabled(rule);
        closeMenu();
      },
    });

    items.push({
      'data-test-subj': `updateApiKeyRule-${rule.id}`,
      name: updateApiKeyLabel,
      icon: 'key',
      onClick: () => {
        onUpdateApiKey(rule);
        closeMenu();
      },
    });

    items.push({ isSeparator: true, key: 'rule-actions-sep-2', margin: 'xs', size: 'full' });

    items.push({
      'data-test-subj': `deleteRule-${rule.id}`,
      name: deleteLabel,
      icon: 'trash',
      onClick: () => {
        onDelete(rule);
        closeMenu();
      },
    });

    return [{ id: 0, items }];
  }, [
    canOpenEditInDiscover,
    canEditWithAi,
    closeMenu,
    isDiscoverSource,
    onClone,
    onDelete,
    onEditInBuilder,
    onEditInDiscover,
    onEditWithAiAgent,
    onRunRule,
    onToggleEnabled,
    onUpdateApiKey,
    rule,
  ]);

  return (
    <EuiPopover
      id={popoverId}
      button={
        <EuiButtonIcon
          iconType="boxesHorizontal"
          aria-label={moreActionsLabel}
          color="text"
          onClick={() => setIsOpen((open) => !open)}
          data-test-subj={`ruleActionsButton-${rule.id}`}
        />
      }
      isOpen={isOpen}
      closePopover={closeMenu}
      panelPaddingSize="s"
      anchorPosition="downRight"
      aria-label={menuAriaLabel}
    >
      <EuiContextMenu
        key={menuKey}
        data-test-subj={`ruleActionsContextMenu-${rule.id}`}
        size="m"
        initialPanelId={0}
        panels={panels}
      />
    </EuiPopover>
  );
};
