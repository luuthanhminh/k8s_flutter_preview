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
  private core1Api: k8s.CoreV1Api | undefined;

  readonly ingressTemplateYaml = path.join(
    __dirname,
    '../../resources/ingress.yaml',
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
  getCoresV1Api(): k8s.CoreV1Api {
    if (this.core1Api) {
      return this.core1Api;
    }

    this.core1Api = this.getKubeConfig().makeApiClient(k8s.CoreV1Api);

    return this.core1Api;
  }

  async getPods(): Promise<k8s.V1PodList> {
    const core1Api = this.getCoresV1Api();
    const pods = await core1Api.listNamespacedPod('preview');

    return pods.body;
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
    const domain = projectDto.domain;
    const nameSpace = this.apiConfigService.namespace;
    deployment = this.replaceAll(deployment, '__PODNAME__', podId);
    deployment = this.replaceAll(deployment, '__PODID__', podId);
    deployment = this.replaceAll(deployment, '__BUCKETNAME__', bucketName);
    deployment = this.replaceAll(deployment, '__NAMESPACE__', nameSpace);

    let ingress = await fsReadFileP(this.ingressTemplateYaml, 'utf8');
    ingress = this.replaceAll(ingress, '__PODID__', podId);
    ingress = this.replaceAll(ingress, '__DOMAIN__', domain);
    ingress = this.replaceAll(ingress, '__NAMESPACE__', nameSpace);

    console.log(deployment);

    console.log(ingress);

    const tasks = [deployment].map((spec) => this.apply(spec));
    await Promise.all(tasks);
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
        await client.read({
          ...spec,
          apiVersion: spec.apiVersion,
          kind: spec.kind,
          metadata: {
            name: spec.metadata.name ?? '',
            namespace: spec.metadata.namespace ?? '',
          },
        });
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
}
