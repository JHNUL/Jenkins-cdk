# Setup a Jenkins node in AWS with CDK

CDK App to set up a Jenkins node to AWS.

## Prerequisites

- Nodejs v.18.*
- AWS CLI v2 configured to an account

## How to

First run `npm i` to install project dependencies.

Copy `.env.example` file to project root as `.env` and fill in all values.

Available commands:

- `npm run build` compile typescript to js
- `npm run test` perform the jest unit tests
- `npm run synth` emits the synthesized CloudFormation template
- `npm run diff` compare deployed stack with current state
- `npm run deploy` deploy this stack to your AWS account/region
- `npm run destroy` destroys the deployed stack

## Connect to the machine

After a successful deployment the output contains the public ip address of the provisioned EC2 instance. Then you need the private key for the EC2 keypair that is created during the deployment. Use the following commands to get it. This requires your local AWS cli set up to the same account where the instance was provisioned.

Get the secret key from the created keypair and write it to a pem file. You can copy this command directly from the build output.
```sh
aws secretsmanager get-secret-value --secret-id ec2-ssh-key/<key-name>/private --query SecretString --output text > keys/<key-name>.pem & chmod 400 keys/<key-name>.pem
```

Then ssh into the provisioned instance using the private key and instance public ip.
```sh
ssh -i keys/<key-name>.pem -o IdentitiesOnly=yes ec2-user@$<instance-public-ip>
```
