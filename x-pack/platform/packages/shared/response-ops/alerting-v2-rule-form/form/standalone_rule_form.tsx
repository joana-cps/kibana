/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect, useMemo } from 'react';
import { useForm, FormProvider, useFormState, useWatch } from 'react-hook-form';
import type { FormValues } from './types';
import { RuleForm } from './rule_form';
import type { RuleFormServices, RuleFormLayout } from './contexts';
import { useFormDefaults } from './hooks/use_form_defaults';

export interface StandaloneRuleFormProps {
  /** Initial query for the rule */
  query: string;
  services: RuleFormServices;
  /** Layout mode: 'page' renders the preview side-by-side; 'flyout' uses a nested flyout. Default: 'page'. */
  layout?: RuleFormLayout;
  /**
   * External submit handler. When provided, form submission delegates to this callback.
   * When omitted (and `includeSubmission` is true), the form uses `useCreateRule` internally.
   */
  onSubmit?: (values: FormValues) => void;
  /** Callback invoked after a successful internal submission (useCreateRule). */
  onSuccess?: () => void;
  onCancel?: () => void;
  /** Whether to include YAML editor toggle (default: false). Requires services.application. */
  includeYaml?: boolean;
  /** Whether the form is in a loading/disabled state */
  isDisabled?: boolean;
  /** Whether the form is currently submitting (controls button loading state) */
  isSubmitting?: boolean;
  /** Whether to show submit/cancel buttons (default: false) */
  includeSubmission?: boolean;
  submitLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  /**
   * Optional initial form values to populate the form with (e.g. when editing an existing rule).
   * These are shallow-merged over the query-derived defaults.
   */
  initialValues?: Partial<FormValues>;
  /** When provided, the form operates in edit mode and uses PATCH instead of POST on submission. */
  ruleId?: string;
  /**
   * When true, shows a reduced set of fields (quick edit): no kind switch, no runbook, alert conditions start collapsed.
   * Use with `includeQueryEditor` to control ES|QL edit vs read-only.
   */
  formVariant?: 'default' | 'quickEdit';
  /**
   * Whether the main ES|QL field is editable (default: true). Set false to show read-only for builder-origin rules in quick edit.
   */
  includeQueryEditor?: boolean;
  /**
   * When the form's dirty state changes (any field value differs from defaults after mount).
   * Use for custom footers, for example to disable "Apply" until the user has edited the rule.
   */
  onDirtyChange?: (isDirty: boolean) => void;
  /**
   * When set, called with the current `metadata` object whenever it changes in the form
   * (for example to drive header actions that depend on `metadata.source`).
   */
  onMetadataChange?: (metadata: FormValues['metadata']) => void;
}

/**
 * Standalone rule form with static initialization.
 *
 * Use this component for a classic flyout experience where the user controls
 * everything from the form after initial mount. External prop changes are ignored.
 *
 * When `onSubmit` is provided, form submission delegates to that callback.
 * When `onSubmit` is omitted and `includeSubmission` is true, the form
 * automatically persists the rule via the API and calls `onSuccess` afterwards.
 * If `ruleId` is provided the internal submission uses PATCH (update) instead of POST (create).
 *
 * Uses react-hook-form's `defaultValues` for static initialization.
 * Time field is auto-selected by TimeFieldSelect based on available date fields.
 */
export const StandaloneRuleForm = ({
  query,
  services,
  layout,
  onSubmit,
  onSuccess,
  includeYaml = false,
  isDisabled = false,
  isSubmitting = false,
  includeSubmission = false,
  onCancel,
  submitLabel,
  cancelLabel,
  initialValues,
  ruleId,
  formVariant = 'default',
  includeQueryEditor = true,
  onDirtyChange,
  onMetadataChange,
}: StandaloneRuleFormProps) => {
  const isNew = !ruleId;
  const queryDefaults = useFormDefaults({
    query,
    defaultSource: isNew ? initialValues?.metadata?.source ?? 'kibana_ui' : undefined,
  });

  const defaultValues = useMemo<FormValues>(
    () => ({
      ...queryDefaults,
      ...initialValues,
      metadata: {
        ...queryDefaults.metadata,
        ...initialValues?.metadata,
      },
      schedule: {
        ...queryDefaults.schedule,
        ...initialValues?.schedule,
      },
      evaluation: {
        ...queryDefaults.evaluation,
        query: {
          ...queryDefaults.evaluation.query,
          ...initialValues?.evaluation?.query,
        },
      },
      ...(initialValues?.grouping !== undefined ? { grouping: initialValues.grouping } : {}),
      ...(initialValues?.recoveryPolicy !== undefined
        ? { recoveryPolicy: initialValues.recoveryPolicy }
        : {}),
      ...(initialValues?.stateTransition !== undefined
        ? { stateTransition: initialValues.stateTransition }
        : {}),
      stateTransitionAlertDelayMode:
        initialValues?.stateTransitionAlertDelayMode ?? queryDefaults.stateTransitionAlertDelayMode,
      stateTransitionRecoveryDelayMode:
        initialValues?.stateTransitionRecoveryDelayMode ??
        queryDefaults.stateTransitionRecoveryDelayMode,
    }),
    [queryDefaults, initialValues]
  );

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      {onDirtyChange != null ? <FormDirtySubscriber onDirtyChange={onDirtyChange} /> : null}
      {onMetadataChange != null ? <MetadataSubscriber onMetadataChange={onMetadataChange} /> : null}
      <RuleForm
        services={services}
        layout={layout}
        onSubmit={onSubmit}
        onSuccess={onSuccess}
        includeYaml={includeYaml}
        isDisabled={isDisabled}
        isSubmitting={isSubmitting}
        includeSubmission={includeSubmission}
        onCancel={onCancel}
        submitLabel={submitLabel}
        cancelLabel={cancelLabel}
        ruleId={ruleId}
        formVariant={formVariant}
        includeQueryEditor={includeQueryEditor}
      />
    </FormProvider>
  );
};

function FormDirtySubscriber({ onDirtyChange }: { onDirtyChange: (isDirty: boolean) => void }) {
  const { isDirty } = useFormState<FormValues>();
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);
  return null;
}

function MetadataSubscriber({
  onMetadataChange,
}: {
  onMetadataChange: (metadata: FormValues['metadata']) => void;
}) {
  const metadata = useWatch<FormValues, 'metadata'>({ name: 'metadata' });
  useEffect(() => {
    if (metadata) {
      onMetadataChange(metadata);
    }
  }, [metadata, onMetadataChange]);
  return null;
}
