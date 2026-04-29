#!/bin/bash
# ============================================================
# STEP 3: Initialize Master Node — Run on MASTER ONLY
# ============================================================
set -e

# ── EDIT THIS ──────────────────────────────────────────────
# Replace with the output of: tailscale ip -4
MASTER_TAILSCALE_IP="100.x.x.x"
# ───────────────────────────────────────────────────────────

if [ "$MASTER_TAILSCALE_IP" = "100.x.x.x" ]; then
  echo "ERROR: Please edit this script and set MASTER_TAILSCALE_IP"
  echo "       Run 'tailscale ip -4' to get your IP"
  exit 1
fi

echo "======================================================"
echo " [1/4] Initializing Kubernetes control plane..."
echo "       Master IP: $MASTER_TAILSCALE_IP"
echo "======================================================"

kubeadm init \
  --apiserver-advertise-address="$MASTER_TAILSCALE_IP" \
  --apiserver-cert-extra-sans="$MASTER_TAILSCALE_IP" \
  --pod-network-cidr=192.168.0.0/16 \
  --node-name="master" \
  --ignore-preflight-errors=all

echo "======================================================"
echo " [2/4] Configuring kubectl for current user..."
echo "======================================================"
REAL_USER=${SUDO_USER:-$USER}
HOME_DIR=$(eval echo "~$REAL_USER")

mkdir -p "$HOME_DIR/.kube"
cp -i /etc/kubernetes/admin.conf "$HOME_DIR/.kube/config"
chown "$REAL_USER:$REAL_USER" "$HOME_DIR/.kube/config"

# Also set up for root
mkdir -p /root/.kube
cp -i /etc/kubernetes/admin.conf /root/.kube/config

echo "======================================================"
echo " [3/4] Installing Calico CNI (pod networking)..."
echo "======================================================"
# Run as the real user so kubectl uses the right config
sudo -u "$REAL_USER" kubectl apply -f \
  https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/calico.yaml

echo "======================================================"
echo " [4/4] Waiting for master node to become Ready..."
echo "======================================================"
sudo -u "$REAL_USER" kubectl wait --for=condition=Ready node/master \
  --timeout=120s 2>/dev/null || true

sudo -u "$REAL_USER" kubectl get nodes

echo ""
echo "======================================================"
echo " ✅ MASTER NODE IS READY!"
echo ""
echo " 📋 COPY THE JOIN COMMAND BELOW AND SHARE WITH WORKERS:"
echo "======================================================"
echo ""
kubeadm token create --print-join-command
echo ""
echo "======================================================"
echo " Workers: paste that command into 4-worker-join.sh"
echo "======================================================"
