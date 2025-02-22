import { Inject } from '@nestjs/common';

import { APP_TOOLKIT, IAppToolkit } from '~app-toolkit/app-toolkit.interface';
import { PositionTemplate } from '~app-toolkit/decorators/position-template.decorator';
import { GetTokenBalancesParams, GetTokenDefinitionsParams } from '~position/template/contract-position.template.types';
import { VotingEscrowTemplateContractPositionFetcher } from '~position/template/voting-escrow.template.contract-position-fetcher';

import { StakeDaoContractFactory, StakeDaoVotingEscrow } from '../contracts';

@PositionTemplate()
export class EthereumStakeDaoEscrowedQiContractPositionFetcher extends VotingEscrowTemplateContractPositionFetcher<StakeDaoVotingEscrow> {
  groupLabel = 'Escrowed SDT';
  veTokenAddress = '0x0c30476f66034e11782938df8e4384970b6c9e8a';

  constructor(
    @Inject(APP_TOOLKIT) protected readonly appToolkit: IAppToolkit,
    @Inject(StakeDaoContractFactory) protected readonly contractFactory: StakeDaoContractFactory,
  ) {
    super(appToolkit);
  }

  getEscrowContract(address: string): StakeDaoVotingEscrow {
    return this.contractFactory.stakeDaoVotingEscrow({ address, network: this.network });
  }

  async getEscrowedTokenAddress({ contract }: GetTokenDefinitionsParams<StakeDaoVotingEscrow>) {
    return contract.token();
  }

  async getEscrowedTokenBalance({ address, contract }: GetTokenBalancesParams<StakeDaoVotingEscrow>) {
    return contract.locked(address).then(v => v.amount);
  }
}
