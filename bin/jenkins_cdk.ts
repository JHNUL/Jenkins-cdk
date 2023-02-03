import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { JenkinsCdkStack } from "../lib/jenkins_cdk-stack";

const app = new cdk.App();
new JenkinsCdkStack(app, "JenkinsCdkStack", {
  description: "Jenkins Leader Node",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
