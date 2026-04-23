/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useMemo } from 'react';
import {
  EuiButton,
  EuiCallOut,
  EuiLoadingSpinner,
  EuiPageHeader,
  EuiPageTemplate,
  EuiSpacer,
} from '@elastic/eui';
import { useService, CoreStart } from '@kbn/core-di-browser';
import { PluginStart } from '@kbn/core-di';
import type { DataPublicPluginStart } from '@kbn/data-plugin/public';
import type { DataViewsPublicPluginStart } from '@kbn/data-views-plugin/public';
import type { LensPublicStart } from '@kbn/lens-plugin/public';
import { FormattedMessage } from '@kbn/i18n-react';
import { useParams, useLocation } from 'react-router-dom';
import { useQueryClient } from '@kbn/react-query';
import { DISCOVER_APP_LOCATOR } from '@kbn/deeplinks-analytics';
import type { DiscoverAppLocatorParams } from '@kbn/discover-plugin/common';
import type { SharePluginStart } from '@kbn/share-plugin/public';
import { StandaloneRuleForm, mapRuleResponseToFormValues } from '@kbn/alerting-v2-rule-form';
import type { FormValues } from '@kbn/alerting-v2-rule-form';
import { i18n } from '@kbn/i18n';
import { useFetchRule } from '../../hooks/use_fetch_rule';
import { ruleKeys } from '../../hooks/query_key_factory';
import { useBreadcrumbs } from '../../hooks/use_breadcrumbs';
import { paths } from '../../constants';
import { useRuleListCreationActions } from '../rules_list_page/use_rule_list_creation_actions';

const DEFAULT_QUERY = 'FROM logs-*\n| LIMIT 1';

const CLONE_NAME_SUFFIX = i18n.translate('xpack.alertingV2.ruleFormPage.cloneNameSuffix', {
  defaultMessage: ' (clone)',
});

export const RuleFormPage = () => {
  const { id: ruleId } = useParams<{ id?: string }>();
  const { search } = useLocation();
  const cloneFromId = new URLSearchParams(search).get('cloneFrom');

  let content: React.ReactNode;
  if (ruleId) {
    content = <FetchedRuleFormPage ruleId={ruleId} mode="edit" />;
  } else if (cloneFromId) {
    content = <FetchedRuleFormPage ruleId={cloneFromId} mode="clone" />;
  } else {
    content = <RuleFormPageContent />;
  }

  return (
    <EuiPageTemplate.Section paddingSize="none" restrictWidth={true}>
      {content}
    </EuiPageTemplate.Section>
  );
};

interface FetchedRuleFormPageProps {
  ruleId: string;
  mode: 'edit' | 'clone';
}

const FetchedRuleFormPage = ({ ruleId, mode }: FetchedRuleFormPageProps) => {
  const isClone = mode === 'clone';
  const {
    data: rule,
    isLoading,
    isFetching,
    isFetchedAfterMount,
    isError,
    error,
  } = useFetchRule(ruleId);

  if (isLoading || (!isFetchedAfterMount && isFetching)) {
    return <EuiLoadingSpinner size="xl" />;
  }

  if (isError || (!rule && !isLoading)) {
    return (
      <EuiCallOut
        title={
          isClone ? (
            <FormattedMessage
              id="xpack.alertingV2.ruleFormPage.cloneLoadErrorTitle"
              defaultMessage="Failed to load source rule for cloning"
            />
          ) : (
            <FormattedMessage
              id="xpack.alertingV2.ruleFormPage.loadErrorTitle"
              defaultMessage="Failed to load rule"
            />
          )
        }
        color="danger"
        iconType="error"
        announceOnMount
      >
        {error instanceof Error ? error.message : String(error)}
      </EuiCallOut>
    );
  }

  const initialQuery = rule.evaluation?.query?.base ?? DEFAULT_QUERY;
  const initialValues = mapRuleResponseToFormValues(rule);

  if (isClone && initialValues.metadata) {
    initialValues.metadata = {
      ...initialValues.metadata,
      name: `${initialValues.metadata.name}${CLONE_NAME_SUFFIX}`,
    };
  }

  return (
    <RuleFormPageContent
      ruleId={isClone ? undefined : ruleId}
      initialQuery={initialQuery}
      initialValues={initialValues}
    />
  );
};

interface RuleFormPageContentProps {
  ruleId?: string;
  initialQuery?: string;
  initialValues?: Partial<FormValues>;
}

const RuleFormPageContent = ({ ruleId, initialQuery, initialValues }: RuleFormPageContentProps) => {
  const isEditing = Boolean(ruleId);
  const http = useService(CoreStart('http'));
  const notifications = useService(CoreStart('notifications'));
  const application = useService(CoreStart('application'));
  const { navigateToUrl } = application;
  const { basePath } = http;
  const data = useService(PluginStart('data')) as DataPublicPluginStart;
  const dataViews = useService(PluginStart('dataViews')) as DataViewsPublicPluginStart;
  const lens = useService(PluginStart('lens')) as LensPublicStart;
  const share = useService(PluginStart('share')) as SharePluginStart;
  const queryClient = useQueryClient();

  const { canCreateInDiscover, openCreateInDiscover } = useRuleListCreationActions();

  const openEsqlInDiscover = useCallback(
    async (esql: string) => {
      const locator = share?.url?.locators?.get<DiscoverAppLocatorParams>(DISCOVER_APP_LOCATOR);
      if (!locator) {
        return;
      }
      const { app, path, state } = await locator.getLocation({
        query: { esql },
      });
      await application.navigateToApp(app, { path, state });
    },
    [application, share]
  );

  /** Create / clone: open Discover with the new-rule flyout; use form default query when set (e.g. clone). */
  const onCreateInDiscoverFromForm = useCallback(async () => {
    if (initialQuery === undefined || initialQuery === DEFAULT_QUERY) {
      await openCreateInDiscover();
      return;
    }
    const locator = share?.url?.locators?.get<DiscoverAppLocatorParams>(DISCOVER_APP_LOCATOR);
    if (!locator?.getLocation) {
      return;
    }
    const { app, path, state } = await locator.getLocation({
      query: { esql: initialQuery },
      openCreateEsqlRuleV2Flyout: true,
    });
    await application.navigateToApp(app, { path, state });
  }, [application, initialQuery, openCreateInDiscover, share]);

  const openContinueInDiscover = useCallback(async () => {
    if (!ruleId) {
      return;
    }
    const locator = share?.url?.locators?.get<DiscoverAppLocatorParams>(DISCOVER_APP_LOCATOR);
    if (!locator?.getLocation) {
      return;
    }
    const esql = initialQuery ?? DEFAULT_QUERY;
    const { app, path, state } = await locator.getLocation({
      query: { esql },
      openCreateEsqlRuleV2Flyout: true,
      esqlRuleV2EditRuleId: ruleId,
    });
    await application.navigateToApp(app, { path, state });
  }, [application, initialQuery, ruleId, share]);

  useBreadcrumbs(isEditing ? 'edit' : 'create');

  const ruleFormServices = useMemo(
    () => ({
      http,
      data,
      dataViews,
      notifications,
      application,
      lens,
      openEsqlInDiscover,
    }),
    [http, data, dataViews, notifications, application, lens, openEsqlInDiscover]
  );

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(ruleKeys.lists());
    if (ruleId) {
      queryClient.invalidateQueries(ruleKeys.detail(ruleId));
    }
    navigateToUrl(basePath.prepend(paths.ruleList));
  }, [queryClient, ruleId, navigateToUrl, basePath]);

  const onCancel = () => {
    navigateToUrl(basePath.prepend(paths.ruleList));
  };

  const pageTitle = isEditing ? (
    <FormattedMessage id="xpack.alertingV2.createRule.editPageTitle" defaultMessage="Edit rule" />
  ) : (
    <FormattedMessage id="xpack.alertingV2.createRule.pageTitle" defaultMessage="Create rule" />
  );

  const submitLabel = isEditing ? (
    <FormattedMessage id="xpack.alertingV2.createRule.saveLabel" defaultMessage="Save changes" />
  ) : (
    <FormattedMessage id="xpack.alertingV2.createRule.submitLabel" defaultMessage="Create rule" />
  );

  const editInDiscoverLabel = i18n.translate('xpack.alertingV2.rulesList.action.editInDiscover', {
    defaultMessage: 'Edit in Discover',
  });
  const createInDiscoverLabel = i18n.translate('xpack.alertingV2.rulesList.createInDiscover', {
    defaultMessage: 'Create in Discover',
  });

  const pageHeaderRight = useMemo(() => {
    if (!canCreateInDiscover) {
      return undefined;
    }
    if (ruleId) {
      return [
        <EuiButton
          key="editInDiscover"
          data-test-subj="ruleFormPageEditInDiscoverButton"
          size="s"
          color="text"
          fill={false}
          iconType="discoverApp"
          onClick={() => {
            void openContinueInDiscover();
          }}
        >
          {editInDiscoverLabel}
        </EuiButton>,
      ];
    }
    return [
      <EuiButton
        key="createInDiscoverForm"
        data-test-subj="ruleFormPageCreateInDiscoverButton"
        size="s"
        color="text"
        fill={false}
        iconType="discoverApp"
        onClick={() => {
          void onCreateInDiscoverFromForm();
        }}
      >
        {createInDiscoverLabel}
      </EuiButton>,
    ];
  }, [
    canCreateInDiscover,
    createInDiscoverLabel,
    editInDiscoverLabel,
    onCreateInDiscoverFromForm,
    openContinueInDiscover,
    ruleId,
  ]);

  return (
    <>
      <EuiPageHeader pageTitle={pageTitle} rightSideItems={pageHeaderRight} />
      <EuiSpacer size="m" />
      <StandaloneRuleForm
        query={initialQuery ?? DEFAULT_QUERY}
        services={ruleFormServices}
        includeYaml
        isDisabled={false}
        includeSubmission
        onSuccess={onSuccess}
        onCancel={onCancel}
        ruleId={ruleId}
        initialValues={initialValues}
        submitLabel={submitLabel}
      />
    </>
  );
};
