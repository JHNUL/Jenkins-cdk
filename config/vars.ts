import assert = require("assert");
import * as d from "dotenv";
d.config();

const config = {
  REGION: process.env.REGION as string,
  ACCOUNT_ID: process.env.ACCOUNT_ID as string,
  STACK_DESCRIPTION: process.env.STACK_DESCRIPTION as string,
  VPC_ID: process.env.VPC_ID as string,
  SECURITY_GROUP_ID: process.env.SECURITY_GROUP_ID as string,
  SECURITY_GROUP_DESCRIPTION: process.env.SECURITY_GROUP_DESCRIPTION as string,
  EC2_INSTANCE_ID: process.env.EC2_INSTANCE_ID as string,
  EC2_INSTANCE_NAME: process.env.EC2_INSTANCE_NAME as string,
  EC2_INSTANCE_ROLE_ID: process.env.EC2_INSTANCE_ROLE_ID as string,
  EC2_INSTANCE_KEYPAIR_ID: process.env.EC2_INSTANCE_KEYPAIR_ID as string,
  EC2_INSTANCE_KEYPAIR_NAME: process.env.EC2_INSTANCE_KEYPAIR_NAME as string,
  EC2_INSTANCE_KEYPAIR_DESCRIPTION: process.env
    .EC2_INSTANCE_KEYPAIR_DESCRIPTION as string,
};

Object.entries(config).forEach(([key, val]) => {
  assert.ok(val, `value for ${key} not found`);
});

export { config };
