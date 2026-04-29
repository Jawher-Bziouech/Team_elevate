#!/bin/bash
# ============================================================
# STEP 1: Prerequisites — Run on ALL nodes (Master + Workers)
# ============================================================
set -e

echo "======================================================"
echo " [1/6] Disabling Swap..."
echo "======================================================"
swapoff -a
sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab

echo "======================================================"
echo " [2/6] Loading kernel modules..."
echo "======================================================"
cat <<EOF | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
modprobe overlay
modprobe br_netfilter

echo "======================================================"
echo " [3/6] Configuring sysctl for Kubernetes networking..."
echo "======================================================"
cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
sysctl --system

echo "======================================================"
echo " [4/6] Installing containerd (container runtime)..."
echo "======================================================"
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release apt-transport-https

# Docker repo for containerd
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y containerd.io

# Configure containerd to use systemd cgroup driver
mkdir -p /etc/containerd
containerd config default | tee /etc/containerd/config.toml > /dev/null
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
systemctl restart containerd
systemctl enable containerd

echo "======================================================"
echo " [5/6] Installing kubeadm, kubelet, kubectl..."
echo "======================================================"
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key \
  | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \
  https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /" \
  | tee /etc/apt/sources.list.d/kubernetes.list

apt-get update -y
apt-get install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl

systemctl enable --now kubelet

echo "======================================================"
echo " [6/6] Done! Prerequisites installed successfully."
echo "        Now run: sudo bash 2-tailscale.sh"
echo "======================================================"
