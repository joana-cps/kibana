/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { EuiButton, EuiContextMenu, EuiSplitButton, useGeneratedHtmlId } from '@elastic/eui';
import type { EuiContextMenuPanelDescriptor } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { useService, CoreStart } from '@kbn/core-di-browser';
import { FormattedMessage } from '@kbn/i18n-react';
import { useBoolean } from '@kbn/react-hooks';
import { paths } from '../../constants';
import { useRuleListCreationActions } from './use_rule_list_creation_actions';

export const CreateRuleSplitButton = () => {
  const { basePath } = useService(CoreStart('http'));
  const application = useService(CoreStart('application'));
  const {
    canCreateInDiscover,
    canCreateWithAi,
    openCreateInDiscover,
    openCreateWithAiAgent,
  } = useRuleListCreationActions();

  const [isOpen, { off: close, toggle }] = useBoolean(false);
  const [menuKey, setMenuKey] = useState(0);
  const popoverId = useGeneratedHtmlId({ prefix: 'createRuleSplit' });
  const closeMenu = useCallback(() => {
    close();
    setMenuKey((k) => k + 1);
  }, [close]);

  const onCreateWithAi = useCallback(() => {
    openCreateWithAiAgent();
  }, [openCreateWithAiAgent]);

  const panels: EuiContextMenuPanelDescriptor[] = useMemo(() => {
    const items: EuiContextMenuPanelDescriptor[number]['items'] = [];
    if (canCreateInDiscover) {
      items.push({
        'data-test-subj': 'createRuleMenuCreateInDiscover',
        name: i18n.translate('xpack.alertingV2.rulesList.createInDiscover', {
          defaultMessage: 'Create in Discover',
        }),
        icon: 'discoverApp',
        onClick: () => {
          void openCreateInDiscover();
          closeMenu();
        },
      });
    }
    if (canCreateWithAi) {
      items.push({
        'data-test-subj': 'createRuleMenuCreateWithAiAgent',
        name: i18n.translate('xpack.alertingV2.rulesList.createWithAiAgent', {
          defaultMessage: 'Create with AI Agent',
        }),
        icon: 'productAgent',
        onClick: () => {
          onCreateWithAi();
          closeMenu();
        },
      });
    }
    return [{ id: 0, items }];
  }, [canCreateInDiscover, canCreateWithAi, closeMenu, onCreateWithAi, openCreateInDiscover]);

  const hasDropdownItems = canCreateInDiscover || canCreateWithAi;
  const createHref = basePath.prepend(paths.ruleCreate);
  const secondaryLabel = i18n.translate('xpack.alertingV2.rulesList.createRuleSplitOptions', {
    defaultMessage: 'More create options for rules',
  });

  const createRuleLabel = (
    <FormattedMessage
      id="xpack.alertingV2.rulesList.createRuleButton"
      defaultMessage="Create rule"
    />
  );

  if (!hasDropdownItems) {
    return (
      <EuiButton fill href={createHref} data-test-subj="createRuleButton" iconType="plusInCircle">
        {createRuleLabel}
      </EuiButton>
    );
  }

  return (
    <EuiSplitButton data-test-subj="createRuleSplitButton" color="primary" fill size="m">
      <EuiSplitButton.ActionPrimary
        data-test-subj="createRuleButton"
        iconType="plusInCircle"
        onClick={() => {
          application.navigateToUrl(createHref);
        }}
      >
        {createRuleLabel}
      </EuiSplitButton.ActionPrimary>
      <EuiSplitButton.ActionSecondary
        data-test-subj="createRuleSplitButtonDropdown"
        iconType="arrowDown"
        aria-label={secondaryLabel}
        onClick={toggle}
        popoverProps={{
          id: popoverId,
          isOpen,
          closePopover: closeMenu,
          anchorPosition: 'downRight',
          panelPaddingSize: 'none',
          children: <EuiContextMenu key={menuKey} size="m" initialPanelId={0} panels={panels} />,
        }}
      />
    </EuiSplitButton>
  );
};
