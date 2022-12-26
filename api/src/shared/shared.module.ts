import { Global, Module } from '@nestjs/common';

// import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ApiConfigService } from './services/api-config.service';
import { K8sService } from './services/k8s.service';

const providers = [ApiConfigService, K8sService];

@Global()
@Module({
  providers,
  imports: [],
  exports: [...providers],
})
export class SharedModule {}
