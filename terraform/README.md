# GKE Infrastructure
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.1.12 |
| <a name="requirement_google"></a> [helm](#requirement\_google) | >= 4.0 |
| <a name="requirement_kubernetes"></a> [kubernetes](#requirement\_kubernetes) | >= 2.7.1 |


### Prerequisites

Make sure you have installed all of the following prerequisites on your development machine:

- [gcloud CLI](https://cloud.google.com/sdk/docs/install) 
- [Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli)
### Installation

Below is an example of how you can instruct your audience on installing and setting up your app.

- Starting by installing the Terraform provider (only need to run this once). [Terraform GCS backend](https://www.terraform.io/language/settings/backends/gcs)
    ```bash
    $ make create-bucket ENV=dev
    $ make init-backend ENV=dev
    ```
- Configure variables for your environment. [Terraform variables](https://www.terraform.io/language/values/variables)
    ```bash
    $ cd env
    $ cp terraform.tfvars.example dev.tfvars
    ```
- Validating the configuration files in a directory, referring only to the configuration and not accessing any remote services such as remote state, provider APIs
    ```bash
    $ make validate
    ```

- Creating an execution plan, which lets you preview the changes that Terraform plans to make to your infrastructure.
    ```base
    $ make plan ENV=dev
    ```

- Executing the actions proposed in a Terraform plan.
    ```base
    $ make apply ENV=dev
    ```

- Destroying all remote objects managed by a particular Terraform configuration.
    ```base
    $ make destroy ENV=dev
    ```


