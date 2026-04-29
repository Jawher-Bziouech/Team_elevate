# ☸️ Team Elevate — Kubernetes Cluster Setup
## kubeadm | WSL 2 Ubuntu | Multi-PC | Tailscale VPN

---

## Architecture

```
                      ┌─────────────────────────────────────┐
                      │         TAILSCALE VPN MESH           │
                      └──────┬──────────────┬───────────────┘
                             │              │
          ┌──────────────────┴──┐      ┌───┴─────────────────┐
          │  YOUR PC (Master)   │      │ TEAMMATE PC (Worker) │
          │  WSL Ubuntu         │      │ WSL Ubuntu           │
          │  100.x.x.x          │      │ 100.x.x.x            │
          │                     │      │                      │
          │  - API Server        │      │  - kubelet           │
          │  - etcd              │      │  - kube-proxy        │
          │  - Scheduler         │      │  - containerd        │
          │  - Controller Mgr    │      │                      │
          │  - Calico CNI        │      │  Runs: user-svc      │
          │  - Eureka            │      │        internship    │
          │  - Gateway           │      │        quiz, etc.    │
          └─────────────────────┘      └──────────────────────┘
```

---

## File Structure

| File | Purpose | Who Runs It |
|------|---------|-------------|
| `1-prerequisites.sh` | Install containerd, kubeadm, kubelet, kubectl | **ALL** |
| `2-tailscale.sh` | Set up VPN so PCs can talk to each other | **ALL** |
| `3-master-init.sh` | Initialize the control plane | **Master only** |
| `4-worker-join.sh` | Join the cluster as a worker | **Each worker** |
| `5-app-manifests.yaml` | Deploy all Team Elevate microservices | **Master only** |
| `6-excellence-monitoring.sh` | Install Helm, Prometheus, Grafana, HPA | **Master only** |

---

## STEP 0 — Enable systemd in WSL (ALL members)

Run this **in PowerShell** on Windows (NOT inside WSL):

```powershell
wsl -u root bash -c "echo '[boot]' > /etc/wsl.conf && echo 'systemd=true' >> /etc/wsl.conf"
wsl --shutdown
```

Then reopen Ubuntu WSL and verify:
```bash
systemctl --version
# Must return a version number ✅
```

---

## STEP 1 — Prerequisites (ALL members)

Copy the `kubernetes/` folder to your WSL home directory, then:

```bash
cd ~/kubernetes
chmod +x 1-prerequisites.sh
sudo bash 1-prerequisites.sh
```

What it installs:
- Disables swap (required by Kubernetes)
- Loads `overlay` and `br_netfilter` kernel modules
- Installs **containerd** as the container runtime
- Installs **kubeadm**, **kubelet**, **kubectl** v1.29

---

## STEP 2 — Tailscale VPN (ALL members)

```bash
sudo bash 2-tailscale.sh
```

1. A login URL will appear — open it in your browser
2. All group members log in to the **same Tailscale account/network**
3. After login, get your Tailscale IP and share it in the group chat:

```bash
tailscale ip -4
# Example: 100.94.23.15  ← Share this!
```

---

## STEP 3 — Initialize Master Node (MASTER ONLY)

Edit `3-master-init.sh` and replace `100.x.x.x` with YOUR Tailscale IP:

```bash
nano 3-master-init.sh
# Set: MASTER_TAILSCALE_IP="100.94.xx.xx"
```

Then run:
```bash
sudo bash 3-master-init.sh
```

At the end you will see output like:
```
kubeadm join 100.94.xx.xx:6443 --token abcdef.xxxxxxxxxxxx \
  --discovery-token-ca-cert-hash sha256:xxxxxxxxxxxxxxxx
```

📋 **Copy and share this entire command with all worker members!**

---

## STEP 4 — Worker Nodes Join (EACH WORKER)

Edit `4-worker-join.sh`:
1. Set `WORKER_NAME` to something unique (e.g., `worker1`, `worker2`)
2. Paste the join command from Step 3 into `KUBEADM_JOIN_COMMAND`

```bash
nano 4-worker-join.sh
sudo bash 4-worker-join.sh
```

---

## STEP 5 — Verify Cluster (On Master)

```bash
kubectl get nodes
```

Expected output:
```
NAME      STATUS   ROLES           AGE   VERSION
master    Ready    control-plane   5m    v1.29.x
worker1   Ready    <none>          2m    v1.29.x
worker2   Ready    <none>          2m    v1.29.x
```

---

## STEP 6 — Deploy Team Elevate Application (On Master)

```bash
kubectl apply -f 5-app-manifests.yaml

# Watch all pods start up:
kubectl get pods -n team-elevate -w
```

---

## STEP 7 — Excellence Bonus: Monitoring (On Master)

```bash
sudo bash 6-excellence-monitoring.sh
```

This installs (via **Helm**):
- **Prometheus** — collects metrics from all pods
- **Grafana** — beautiful dashboards for your cluster
- **Alertmanager** — send alerts on failures
- **Metrics Server** — enables Horizontal Pod Autoscaling (HPA)

After running, Grafana is accessible at:
```
http://<master-tailscale-ip>:32000
Username: admin
Password: prom-operator
```

The `5-app-manifests.yaml` already includes **HPA** for `user-service` and `internship-service` — they automatically scale from 2 to 5 replicas when CPU exceeds 70%.

---

## Useful Commands (On Master)

```bash
# See all nodes
kubectl get nodes

# See all pods in team-elevate namespace
kubectl get pods -n team-elevate

# See auto-scaling status
kubectl get hpa -n team-elevate

# See services and their ports
kubectl get svc -n team-elevate

# Describe a pod (for debugging)
kubectl describe pod <pod-name> -n team-elevate

# See pod logs
kubectl logs <pod-name> -n team-elevate
```

---

## Excellence Bonus Summary (For Presentation)

> **Tools NOT seen in class:**
> 1. **Tailscale** — Zero-config VPN mesh enabling multi-PC kubeadm clusters over the internet
> 2. **Helm** — Kubernetes package manager; used to install the full monitoring stack in one command
> 3. **Prometheus + Grafana** — Full observability stack: metrics collection, visualization, and alerting
> 4. **Horizontal Pod Autoscaler (HPA)** — Automatically scales microservice replicas based on CPU load
> 5. **Metrics Server** — Enables real-time resource usage monitoring required by HPA
