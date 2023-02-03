import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { KeyPair } from "cdk-ec2-key-pair";

export class JenkinsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Virtual Private Cloud - default for now
    const defaultVpc = ec2.Vpc.fromLookup(this, "VPC", { isDefault: true });

    // Security group is a virtual firewall for the instance
    const securityGroup = new ec2.SecurityGroup(
      this,
      "Jenkins-leader-SecurityGroup",
      {
        vpc: defaultVpc,
        description: "Firewall rules",
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
      ec2.Port.tcp(8080),
      "Allows HTTP access to 8080"
    );

    // We will be needing a role for the instance
    const role = new iam.Role(this, "Jenkins-leader-ec2Role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    // This creates an EC2 key pair, the public key will be stored in the instance
    const key = new KeyPair(this, "Jenkins-leader-node-key", {
      name: "Jenkins-leader-node-key",
      description: "Your key pair, sir",
      storePublicKey: true, // by default the public key will not be stored in Secrets Manager
    });

    // Grant read access to the public key to another role or user
    key.grantReadOnPublicKey(role);

    // Provision the actual EC2 instance
    const instance = new ec2.Instance(this, "Jenkins-leader-node", {
      vpc: defaultVpc,
      role: role,
      securityGroup: securityGroup,
      instanceName: "Jenkins-leader-node",
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

    // Output some value after the stack has been set up
    new cdk.CfnOutput(this, "Public ip", {
      value: instance.instancePublicIp,
    });
    new cdk.CfnOutput(this, "Get private key", {
      value: `aws secretsmanager get-secret-value --secret-id ec2-ssh-key/${key.keyPairName}/private --query SecretString --output text`,
    });
    new cdk.CfnOutput(this, "Connect with ssh", {
      value: `ssh -i <keyfile>.pem -o IdentitiesOnly=yes ec2-user@${instance.instancePublicIp}`,
    });
  }
}
