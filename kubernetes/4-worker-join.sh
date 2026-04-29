#!/bin/bash
# ============================================================
# STEP 4: Join Worker Node — Run on each WORKER machine
# ============================================================
set -e

# ── EDIT THIS ──────────────────────────────────────────────
# Paste the full join command from the master node output here.
# It looks like:
# kubeadm join 100.x.x.x:6443 --token xxxxx --discovery-token-ca-cert-hash sha256:xxxxx
#
# Replace the line below with your actual join command:
KUBEADM_JOIN_COMMAND="PASTE_JOIN_COMMAND_HERE"
# ───────────────────────────────────────────────────────────

# Also set your desired worker node name (e.g. worker1, worker2)
WORKER_NAME="worker1"

if [ "$KUBEADM_JOIN_COMMAND" = "PASTE_JOIN_COMMAND_HERE" ]; then
  echo "ERROR: Please edit this script and paste the join command from the master."
  exit 1
fi

echo "======================================================"
echo " Joining cluster as node: $WORKER_NAME"
echo "======================================================"

# Set the node name before joining
echo "KUBELET_EXTRA_ARGS=--node-name=$WORKER_NAME" > /etc/default/kubelet
systemctl restart kubelet

# Run the join command
eval "$KUBEADM_JOIN_COMMAND --node-name=$WORKER_NAME --ignore-preflight-errors=all"

echo ""
echo "======================================================"
echo " ✅ Worker node joined the cluster successfully!"
echo ""
echo " On the MASTER node, run to verify:"
echo "   kubectl get nodes"
echo "======================================================"
