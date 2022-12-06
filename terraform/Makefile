# add backend config file to environment.
BACKEND_CONF_PATH=./configs/backend.conf
include $(BACKEND_CONF_PATH)
export $(shell sed 's/=.*//' $(BACKEND_CONF_PATH))

bucket=viewvo-terraform-states-$(ENV)
tfvars=env/$(ENV).tfvars

.SILENT: check-env
check-env:
	if [ -z "$(ENV)" ]; then \
		echo "\033[31mNo ENV variable is set\033[m"; \
		exit 1; \
	else \
		echo "\033[32mRunning on environment: $(ENV) \033[m"; \
	fi

.PHONY: validate
validate:
	terraform validate

.PHONY: plan
plan: check-env
	terraform plan \
	-var-file="$(tfvars)"

.PHONY: apply
apply: check-env
	terraform apply \
	-var-file="$(tfvars)"

.PHONY: destroy
destroy: check-env
	terraform destroy \
	-var-file="$(tfvars)"

.PHONY: create-bucket
create-bucket: check-env
	gcloud alpha storage buckets create gs://${bucket} --project=${project_id} --default-storage-class=STANDARD \
	--location=${bucket_location} --uniform-bucket-level-access || true

.PHONY: init-backend
init-backend: check-env
	terraform init -backend-config="bucket=${bucket}"

