import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { promisify } from 'util';
import { ProjectDto } from '../../modules/projects/dto/project.dto';
import { ApiConfigService } from './api-config.service';

@Injectable()
export class K8sService {
  constructor(private apiConfigService: ApiConfigService) {}
  private kc: k8s.KubeConfig | undefined;

  readonly ingressTemplateYaml = path.join(
    __dirname,
    '../../resources/ingress.yaml',
  );
  readonly serviceTemplateYaml = path.join(
    __dirname,
    '../../resources/service.yaml',
  );
  readonly deploymentTemplateYaml = path.join(
    __dirname,
    '../../resources/deployment.yaml',
  );

  getKubeConfig(): k8s.KubeConfig {
    if (this.kc) {
      return this.kc;
    }

    this.kc = new k8s.KubeConfig();
    this.kc.loadFromDefault();

    return this.kc;
  }

  async getDeployments(): Promise<{ id: string }[]> {
    const client = this.getKubeConfig().makeApiClient(k8s.AppsV1Api);
    const deployments = await client.listNamespacedDeployment(
      this.apiConfigService.namespace,
    );
    return deployments.body.items
      .filter((item) => {
        return item.metadata?.labels?.app;
      })
      .map((item) => ({
        id: item.metadata?.labels?.app ?? '',
      }));
  }

  replaceAll(input: string, oldChar: string, newChar) {
    const search = `${oldChar}`;
    const replacer = new RegExp(search, 'g');
    return input.replace(replacer, newChar);
  }

  async deployProject(projectDto: ProjectDto): Promise<void> {
    const fsReadFileP = promisify(fs.readFile);
    let deployment = await fsReadFileP(this.deploymentTemplateYaml, 'utf8');
    const podId = projectDto.id;
    const bucketName = projectDto.bucketName;
    const domain = projectDto.domain.toLowerCase();
    const nameSpace = this.apiConfigService.namespace;
    deployment = this.replaceAll(deployment, '__PODNAME__', podId);
    deployment = this.replaceAll(deployment, '__PODID__', podId);
    deployment = this.replaceAll(deployment, '__BUCKETNAME__', bucketName);
    deployment = this.replaceAll(deployment, '__NAMESPACE__', nameSpace);

    let ingress = await fsReadFileP(this.ingressTemplateYaml, 'utf8');
    ingress = this.replaceAll(ingress, '__DOMAIN__', domain);
    ingress = this.replaceAll(ingress, '__NAMESPACE__', nameSpace);
    ingress = this.replaceAll(ingress, '__INGNAME__', `ing-${podId}`);
    ingress = this.replaceAll(ingress, '__SVCNAME__', `svc-${podId}`);
    ingress = this.replaceAll(ingress, '__PODID__', podId);

    let service = await fsReadFileP(this.serviceTemplateYaml, 'utf8');
    service = this.replaceAll(service, '__PODID__', podId);
    service = this.replaceAll(service, '__SVCNAME__', `svc-${podId}`);
    service = this.replaceAll(service, '__NAMESPACE__', nameSpace);
    console.log(deployment);
    const tasks = [deployment, service, ingress].map((spec) =>
      this.apply(spec),
    );
    await Promise.all(tasks);
  }

  async unDeployProject(projectDto: ProjectDto): Promise<void> {
    const fsReadFileP = promisify(fs.readFile);
    let deployment = await fsReadFileP(this.deploymentTemplateYaml, 'utf8');
    const podId = projectDto.id;
    const bucketName = projectDto.bucketName;
    const domain = projectDto.domain.toLowerCase();
    const nameSpace = this.apiConfigService.namespace;
    deployment = this.replaceAll(deployment, '__PODNAME__', podId);
    deployment = this.replaceAll(deployment, '__PODID__', podId);
    deployment = this.replaceAll(deployment, '__BUCKETNAME__', bucketName);
    deployment = this.replaceAll(deployment, '__NAMESPACE__', nameSpace);

    let ingress = await fsReadFileP(this.ingressTemplateYaml, 'utf8');
    ingress = this.replaceAll(ingress, '__DOMAIN__', domain);
    ingress = this.replaceAll(ingress, '__NAMESPACE__', nameSpace);
    ingress = this.replaceAll(ingress, '__INGNAME__', `ing-${podId}`);
    ingress = this.replaceAll(ingress, '__SVCNAME__', `svc-${podId}`);
    ingress = this.replaceAll(ingress, '__PODID__', podId);

    let service = await fsReadFileP(this.serviceTemplateYaml, 'utf8');
    service = this.replaceAll(service, '__PODID__', podId);
    service = this.replaceAll(service, '__SVCNAME__', `svc-${podId}`);
    service = this.replaceAll(service, '__NAMESPACE__', nameSpace);

    const tasks = [deployment, service, ingress].map((spec) =>
      this.delete(spec),
    );
    await Promise.all(tasks);
  }
  async createDeployment(k8Yaml: string): Promise<boolean> {
    const client = this.getKubeConfig().makeApiClient(k8s.AppsV1Api);

    const deployment = yaml.load(k8Yaml) as k8s.V1Deployment;

    if (!deployment.metadata?.namespace) {
      throw new Error('Invalid namespace in');
    }

    try {
      await client.createNamespacedDeployment(
        deployment.metadata.namespace,
        deployment,
      );
      return true;
    } catch (e) {
      console.error(e); // pass exception object to error handler
    }
    return false;
  }

  async createIngress(k8Yaml: string): Promise<boolean> {
    const client = this.getKubeConfig().makeApiClient(k8s.NetworkingV1Api);

    const ingress = yaml.load(k8Yaml) as k8s.V1Ingress;

    if (!ingress.metadata?.namespace) {
      throw new Error('Invalid namespace in');
    }

    try {
      await client.createNamespacedIngress(ingress.metadata.namespace, ingress);
      return true;
    } catch (e) {
      console.error(e); // pass exception object to error handler
    }
    return false;
  }

  async createService(k8Yaml: string): Promise<boolean> {
    const client = this.getKubeConfig().makeApiClient(k8s.CoreV1Api);

    const svc = yaml.load(k8Yaml) as k8s.V1Service;

    if (!svc.metadata?.namespace) {
      throw new Error('Invalid namespace in');
    }

    try {
      await client.createNamespacedService(svc.metadata.namespace, svc);
      return true;
    } catch (e) {
      console.error(e); // pass exception object to error handler
    }
    return false;
  }

  async apply(k8Yaml: string): Promise<k8s.KubernetesObject[]> {
    const client = k8s.KubernetesObjectApi.makeApiClient(this.getKubeConfig());
    const specs: k8s.KubernetesObject[] = yaml.loadAll(
      k8Yaml,
    ) as k8s.KubernetesObject[];
    const validSpecs = specs.filter((s) => s && s.kind && s.metadata);
    const created: k8s.KubernetesObject[] = [];
    for (const spec of validSpecs) {
      // this is to convince the old version of TypeScript that metadata exists even though we already filtered specs
      // without metadata out
      spec.metadata = spec.metadata || {};
      spec.metadata.annotations = spec.metadata.annotations || {};
      delete spec.metadata.annotations[
        'kubectl.kubernetes.io/last-applied-configuration'
      ];
      spec.metadata.annotations[
        'kubectl.kubernetes.io/last-applied-configuration'
      ] = JSON.stringify(spec);
      try {
        // try to get the resource, if it does not exist an error will be thrown and we will end up in the catch
        // block.
        await client.read(spec);
        // we got the resource, so it exists, so patch it
        //
        // Note that this could fail if the spec refers to a custom resource. For custom resources you may need
        // to specify a different patch merge strategy in the content-type header.
        //
        // See: https://github.com/kubernetes/kubernetes/issues/97423
        const response = await client.patch(spec);
        created.push(response.body);
      } catch (e) {
        // we did not get the resource, so it does not exist, so create it
        const response = await client.create(spec);
        created.push(response.body);
      }
    }
    return created;
  }

  async delete(k8Yaml: string): Promise<boolean> {
    const client = k8s.KubernetesObjectApi.makeApiClient(this.getKubeConfig());
    const specs: k8s.KubernetesObject[] = yaml.loadAll(
      k8Yaml,
    ) as k8s.KubernetesObject[];
    const validSpecs = specs.filter((s) => s && s.kind && s.metadata);
    for (const spec of validSpecs) {
      // this is to convince the old version of TypeScript that metadata exists even though we already filtered specs
      // without metadata out
      spec.metadata = spec.metadata || {};
      spec.metadata.annotations = spec.metadata.annotations || {};
      delete spec.metadata.annotations[
        'kubectl.kubernetes.io/last-applied-configuration'
      ];
      spec.metadata.annotations[
        'kubectl.kubernetes.io/last-applied-configuration'
      ] = JSON.stringify(spec);
      try {
        // try to get the resource, if it does not exist an error will be thrown and we will end up in the catch
        // block.
        await client.read(spec);
        // we got the resource, so it exists, so patch it
        //
        // Note that this could fail if the spec refers to a custom resource. For custom resources you may need
        // to specify a different patch merge strategy in the content-type header.
        //
        // See: https://github.com/kubernetes/kubernetes/issues/97423
        await client.delete(spec);
        return true;
      } catch (e) {
        // we did not get the resource, so it does not exist, so create it
        console.log(e);
      }
    }
    return false;
  }
}
