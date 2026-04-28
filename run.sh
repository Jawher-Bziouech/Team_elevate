#!/bin/bash
sudo kubeadm init \
    --apiserver-advertise-address=172.19.74.241 \
    --pod-network-cidr=10.244.0.0/16 \
    --cri-socket=unix:///var/run/containerd/containerd.sock \
    --v=5 2>&1 | tee ~/kubeadm-init.log

