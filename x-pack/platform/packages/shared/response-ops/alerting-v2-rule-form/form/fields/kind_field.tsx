/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiCheckableCard, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiToolTip } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { Controller, useFormContext } from 'react-hook-form';
import type { FormValues } from '../types';

const CARD_ID = 'ruleV2KindField';

const tooltipContent = i18n.translate('xpack.alertingV2.ruleForm.kindField.checkboxDescription', {
  defaultMessage:
    'Enables lifecycle management: the system will track state transitions across alert events for each series, manage episodes, and dispatch to notification policies. Without this, alert events are observation-only records.',
});

export const KindField = () => {
  const { control } = useFormContext<FormValues>();

  return (
    <Controller
      name="kind"
      control={control}
      render={({ field: { value, onChange } }) => {
        const isChecked = value === 'alert';

        return (
          <EuiCheckableCard
            id={CARD_ID}
            checkableType="checkbox"
            label={
              <EuiFlexGroup alignItems="center" responsive={false} gutterSize="xs">
                <EuiFlexItem grow={false}>
                  <strong>
                    {i18n.translate('xpack.alertingV2.ruleForm.kindField.checkboxLabel', {
                      defaultMessage: 'Track active and recovered state over time',
                    })}
                  </strong>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiToolTip content={tooltipContent} position="top">
                    <EuiIcon
                      tabIndex={0}
                      type="info"
                      size="s"
                      color="subdued"
                      data-test-subj="kindFieldDescriptionInfo"
                      aria-label={tooltipContent}
                    />
                  </EuiToolTip>
                </EuiFlexItem>
              </EuiFlexGroup>
            }
            checked={isChecked}
            onChange={() => onChange(isChecked ? 'signal' : 'alert')}
            data-test-subj="kindField"
          />
        );
      }}
    />
  );
};
