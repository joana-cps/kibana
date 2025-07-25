/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect, type FunctionComponent } from 'react';
import { i18n } from '@kbn/i18n';
import {
  EuiPanel,
  EuiSteps,
  EuiCodeBlock,
  EuiSpacer,
  EuiSkeletonText,
  EuiText,
  EuiButtonEmpty,
  useGeneratedHtmlId,
  EuiIcon,
} from '@elastic/eui';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import { DASHBOARD_APP_LOCATOR } from '@kbn/deeplinks-analytics';
import { ASSET_DETAILS_LOCATOR_ID } from '@kbn/observability-shared-plugin/common';
import { type LogsLocatorParams, LOGS_LOCATOR_ID } from '@kbn/logs-shared-plugin/common';
import { usePerformanceContext } from '@kbn/ebt-tools';
import { ObservabilityOnboardingPricingFeature } from '../../../../common/pricing_features';
import { getAutoDetectCommand } from './get_auto_detect_command';
import { DASHBOARDS, useOnboardingFlow } from './use_onboarding_flow';
import { ProgressIndicator } from '../shared/progress_indicator';
import { AccordionWithIcon } from '../shared/accordion_with_icon';
import { EmptyPrompt } from '../shared/empty_prompt';
import { CopyToClipboardButton } from '../shared/copy_to_clipboard_button';
import { GetStartedPanel } from '../shared/get_started_panel';
import { isSupportedLogo, LogoIcon } from '../../shared/logo_icon';
import { FeedbackButtons } from '../shared/feedback_buttons';
import { ObservabilityOnboardingContextValue } from '../../../plugin';
import { SupportedIntegrationsList } from './supported_integrations_list';
import { useFlowBreadcrumb } from '../../shared/use_flow_breadcrumbs';
import { usePricingFeature } from '../shared/use_pricing_feature';

export const AutoDetectPanel: FunctionComponent = () => {
  useFlowBreadcrumb({
    text: i18n.translate(
      'xpack.observability_onboarding.autoDetectPanel.breadcrumbs.autoDetectLabel',
      { defaultMessage: 'Elastic Agent: Logs & Metrics' }
    ),
  });
  const { status, data, error, refetch, installedIntegrations } = useOnboardingFlow();
  const metricsOnboardingEnabled = usePricingFeature(
    ObservabilityOnboardingPricingFeature.METRICS_ONBOARDING
  );
  const command = data
    ? getAutoDetectCommand({
        scriptDownloadUrl: data.scriptDownloadUrl,
        onboardingId: data.onboardingFlow.id,
        kibanaUrl: data.kibanaUrl,
        installApiKey: data.installApiKey,
        ingestApiKey: data.ingestApiKey,
        elasticAgentVersion: data.elasticAgentVersionInfo.agentVersion,
        metricsEnabled: metricsOnboardingEnabled,
      })
    : undefined;
  const accordionId = useGeneratedHtmlId({ prefix: 'accordion' });
  const { onPageReady } = usePerformanceContext();
  const {
    services: { share },
  } = useKibana<ObservabilityOnboardingContextValue>();

  useEffect(() => {
    if (data) {
      onPageReady({
        meta: {
          description: `[ttfmp_onboarding] Request to create the onboarding flow succeeded and the flow's UI has rendered`,
        },
      });
    }
  }, [data, onPageReady]);

  if (error) {
    return <EmptyPrompt onboardingFlowType="auto-detect" error={error} onRetryClick={refetch} />;
  }

  const registryIntegrations = installedIntegrations.filter(
    (integration) => integration.installSource === 'registry'
  );
  const customIntegrations = installedIntegrations.filter(
    (integration) => integration.installSource === 'custom'
  );
  const logsLocator = share.url.locators.get<LogsLocatorParams>(LOGS_LOCATOR_ID);
  const dashboardLocator = share.url.locators.get(DASHBOARD_APP_LOCATOR);
  const assetDetailsLocator = share.url.locators.get(ASSET_DETAILS_LOCATOR_ID);

  return (
    <EuiPanel hasBorder paddingSize="xl">
      <EuiSteps
        steps={[
          {
            title: i18n.translate(
              'xpack.observability_onboarding.autoDetectPanel.runTheCommandOnLabel',
              { defaultMessage: 'Install standalone Elastic Agent on your host' }
            ),
            status: status === 'notStarted' ? 'current' : 'complete',
            children: command ? (
              <>
                <EuiText>
                  <p>
                    {metricsOnboardingEnabled
                      ? i18n.translate(
                          'xpack.observability_onboarding.autoDetectPanel.p.wellScanYourHostLabel',
                          {
                            defaultMessage: "We'll scan your host for logs and metrics, including:",
                          }
                        )
                      : i18n.translate(
                          'xpack.observability_onboarding.logsEssential.autoDetectPanel.p.wellScanYourHostLabel',
                          {
                            defaultMessage: "We'll scan your host for logs, including:",
                          }
                        )}
                  </p>
                </EuiText>
                <EuiSpacer size="s" />
                <SupportedIntegrationsList />
                <EuiSpacer />
                {/* Bash syntax highlighting only highlights a few random numbers (badly) so it looks less messy to go with plain text */}
                <EuiCodeBlock
                  paddingSize="m"
                  language="text"
                  data-test-subj="observabilityOnboardingAutoDetectPanelCodeSnippet"
                >
                  {command}
                </EuiCodeBlock>
                <EuiSpacer />
                <CopyToClipboardButton
                  textToCopy={command}
                  fill={status === 'notStarted'}
                  data-onboarding-id={data?.onboardingFlow.id}
                />
              </>
            ) : (
              <EuiSkeletonText lines={6} />
            ),
          },
          {
            title: i18n.translate(
              'xpack.observability_onboarding.autoDetectPanel.visualizeYourDataLabel',
              { defaultMessage: 'Visualize your data' }
            ),
            status:
              status === 'dataReceived'
                ? 'complete'
                : status === 'awaitingData' || status === 'inProgress'
                ? 'current'
                : 'incomplete',
            children: (
              <>
                {status === 'dataReceived' ? (
                  <ProgressIndicator
                    iconType="cheer"
                    title={i18n.translate(
                      'xpack.observability_onboarding.autoDetectPanel.yourDataIsReadyToExploreLabel',
                      { defaultMessage: 'Your data is ready to explore!' }
                    )}
                    isLoading={false}
                    data-test-subj="observabilityOnboardingAutoDetectPanelDataReceivedProgressIndicator"
                  />
                ) : status === 'awaitingData' ? (
                  <ProgressIndicator
                    title={i18n.translate(
                      'xpack.observability_onboarding.autoDetectPanel.installingElasticAgentFlexItemLabel',
                      { defaultMessage: 'Waiting for data to arrive...' }
                    )}
                    data-test-subj="observabilityOnboardingAutoDetectPanelAwaitingDataProgressIndicator"
                  />
                ) : status === 'inProgress' ? (
                  <ProgressIndicator
                    title={i18n.translate(
                      'xpack.observability_onboarding.autoDetectPanel.lookingForLogFilesFlexItemLabel',
                      { defaultMessage: 'Waiting for installation to complete...' }
                    )}
                    data-test-subj="observabilityOnboardingAutoDetectPanelInProgressProgressIndicator"
                  />
                ) : null}
                {(status === 'awaitingData' || status === 'dataReceived') &&
                installedIntegrations.length > 0 ? (
                  <>
                    <EuiSpacer />
                    {registryIntegrations
                      .slice()
                      /**
                       * System integration should always be on top
                       */
                      .sort((a, b) => (a.pkgName === 'system' ? -1 : 0))
                      .map((integration) => {
                        let actionLinks;

                        switch (integration.pkgName) {
                          case 'system':
                            actionLinks =
                              metricsOnboardingEnabled && assetDetailsLocator !== undefined
                                ? [
                                    {
                                      id: 'inventory-host-details',
                                      title: i18n.translate(
                                        'xpack.observability_onboarding.autoDetectPanel.systemOverviewTitle',
                                        {
                                          defaultMessage:
                                            'Overview your system health within the Hosts Inventory',
                                        }
                                      ),
                                      label: i18n.translate(
                                        'xpack.observability_onboarding.autoDetectPanel.systemOverviewLabel',
                                        {
                                          defaultMessage: 'Explore metrics data',
                                        }
                                      ),
                                      href: assetDetailsLocator.getRedirectUrl({
                                        entityType: 'host',
                                        entityId: integration.metadata?.hostname,
                                        assetDetails: {
                                          dateRange: {
                                            from: 'now-15m',
                                            to: 'now',
                                          },
                                        },
                                      }),
                                    },
                                  ]
                                : [
                                    {
                                      id: 'inventory-host-details',
                                      title: i18n.translate(
                                        'xpack.observability_onboarding.autoDetectPanel.systemLogsTitle',
                                        {
                                          defaultMessage: 'View and analyze system logs',
                                        }
                                      ),
                                      label: i18n.translate(
                                        'xpack.observability_onboarding.autoDetectPanel.systemLogsLabel',
                                        {
                                          defaultMessage: 'Explore logs',
                                        }
                                      ),
                                      href:
                                        logsLocator?.getRedirectUrl({
                                          dataViewSpec: {
                                            name: integration.pkgName,
                                            title: `logs-system*`,
                                            timeFieldName: '@timestamp',
                                          },
                                        }) ?? '',
                                    },
                                  ];
                            break;
                          default:
                            actionLinks =
                              dashboardLocator !== undefined && logsLocator !== undefined
                                ? integration.kibanaAssets
                                    .filter((asset) => asset.type === 'dashboard')
                                    .map((asset) => {
                                      const dashboard =
                                        DASHBOARDS[asset.id as keyof typeof DASHBOARDS];

                                      if (
                                        dashboard.type === 'metrics' &&
                                        !metricsOnboardingEnabled
                                      ) {
                                        return {
                                          id: asset.id,
                                          title: i18n.translate(
                                            'xpack.observability_onboarding.autoDetectPanel.exploreLogsDataDiscoverTitle',
                                            {
                                              defaultMessage: 'View and analyze your logs',
                                            }
                                          ),
                                          label: i18n.translate(
                                            'xpack.observability_onboarding.autoDetectPanel.exploreLogsDiscoverDataLabel',
                                            {
                                              defaultMessage: 'Explore logs',
                                            }
                                          ),
                                          href: logsLocator.getRedirectUrl({
                                            dataViewSpec: {
                                              name: integration.pkgName,
                                              title: `logs-${integration.pkgName}*`,
                                              timeFieldName: '@timestamp',
                                            },
                                          }),
                                        };
                                      }

                                      return {
                                        id: asset.id,
                                        title:
                                          dashboard.type === 'metrics'
                                            ? i18n.translate(
                                                'xpack.observability_onboarding.autoDetectPanel.exploreMetricsDataTitle',
                                                {
                                                  defaultMessage:
                                                    'Overview your metrics data with this pre-made dashboard',
                                                }
                                              )
                                            : i18n.translate(
                                                'xpack.observability_onboarding.autoDetectPanel.exploreLogsDataTitle',
                                                {
                                                  defaultMessage:
                                                    'Overview your logs data with this pre-made dashboard',
                                                }
                                              ),
                                        label:
                                          dashboard.type === 'metrics'
                                            ? i18n.translate(
                                                'xpack.observability_onboarding.autoDetectPanel.exploreMetricsDataLabel',
                                                {
                                                  defaultMessage: 'Explore metrics data',
                                                }
                                              )
                                            : i18n.translate(
                                                'xpack.observability_onboarding.autoDetectPanel.exploreLogsDataLabel',
                                                {
                                                  defaultMessage: 'Explore logs data',
                                                }
                                              ),
                                        href: dashboardLocator.getRedirectUrl({
                                          dashboardId: asset.id,
                                        }),
                                      };
                                    })
                                : [];
                        }

                        return (
                          <AccordionWithIcon
                            key={integration.pkgName}
                            id={`${accordionId}_${integration.pkgName}`}
                            icon={
                              isSupportedLogo(integration.pkgName) ? (
                                <LogoIcon size="l" logo={integration.pkgName} />
                              ) : (
                                <EuiIcon type="desktop" size="l" />
                              )
                            }
                            title={i18n.translate(
                              'xpack.observability_onboarding.autoDetectPanel.h3.getStartedWithNginxLabel',
                              {
                                defaultMessage: 'Get started with {title}',
                                values: { title: integration.title },
                              }
                            )}
                            isDisabled={status !== 'dataReceived'}
                            initialIsOpen
                          >
                            <GetStartedPanel
                              onboardingFlowType="auto-detect"
                              dataset={integration.pkgName}
                              onboardingId={data?.onboardingFlow?.id}
                              telemetryEventContext={{
                                autoDetect: {
                                  installSource: integration.installSource,
                                  pkgVersion: integration.pkgVersion,
                                  title: integration.title,
                                },
                              }}
                              integration={integration.pkgName}
                              newTab
                              isLoading={status !== 'dataReceived'}
                              actionLinks={actionLinks}
                            />
                          </AccordionWithIcon>
                        );
                      })}
                    {customIntegrations.length > 0 && (
                      <AccordionWithIcon
                        id={`${accordionId}_custom`}
                        icon={<EuiIcon type="documents" size="l" />}
                        title={i18n.translate(
                          'xpack.observability_onboarding.autoDetectPanel.h3.getStartedWithlogLabel',
                          { defaultMessage: 'Get started with custom .log files' }
                        )}
                        isDisabled={status !== 'dataReceived'}
                        initialIsOpen
                      >
                        <ul>
                          {customIntegrations.map((integration) =>
                            integration.dataStreams.map((datastream) => (
                              <li key={`${integration.pkgName}/${datastream.dataset}`}>
                                <EuiButtonEmpty
                                  data-test-subj="observabilityOnboardingAutoDetectPanelButton"
                                  href={logsLocator?.getRedirectUrl({
                                    dataViewSpec: {
                                      name: integration.pkgName,
                                      title: `${datastream.type}-${datastream.dataset}-*`,
                                      timeFieldName: '@timestamp',
                                    },
                                  })}
                                  target="_blank"
                                  iconType="document"
                                  isDisabled={status !== 'dataReceived'}
                                  flush="left"
                                  size="s"
                                >
                                  {integration.pkgName}
                                </EuiButtonEmpty>
                              </li>
                            ))
                          )}
                        </ul>
                      </AccordionWithIcon>
                    )}
                  </>
                ) : null}
              </>
            ),
          },
        ]}
      />
      <FeedbackButtons flow="auto-detect" />
    </EuiPanel>
  );
};
