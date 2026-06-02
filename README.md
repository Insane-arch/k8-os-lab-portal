# Kubernetes OS Lab Portal

This project demonstrates Operating System concepts using a multi-node Kubernetes cluster. It includes one control plane node and two worker nodes running on Ubuntu Server.

A custom full-stack web application was deployed on Kubernetes using Node.js, Express.js, MySQL, Docker, Services, Ingress, and Persistent Volumes. The application stores user messages in MySQL and keeps the data safe even after pod deletion or restart.

## Features

- Multi-node Kubernetes cluster
- Custom Node.js + MySQL web application
- Docker containerization
- Kubernetes Deployment and Service
- Persistent storage using PV/PVC
- Ingress access
- Self-healing and persistence testing
- Kubernetes Dashboard with RBAC

## Technologies

- Kubernetes
- Docker
- Node.js
- Express.js
- MySQL
- HTML, CSS, JavaScript
- Calico CNI
- NGINX Ingress Controller
- Ubuntu Server 24.04.4 LTS

## Cluster Nodes

| Node | Role |
|---|---|
| k8-master | Control Plane |
| k8-worker1 | Worker Node |
| k8-worker2 | Worker Node |

## Docker Image

```text
ghost1027/k8-os-lab-portal:v2
