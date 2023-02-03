#!/bin/bash
set -x
set -e

# Update package registry
yum update -y

# Add Jenkins repo
wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo

# Import key-file from Jenkins-CI to enable installation
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key

# Upgrade all packages
yum upgrade

# Install Java
amazon-linux-extras install java-openjdk11 -y

# Install Jenkins
yum install jenkins -y

# Enable Jenkins as daemon
systemctl enable jenkins

# Start Jenkins daemon
systemctl start jenkins

# Check Jenkins status
systemctl status jenkins

# Get the initial admin password
cat /var/lib/jenkins/secrets/initialAdminPassword
