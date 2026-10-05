#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { CdkProjectStack } from '../lib/cdk-project-stack';

const app = new cdk.App();
new CdkProjectStack(app, 'CdkProjectStack', {
 env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'ca-central-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
