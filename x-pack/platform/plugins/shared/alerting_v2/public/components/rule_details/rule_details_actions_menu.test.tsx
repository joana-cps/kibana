/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { I18nProvider } from '@kbn/i18n-react';
import { useService } from '@kbn/core-di-browser';
import { RuleDetailsActionsMenu } from './rule_details_actions_menu';
import { RuleProvider } from './rule_context';
import type { RuleApiResponse } from '../../services/rules_api';

const mockToggleRuleEnabled = jest.fn();
const mockNavigateToUrl = jest.fn();
const mockOnEditInDiscover = jest.fn();
const mockOnEditInBuilder = jest.fn();
const mockOnEditWithAi = jest.fn();
const mockOnRun = jest.fn();
const mockOnUpdateApiKey = jest.fn();

jest.mock('@kbn/core-di-browser', () => ({
  useService: jest.fn(),
  CoreStart: (key: string) => key,
}));
jest.mock('../../hooks/use_toggle_rule_enabled', () => ({
  useToggleRuleEnabled: () => ({ mutate: mockToggleRuleEnabled }),
}));

jest.mock('../../pages/rules_list_page/use_rule_list_row_menu_actions', () => ({
  useRuleListRowMenuActions: () => ({
    canOpenEditInDiscover: true,
    canEditWithAi: true,
    onEditInDiscover: mockOnEditInDiscover,
    onEditInBuilder: mockOnEditInBuilder,
    onEditWithAiAgent: mockOnEditWithAi,
    onRunRule: mockOnRun,
    onUpdateApiKey: mockOnUpdateApiKey,
  }),
}));

const enabledRule = {
  id: 'rule-1',
  enabled: true,
  kind: 'signal',
  metadata: { name: 'Test Rule' },
} as RuleApiResponse;

const disabledRule = { ...enabledRule, enabled: false } as RuleApiResponse;

const mockUseService = useService as jest.MockedFunction<typeof useService>;

const openActionsMenu = async () => {
  await act(async () => {
    fireEvent.click(screen.getByTestId('ruleActionsButton-rule-1'));
  });
  await waitFor(() => {
    expect(screen.getByTestId('ruleActionsContextMenu-rule-1')).toBeInTheDocument();
  });
};

const renderMenu = (rule: RuleApiResponse, showDeleteConfirmation = jest.fn()) =>
  render(
    <I18nProvider>
      <RuleProvider rule={rule}>
        <RuleDetailsActionsMenu showDeleteConfirmation={showDeleteConfirmation} />
      </RuleProvider>
    </I18nProvider>
  );

describe('RuleDetailsActionsMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseService.mockImplementation((service: unknown) => {
      if (service === 'application') {
        return { navigateToUrl: mockNavigateToUrl } as never;
      }
      if (service === 'http') {
        return { basePath: { prepend: (url: string) => url } } as never;
      }
      return undefined as never;
    });
  });

  it('renders the actions button', () => {
    renderMenu(enabledRule);
    expect(screen.getByTestId('ruleActionsButton-rule-1')).toBeInTheDocument();
  });

  it('shows disable option for enabled rules', async () => {
    renderMenu(enabledRule);
    await openActionsMenu();
    expect(screen.getByTestId('toggleEnabledRule-rule-1')).toBeInTheDocument();
  });

  it('shows enable option for disabled rules', async () => {
    renderMenu(disabledRule);
    await openActionsMenu();
    expect(screen.getByTestId('toggleEnabledRule-rule-1')).toBeInTheDocument();
  });

  it('calls toggleRuleEnabled with enabled=false when disable is clicked', async () => {
    renderMenu(enabledRule);
    await openActionsMenu();
    await act(async () => {
      fireEvent.click(screen.getByTestId('toggleEnabledRule-rule-1'));
    });
    expect(mockToggleRuleEnabled).toHaveBeenCalledWith({ id: 'rule-1', enabled: false });
  });

  it('calls toggleRuleEnabled with enabled=true when enable is clicked', async () => {
    renderMenu(disabledRule);
    await openActionsMenu();
    await act(async () => {
      fireEvent.click(screen.getByTestId('toggleEnabledRule-rule-1'));
    });
    expect(mockToggleRuleEnabled).toHaveBeenCalledWith({ id: 'rule-1', enabled: true });
  });

  it('navigates to create page with cloneFrom query param when clone is clicked', async () => {
    renderMenu(enabledRule);
    await openActionsMenu();
    await act(async () => {
      fireEvent.click(screen.getByTestId('cloneRule-rule-1'));
    });
    expect(mockNavigateToUrl).toHaveBeenCalledWith(
      '/app/management/alertingV2/rules/create/form?cloneFrom=rule-1'
    );
  });

  it('calls showDeleteConfirmation when delete is clicked', async () => {
    const showDelete = jest.fn();
    renderMenu(enabledRule, showDelete);
    await openActionsMenu();
    await act(async () => {
      fireEvent.click(screen.getByTestId('deleteRule-rule-1'));
    });
    expect(showDelete).toHaveBeenCalledTimes(1);
  });

  it('always shows clone and delete options', async () => {
    renderMenu(enabledRule);
    await openActionsMenu();
    expect(screen.getByTestId('cloneRule-rule-1')).toBeInTheDocument();
    expect(screen.getByTestId('deleteRule-rule-1')).toBeInTheDocument();
  });

  it('shows Edit in Discover for discover-sourced rules', async () => {
    const discoverRule = {
      ...enabledRule,
      metadata: { ...enabledRule.metadata, name: 'D', source: 'discover' as const },
    } as RuleApiResponse;
    renderMenu(discoverRule);
    await openActionsMenu();
    expect(screen.getByTestId('editInDiscoverRule-rule-1')).toBeInTheDocument();
    expect(screen.queryByTestId('editInBuilderRule-rule-1')).not.toBeInTheDocument();
  });

  it('shows Edit in Builder for non-discover rules', async () => {
    renderMenu(enabledRule);
    await openActionsMenu();
    expect(screen.getByTestId('editInBuilderRule-rule-1')).toBeInTheDocument();
    expect(screen.queryByTestId('editInDiscoverRule-rule-1')).not.toBeInTheDocument();
  });
});
