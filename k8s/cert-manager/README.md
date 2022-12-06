# cert-manager.io

## Installation

By default, cert-manager will be installed into the cert-manager namespace. It is possible to run cert-manager in a different namespace, although you'll need to make modifications to the deployment manifests.

```sh
helm repo add jetstack https://charts.jetstack.io

helm repo update

helm install cert-manager jetstack/cert-manager --version 1.8.0 \
--namespace cert-manager --create-namespace \
--set installCRDs=true \
--set global.leaderElection.namespace=cert-manager
```

## Verifying the Installation

First, make sure that [cmctl is installed.](https://cert-manager.io/docs/usage/cmctl/#installation)

```sh
$ cmctl check api
The cert-manager API is ready
```

## Google Issuer

https://github.com/jetstack/google-cas-issuer

### Create a ca pool containing a certificate authority in current Google project

```sh
gcloud privateca pools create my-pool --location us-east1
gcloud privateca roots create my-ca --pool my-pool --key-algorithm "ec-p384-sha384" --subject="CN=my-root,O=my-ca,OU=my-ou" --max-chain-length=2 --location us-east1
```

### Install Google CAS Issuer

```sh
kubectl apply -f https://github.com/jetstack/google-cas-issuer/releases/download/v0.5.2/google-cas-issuer-v0.5.2.yaml
```

### Setting up Google Cloud IAM

Firstly, create a Google Cloud IAM service account. This service account will be used by the CAS Issuer to access the Google Cloud CAS APIs.

```sh
gcloud iam service-accounts create sa-google-cas-issuer
```

Apply the appropriate IAM bindings to this account. This example permits the least privilege, to create certificates (ie roles/privateca.certificates.create) from a specified CA pool (my-pool), but you can use other roles as necessary (see Predefined Roles for more details).

```sh
gcloud privateca pools add-iam-policy-binding atlas-pool --role=roles/privateca.certificateRequester --member="serviceAccount:sa-google-cas-issuer@$(gcloud config get-value project | tr ':' '/').iam.gserviceaccount.com" --location=us-east1
```

Bind the Kubernetes service account (sa-google-cas-issuer) to the Google Cloud service account:

```sh
export PROJECT=$(gcloud config get-value project | tr ':' '/')

gcloud iam service-accounts add-iam-policy-binding \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:$PROJECT.svc.id.goog[cert-manager/ksa-google-cas-issuer]" \
  sa-google-cas-issuer@$PROJECT.iam.gserviceaccount.com

kubectl annotate serviceaccount \
  --namespace cert-manager \
  ksa-google-cas-issuer \
  iam.gke.io/gcp-service-account=sa-google-cas-issuer@$PROJECT.iam.gserviceaccount.com \
  --overwrite=true
```
