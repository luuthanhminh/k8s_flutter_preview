# Nginx Ingress on GKE
https://kubernetes.github.io/ingress-nginx/deploy/#gce-gke

## Deploy


First, your user needs to have cluster-admin permissions on the cluster. This can be done with the following command:

```sh
kubectl create clusterrolebinding cluster-admin-binding \
  --clusterrole cluster-admin \
  --user $(gcloud config get-value account)
```

Then, the ingress controller can be installed like this:

```sh
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.4.0/deploy/static/provider/cloud/deploy.yaml
```

**Warning**
```
For private clusters, you will need to either add a firewall rule that allows master nodes access to port 8443/tcp on worker nodes, or change the existing rule that allows access to port 80/tcp, 443/tcp and 10254/tcp to also allow access to port 8443/tcp
Reference: https://cloud.google.com/kubernetes-engine/docs/how-to/private-clusters#add_firewall_rules
```

```sh
gcloud compute firewall-rules create gke-atlas-test-us-east1-cluster-nginx-ingress \
    --action ALLOW \
    --direction INGRESS \
    --source-ranges 172.20.48.0/28 \
    --rules tcp:8443 \
    --network atlas-test-us-east1 \
    --target-tags gke-atlas-test-us-east1-cluster-e751d86a-node
```

## Add forward-header into configmap

```sh
kubectl patch configmap/ingress-nginx-controller \
  -n ingress-nginx \
  --type merge \
  -p '{"data":{"use-forwarded-headers":"true"}}'
```