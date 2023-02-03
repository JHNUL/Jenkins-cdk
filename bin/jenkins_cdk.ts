import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { JenkinsCdkStack } from "../lib/jenkins_cdk-stack";
import { config } from "../config/vars";

const app = new cdk.App();
new JenkinsCdkStack(app, "JenkinsCdkStack", {
  description: config.STACK_DESCRIPTION,
  env: {
    account: config.ACCOUNT_ID,
    region: config.REGION,
  },
});
