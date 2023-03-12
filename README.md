# Setup a Jenkins node in AWS with CDK

CDK App to set up a Jenkins node to AWS. Currently a single node setup.

## Prerequisites

- [Nodejs](https://nodejs.org/en/) v.18.*
- [AWS CLI v2](https://aws.amazon.com/cli/) configured to an account

## How to

First run `npm i` to install project dependencies.

Copy `.env.example` file to project root as `.env` and fill in all values. AWS region and account id must be correct according to your aws-cli setup. Other values are attributes to the created resources.

Available commands:

- `npm run build` compile typescript to js
- `npm run test` perform the jest unit tests
- `npm run synth` emits the synthesized CloudFormation template
- `npm run diff` compare deployed stack with current state
- `npm run deploy` deploy this stack to your AWS account/region
- `npm run destroy` destroys the deployed stack

## Connect to the machine

After a successful deployment the output contains the public ip address of the provisioned EC2 instance. Then you need the private key for the EC2 keypair that is created during the deployment.

The deploy process writes details of the deployment to an output file `jenkins-cdk-outputs.json` like this
```json
{
  "JenkinsCdkStack": {
    "sshConnect": "ssh -i keys/<keyname>.pem -o IdentitiesOnly=yes ec2-user@<ip>",
    "instanceId": "<instance_id>",
    "publicIp": "<public_ip>",
    "getPemFile": "aws secretsmanager get-secret-value...",
    "keyPairName": "<keypair_name>"
  }
}
```

In order to connect to the created EC2 instance, you need to get the pem file using the command named `getPemFile` and then use the pem file when creating an ssh connection with the command named `sshConnect`.

## Setting up the nodes

### Prerequisites

- [Ansible](https://docs.ansible.com/)
- pem file created with the `getPemFile` command from `jenkins-cdk-outputs.json`


When the infra is created its time to set up the state of the machine. This part uses Ansible. The deploy process should create a variable file in `ansible/host_vars` with the EC2 instance details. Test the setup by running

```sh
ansible-playbook -i ansible/inventory.yaml ansible/playbook.yaml
```
