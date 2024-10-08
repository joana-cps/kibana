/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiDescriptionList } from '@elastic/eui';
import * as ruleDetailsI18n from '../../../../translations';
import { BuildingBlock } from '../../../../rule_about_section';

export function BuildingBlockReadOnly() {
  return (
    <EuiDescriptionList
      listItems={[
        {
          title: ruleDetailsI18n.BUILDING_BLOCK_FIELD_LABEL,
          description: <BuildingBlock />,
        },
      ]}
    />
  );
}
