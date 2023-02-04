import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { KeyPair } from "cdk-ec2-key-pair";
import { config } from "../config/vars";
import { Asset } from "aws-cdk-lib/aws-s3-assets";
import path = require("path");

export class JenkinsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Virtual Private Cloud - default for now
    const defaultVpc = ec2.Vpc.fromLookup(this, config.VPC_ID, {
      isDefault: true,
    });

    // Security group is a virtual firewall for the instance
    const securityGroup = new ec2.SecurityGroup(
      this,
      config.SECURITY_GROUP_ID,
      {
        vpc: defaultVpc,
        description: config.SECURITY_GROUP_DESCRIPTION,
        allowAllOutbound: true,
      }
    );
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allow SSH Access"
    );
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "Allows HTTP access"
    );
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "Allows HTTPS access"
    );

    // Create a role for the instance
    const role = new iam.Role(this, config.EC2_INSTANCE_ROLE_ID, {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    // This creates an EC2 key pair, the public key will be stored in the instance
    const key = new KeyPair(this, config.EC2_INSTANCE_KEYPAIR_ID, {
      name: config.EC2_INSTANCE_KEYPAIR_NAME,
      description: config.EC2_INSTANCE_KEYPAIR_DESCRIPTION,
      storePublicKey: true, // by default the public key will not be stored in Secrets Manager
    });

    // Grant read access to the public key to another role or user
    key.grantReadOnPublicKey(role);

    // Provision the actual EC2 instance
    const instance = new ec2.Instance(this, config.EC2_INSTANCE_ID, {
      vpc: defaultVpc,
      role: role,
      securityGroup: securityGroup,
      instanceName: config.EC2_INSTANCE_NAME,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        cpuType: ec2.AmazonLinuxCpuType.X86_64,
      }),
      keyName: key.keyPairName,
    });

    // Create an asset that will be used as part of User Data to run on first load
    const asset = new Asset(this, "Asset", {
      path: path.join(__dirname, "../scripts/config.sh"),
    });
    const localPath = instance.userData.addS3DownloadCommand({
      bucket: asset.bucket,
      bucketKey: asset.s3ObjectKey,
    });

    instance.userData.addExecuteFileCommand({
      filePath: localPath,
      arguments: "--verbose -y",
    });
    asset.grantRead(instance.role);

    // Output some value after the stack has been set up
    new cdk.CfnOutput(this, "public-ip", {
      value: instance.instancePublicIp,
    });
    new cdk.CfnOutput(this, "get-private-key", {
      value: `aws secretsmanager get-secret-value --secret-id ec2-ssh-key/${key.keyPairName}/private --query SecretString --output text > keys/${instance.instanceId}.pem & chmod 400 keys/${instance.instanceId}.pem`,
    });
    new cdk.CfnOutput(this, "connect-with-ssh", {
      value: `ssh -i keys/${instance.instanceId}.pem -o IdentitiesOnly=yes ec2-user@${instance.instancePublicIp}`,
    });
  }
}
