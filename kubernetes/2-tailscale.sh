#!/bin/bash
# ============================================================
# STEP 2: Tailscale VPN — Run on ALL nodes (Master + Workers)
# This gives each WSL instance a stable IP reachable by teammates
# ============================================================
set -e

echo "======================================================"
echo " [1/3] Installing Tailscale..."
echo "======================================================"
curl -fsSL https://tailscale.com/install.sh | sh

echo "======================================================"
echo " [2/3] Starting Tailscale daemon..."
echo "======================================================"
systemctl enable --now tailscaled

echo "======================================================"
echo " [3/3] Connecting to Tailscale network..."
echo "======================================================"
echo ""
echo "  A browser link will open. Log in with your account."
echo "  (All group members must use the SAME Tailscale account/network)"
echo ""
tailscale up

echo ""
echo "======================================================"
echo " Done! Your Tailscale IP is:"
tailscale ip -4
echo ""
echo " Share this IP with your group!"
echo " Master runs: sudo bash 3-master-init.sh"
echo " Workers run: sudo bash 4-worker-join.sh"
echo "======================================================"
