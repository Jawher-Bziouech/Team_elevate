#!/bin/bash
# ============================================================
# EXCELLENCE BONUS — Prometheus + Grafana Monitoring Stack
# Run on MASTER after cluster is up and app is deployed
# ============================================================
set -e

echo "======================================================"
echo " [1/4] Installing Helm (Kubernetes package manager)..."
echo "======================================================"
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version

echo "======================================================"
echo " [2/4] Adding Prometheus community Helm chart repo..."
echo "======================================================"
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

echo "======================================================"
echo " [3/4] Installing kube-prometheus-stack..."
echo "       (Prometheus + Grafana + Alertmanager)"
echo "======================================================"
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

helm upgrade --install kube-prometheus-stack \
  prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.service.type=NodePort \
  --set grafana.service.nodePort=32000 \
  --set prometheus.service.type=NodePort \
  --set prometheus.service.nodePort=32001 \
  --set alertmanager.service.type=NodePort \
  --set alertmanager.service.nodePort=32002 \
  --wait --timeout=5m

echo "======================================================"
echo " [4/4] Installing Metrics Server (required for HPA)..."
echo "======================================================"
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Patch metrics-server to skip TLS (needed in self-signed kubeadm clusters)
kubectl patch deployment metrics-server \
  -n kube-system \
  --type='json' \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'

echo ""
echo "======================================================"
echo " ✅ EXCELLENCE STACK DEPLOYED!"
echo ""
echo " 📊 Grafana:      http://$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}'):32000"
echo "                  Username: admin | Password: prom-operator"
echo ""
echo " 📈 Prometheus:   http://$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}'):32001"
echo ""
echo " 🔔 Alertmanager: http://$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}'):32002"
echo "======================================================"
echo ""
echo " To deploy the Team Elevate app:"
echo "   kubectl apply -f 5-app-manifests.yaml"
echo ""
echo " To check HPA status:"
echo "   kubectl get hpa -n team-elevate"
echo "======================================================"
