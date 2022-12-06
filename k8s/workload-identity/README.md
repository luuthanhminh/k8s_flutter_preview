# Workload Identity

## Create workload identity to access Cloud SQL

Firstly, create a Google Cloud IAM service account. This service account will be used by the Pod to access the Google Cloud SQL.

```sh
gcloud iam service-accounts create sa-atlas-admin \
  --display-name "Atlas Admin"
```

Apply the appropriate IAM bindings to this account.

```sh
export PROJECT=$(gcloud config get-value project | tr ':' '/')

gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:sa-atlas-admin@$PROJECT.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"
```

Bind the Kubernetes service account (sa-atlas-admin) to the Google Cloud service account:

```sh
export PROJECT=$(gcloud config get-value project | tr ':' '/')


gcloud iam service-accounts add-iam-policy-binding \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:$PROJECT.svc.id.goog[YOUR-K8S-NAMESPACE/YOUR-KSA-NAME]" \
  sa-atlas-admin@$PROJECT.iam.gserviceaccount.com

kubectl annotate serviceaccount \
  --namespace YOUR-K8S-NAMESPACE \
  YOUR-KSA-NAME \
  iam.gke.io/gcp-service-account=sa-atlas-admin@$PROJECT.iam.gserviceaccount.com \
  --overwrite=true
```