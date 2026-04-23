/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiButtonIcon, EuiToolTip } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import type { RuleApiResponse } from '../services/rules_api';

export interface QuickEditRuleButtonProps {
  rule: RuleApiResponse;
  onEdit: (rule: RuleApiResponse) => void;
}

export const QuickEditRuleButton = ({ rule, onEdit }: QuickEditRuleButtonProps) => {
  const quickEditLabel = i18n.translate('xpack.alertingV2.quickEdit', {
    defaultMessage: 'Quick edit',
  });

  return (
    <EuiToolTip content={quickEditLabel}>
      <EuiButtonIcon
        iconType="pencil"
        color="text"
        aria-label={quickEditLabel}
        data-test-subj={`editRule-${rule.id}`}
        onClick={() => onEdit(rule)}
      />
    </EuiToolTip>
  );
};
