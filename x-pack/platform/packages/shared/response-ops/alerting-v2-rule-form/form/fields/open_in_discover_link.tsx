/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useState } from 'react';
import { EuiButtonEmpty } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { useRuleFormServices } from '../contexts';

export interface OpenInDiscoverLinkProps {
  esql: string;
}

export const OpenInDiscoverLink = ({ esql }: OpenInDiscoverLinkProps) => {
  const { openEsqlInDiscover } = useRuleFormServices();
  const [isNavigating, setIsNavigating] = useState(false);
  const trimmed = esql.trim();
  const canOpen = Boolean(openEsqlInDiscover) && Boolean(trimmed);

  const onClick = useCallback(async () => {
    if (!openEsqlInDiscover || !trimmed) {
      return;
    }
    setIsNavigating(true);
    try {
      await openEsqlInDiscover(trimmed);
    } finally {
      setIsNavigating(false);
    }
  }, [openEsqlInDiscover, trimmed]);

  if (!openEsqlInDiscover) {
    return null;
  }

  return (
    <EuiButtonEmpty
      size="xs"
      color="text"
      iconType="discoverApp"
      isLoading={isNavigating}
      isDisabled={!canOpen || isNavigating}
      onClick={onClick}
      data-test-subj="ruleFormOpenInDiscover"
    >
      {i18n.translate('xpack.alertingV2.ruleForm.openInDiscover', {
        defaultMessage: 'Open in Discover',
      })}
    </EuiButtonEmpty>
  );
};
