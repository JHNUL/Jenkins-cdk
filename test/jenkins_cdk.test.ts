import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as JenkinsCdk from "../lib/jenkins_cdk-stack";

test("Bucket Created", () => {
  const app = new cdk.App();
  const stack = new JenkinsCdk.JenkinsCdkStack(app, "MyTestStack");
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::EC2::SecurityGroup", {
    GroupDescription: "Firewall rules",
  });
});
