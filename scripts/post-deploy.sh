#!/bin/bash -e

if [ ! -e "jenkins-cdk-outputs.json" ]; then
  echo CDK output file not found!
  exit 1
fi

EC2_INSTANCE_PUBLIC_IPV4=$(grep -i publicip jenkins-cdk-outputs.json | cut -d '"' -f 4)
EC2_INSTANCE_ID=$(grep -i instanceid jenkins-cdk-outputs.json | cut -d '"' -f 4)
KEY_FILE="$PWD"/keys/"$EC2_INSTANCE_ID".pem

mkdir -p ansible/host_vars

if [ -e "ansible/host_vars/jenkinsleader.yaml" ]; then
  mv ansible/host_vars/jenkinsleader.yaml ansible/host_vars/jenkinsleader.old
fi

cat << EOF > ansible/host_vars/jenkinsleader.yaml
---
user: ec2-user
key_file: $KEY_FILE
public_ip: $EC2_INSTANCE_PUBLIC_IPV4
EOF

echo "Ansible host vars written to ansible/host_vars/jenkinsleader.yaml"
cat ansible/host_vars/jenkinsleader.yaml