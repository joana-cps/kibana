/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiIcon,
  EuiLoadingSpinner,
  EuiSpacer,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import {
  mapRuleResponseToFormValues,
  RULE_FORM_ID,
  StandaloneRuleForm,
  useUpdateRule,
  type FormValues,
} from '@kbn/alerting-v2-rule-form';
import { DISCOVER_APP_LOCATOR } from '@kbn/deeplinks-analytics';
import { CoreStart, useService } from '@kbn/core-di-browser';
import { PluginStart } from '@kbn/core-di';
import type { DiscoverAppLocatorParams } from '@kbn/discover-plugin/common';
import type { DataPublicPluginStart } from '@kbn/data-plugin/public';
import type { DataViewsPublicPluginStart } from '@kbn/data-views-plugin/public';
import type { LensPublicStart } from '@kbn/lens-plugin/public';
import { useQueryClient } from '@kbn/react-query';
import { FormattedMessage } from '@kbn/i18n-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFetchRule } from '../../../hooks/use_fetch_rule';
import { ruleKeys } from '../../../hooks/query_key_factory';
import { useAlertingV2KibanaServices } from '../../../kibana_services';
import { paths } from '../../../constants';

const FLYOUT_TITLE_ID = 'alertingV2QuickEditRuleFlyoutTitle';

/**
 * Push flyout width matches {@link RuleSummaryFlyout} (view rule): `type="push"` and `size="s"`.
 * `session` + `flyoutMenuProps` follow the shared rule-form flyout pattern (session rail).
 */
const QUICK_EDIT_FLYOUT_PROPS = {
  session: 'start' as const,
  flyoutMenuProps: { title: 'Quick Edit Alert Rule', hideTitle: true },
  type: 'push' as const,
  size: 's' as const,
  /** Default flyout padding is l; use s for a tighter quick-edit layout. */
  paddingSize: 's' as const,
};

export interface QuickEditRuleFlyoutProps {
  ruleId: string;
  onClose: () => void;
}

export const QuickEditRuleFlyout = ({ ruleId, onClose }: QuickEditRuleFlyoutProps) => {
  const kibana = useAlertingV2KibanaServices();
  const queryClient = useQueryClient();
  const http = useService(CoreStart('http'));
  const application = useService(CoreStart('application'));
  const notifications = useService(CoreStart('notifications'));
  const data = useService(PluginStart('data')) as DataPublicPluginStart;
  const dataViews = useService(PluginStart('dataViews')) as DataViewsPublicPluginStart;
  const lens = useService(PluginStart('lens')) as LensPublicStart;
  const { data: rule, isLoading, isError, error } = useFetchRule(ruleId);
  const { updateRule, isLoading: isSaving } = useUpdateRule({ http, notifications, ruleId });

  const ruleFormServices = useMemo(
    () => ({
      http,
      data,
      dataViews,
      notifications,
      application,
      lens,
    }),
    [http, data, dataViews, notifications, application, lens]
  );

  const [isFormDirty, setFormIsDirty] = useState(false);
  const clickedRef = useRef(false);

  useEffect(() => {
    setFormIsDirty(false);
  }, [ruleId]);
  const onFocusCapture = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (clickedRef.current) {
        return;
      }
      const from = e.relatedTarget as HTMLElement | null;
      if (from && !e.currentTarget.contains(from)) {
        (e.target as HTMLElement).blur();
        from.focus({ preventScroll: true });
      }
    },
    []
  );

  const onSaveSuccess = useCallback(() => {
    queryClient.invalidateQueries(ruleKeys.lists());
    queryClient.invalidateQueries(ruleKeys.detail(ruleId));
    onClose();
  }, [queryClient, ruleId, onClose]);

  const handleSubmit = useCallback(
    (values: FormValues) => {
      updateRule(values, {
        onSuccess: onSaveSuccess,
      });
    },
    [updateRule, onSaveSuccess]
  );

  const isDiscoverSource = rule?.metadata?.source === 'discover';
  const includeQueryEditor = isDiscoverSource;

  const openEditInDiscover = useCallback(async () => {
    if (!kibana?.share || !rule) {
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
  }, [kibana, application, rule]);

  const openEditInBuilder = useCallback(() => {
    if (!rule) {
      return;
    }
    application.navigateToUrl(http.basePath.prepend(paths.ruleEdit(rule.id)));
  }, [http, application, rule]);

  const quickEditInfo = i18n.translate('xpack.alertingV2.quickEditRuleFlyout.info', {
    defaultMessage: 'Inline editing offers limited configuration options',
  });

  const configTitle = i18n.translate('xpack.alertingV2.quickEditRuleFlyout.configSection', {
    defaultMessage: 'Rule configuration',
  });

  if (isLoading) {
    return (
      <EuiFlyout
        {...QUICK_EDIT_FLYOUT_PROPS}
        onClose={onClose}
        data-test-subj="quickEditRuleFlyout"
        aria-labelledby={FLYOUT_TITLE_ID}
      >
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="xs" id={FLYOUT_TITLE_ID}>
            <h2>
              <FormattedMessage
                id="xpack.alertingV2.quickEditRuleFlyout.title"
                defaultMessage="Quick Edit Alert Rule"
              />
            </h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiLoadingSpinner size="l" />
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }

  if (isError || !rule) {
    return (
      <EuiFlyout
        {...QUICK_EDIT_FLYOUT_PROPS}
        onClose={onClose}
        data-test-subj="quickEditRuleFlyout"
        aria-labelledby={FLYOUT_TITLE_ID}
      >
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="xs" id={FLYOUT_TITLE_ID}>
            <h2>
              <FormattedMessage
                id="xpack.alertingV2.quickEditRuleFlyout.title"
                defaultMessage="Quick Edit Alert Rule"
              />
            </h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiCallOut
            color="danger"
            title={
              <FormattedMessage
                id="xpack.alertingV2.quickEditRuleFlyout.loadError"
                defaultMessage="We couldn’t load this rule."
              />
            }
          >
            {error instanceof Error ? error.message : String(error ?? '')}
          </EuiCallOut>
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }

  const initialQuery = rule.evaluation.query.base;
  const initialValues = mapRuleResponseToFormValues(rule);
  const canOpenDiscover = Boolean(
    isDiscoverSource && kibana?.share?.url?.locators?.get?.(DISCOVER_APP_LOCATOR)
  );

  return (
    <EuiFlyout
      {...QUICK_EDIT_FLYOUT_PROPS}
      onClose={onClose}
      data-test-subj="quickEditRuleFlyout"
      aria-labelledby={FLYOUT_TITLE_ID}
    >
      <div
        style={{ display: 'contents' }}
        onPointerDown={() => {
          clickedRef.current = true;
        }}
        onPointerUp={() => {
          clickedRef.current = false;
        }}
        onFocusCapture={onFocusCapture}
      >
        <EuiFlyoutHeader hasBorder>
          <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false} wrap={false}>
            <EuiFlexItem grow={false}>
              <EuiTitle size="xs" id={FLYOUT_TITLE_ID}>
                <h2>
                  <FormattedMessage
                    id="xpack.alertingV2.quickEditRuleFlyout.title"
                    defaultMessage="Quick Edit Alert Rule"
                  />
                </h2>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiToolTip content={quickEditInfo}>
                <EuiIcon type="info" size="m" color="text" aria-label={quickEditInfo} tabIndex={0} />
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiFlexGroup
            alignItems="center"
            justifyContent="spaceBetween"
            gutterSize="m"
            responsive={false}
          >
            <EuiTitle size="xs">
              <h3>{configTitle}</h3>
            </EuiTitle>
            {isDiscoverSource ? (
              <EuiButton
                size="s"
                iconType="discoverApp"
                color="text"
                display="base"
                isDisabled={!canOpenDiscover}
                onClick={openEditInDiscover}
              >
                <FormattedMessage
                  id="xpack.alertingV2.quickEditRuleFlyout.editInDiscover"
                  defaultMessage="Edit in Discover"
                />
              </EuiButton>
            ) : (
              <EuiButton
                size="s"
                iconType="indexOpen"
                color="text"
                display="base"
                onClick={openEditInBuilder}
              >
                <FormattedMessage
                  id="xpack.alertingV2.quickEditRuleFlyout.editInBuilder"
                  defaultMessage="Edit in Builder"
                />
              </EuiButton>
            )}
          </EuiFlexGroup>
          <EuiSpacer size="m" />
          <StandaloneRuleForm
            key={ruleId}
            query={initialQuery}
            services={ruleFormServices}
            layout="flyout"
            formVariant="quickEdit"
            includeQueryEditor={includeQueryEditor}
            includeYaml={false}
            includeSubmission={false}
            isSubmitting={isSaving}
            onSubmit={handleSubmit}
            onDirtyChange={setFormIsDirty}
            ruleId={ruleId}
            initialValues={initialValues}
          />
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={onClose} isDisabled={isSaving} data-test-subj="quickEditRuleCancel">
                <FormattedMessage
                  id="xpack.alertingV2.quickEditRuleFlyout.cancel"
                  defaultMessage="Cancel"
                />
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                type="submit"
                form={RULE_FORM_ID}
                isLoading={isSaving}
                isDisabled={isSaving || !isFormDirty}
                data-test-subj="quickEditRuleApplyButton"
              >
                <FormattedMessage
                  id="xpack.alertingV2.quickEditRuleFlyout.applyAndClose"
                  defaultMessage="Apply and close"
                />
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </div>
    </EuiFlyout>
  );
};
