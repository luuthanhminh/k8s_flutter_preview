# Prerequisites

## Provision Nginx Ingress Controller

`First, needs to have cluster-admin permissions on the cluster.`

```sh
kubectl create clusterrolebinding cluster-admin-binding \
  --clusterrole cluster-admin \
  --user $(gcloud config get-value account)
```

`Then, create the ingress controller with internal load balancer`

```sh
cd nginx-ingress 
kubectl apply -f deploy.yaml
```

`Add forward-header into configmap`

```sh
kubectl patch configmap/ingress-nginx-controller \
  -n ingress-nginx \
  --type merge \
  -p '{"data":{"use-forwarded-headers":"true"}}'
```

## Install Cert Manager with GCA Issuer

## Deploy Jira Data Center

We are using helm chart to deploy Jira Data Center. The helm chart is available at `jiradc` folder.

Update the `values.yaml` before deploying the helm chart.

1. Configure `FileStore` for `shared-home` volume

```yaml
fileStore:
  ip: 10.9.231.74 # FileStore server IP
  path: /shared # FileStore server path
  storage: 50Gi # Shared home volume size
```

2. Configure Database credentials

```yaml
dbSecret:
  # Base64 encrypted data for the database credential
  username: cG9zdGdyZXM=
  password: YTRIbmRibXZDQXM2cUxVSA==
```

3. Configure Service Account which allow access to CloudSQL for Jira pod as we are using CloudSQL Proxy sidecar to connect the database.

```yaml
jira:
  ...
  serviceAccount:
    create: false
    name: atlas-dev-us-east1-jira-admin
```

4. Configure `ingress` with `cert-manager` annotations

```yaml
jira:
  ...
  ingress:
    create: true #1. Setting true here will create an Ingress resource
    nginx: true #2. If using the ingress-nginx controller set this property to true
    maxBodySize: 250m
    host: jiradc.agileops.dev #2. Hosts can be precise matches (for example “foo.bar.com”) or a wildcard (for example “*.foo.com”).
    path: "/"
    annotations:
      cert-manager.io/cluster-issuer: letsencrypt-prod
    https: true
    tlsSecretName: jiradc.agileops.dev
```

5. Configure database connection

```yaml
jira:
  ...
  database: 
    type: postgres72
    url: jdbc:postgresql://localhost:5432/jira
    driver: org.postgresql.Driver
    credentials:
      secretName: jira-db
      usernameSecretKey: username
      passwordSecretKey: password
```

6. Configure volume for `shared-home` and `local-home`

```yaml
jira:
  ...
  volumes:
    localHome:
      persistentVolumeClaim:
        create: true
        storageClassName: standard-rwo
        resources:
          requests:
            storage: 1Gi
        mountPath: "/var/atlassian/application-data/jira"
    sharedHome:
      persistentVolumeClaim:
        create: false
      customVolume:
        persistentVolumeClaim:
          claimName: "jira-shared-pvc"
      mountPath: "/var/atlassian/application-data/shared-home"
```

7. Configure `jira` pod

```yaml
jira:
  ...
  jira:
    clustering:
      enabled: true
    resources:
      jvm:
        maxHeap: "2G"
        minHeap: "384m"
        reservedCodeCache: "512m"
      container:
        requests:
          cpu: "2000m"
          memory: "4G"
  additionalContainers:
    - name: cloud-sql-proxy
      image: gcr.io/cloudsql-docker/gce-proxy:1.28.0
      command:
        - "/cloud_sql_proxy"
        - "-log_debug_stdout"
        - "-instances=shared-services-fedramp-prod:us-east1:atlas-dev-us-east1-pg-9dc80e7c=tcp:5432"
      securityContext:
        runAsNonRoot: true
      resources:
        requests:
          memory: "2Gi"
          cpu: "1000m"
```