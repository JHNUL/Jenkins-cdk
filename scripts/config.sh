#!/bin/bash -xe

################################################
# Initial script to install required           #
# packages when the machine is provisioned     #
################################################

# Nae working at the moment, lad
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
  yum update -y # Update package registry
  wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo # Add Jenkins repo
  rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key # Import key-file from Jenkins-CI to enable installation
  yum upgrade # Upgrade all packages
  amazon-linux-extras install java-openjdk11 -y # Install Java
  yum install jenkins -y # Install Jenkins
  systemctl enable jenkins # Enable Jenkins as daemon
  systemctl start jenkins # Start Jenkins daemon
  systemctl status jenkins # Check Jenkins status
  echo "All done!"
