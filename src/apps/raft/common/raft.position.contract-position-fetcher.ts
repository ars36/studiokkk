import { Inject } from '@nestjs/common';
import { BigNumberish } from 'ethers';

import { APP_TOOLKIT, IAppToolkit } from '~app-toolkit/app-toolkit.interface';
import { MetaType } from '~position/position.interface';
import { ContractPositionTemplatePositionFetcher } from '~position/template/contract-position.template.position-fetcher';
import {
  DefaultContractPositionDefinition,
  UnderlyingTokenDefinition,
} from '~position/template/contract-position.template.types';

import { RaftContractFactory, RaftPositionManager } from '../contracts';

export abstract class EthereumRaftContractPositionFetcher extends ContractPositionTemplatePositionFetcher<RaftPositionManager> {
  abstract collateral: string;
  abstract positionManagerAddress: string;

  constructor(
    @Inject(APP_TOOLKIT) protected readonly appToolkit: IAppToolkit,
    @Inject(RaftContractFactory) protected readonly raftContractFactory: RaftContractFactory,
  ) {
    super(appToolkit);
  }

  getContract(address: string): RaftPositionManager {
    return this.raftContractFactory.raftPositionManager({ address, network: this.network });
  }

  async getDefinitions(): Promise<DefaultContractPositionDefinition[]> {
    return [{ address: this.positionManagerAddress }];
  }

  async getTokenDefinitions({ contract }): Promise<UnderlyingTokenDefinition[]> {
    const { collateralToken, debtToken } = await contract.collateralInfo(this.collateral);
    return [
      {
        metaType: MetaType.SUPPLIED,
        address: collateralToken.toLowerCase(),
        network: this.network,
      },
      {
        metaType: MetaType.BORROWED,
        address: debtToken.toLowerCase(),
        network: this.network,
      },
    ];
  }

  async getLabel(): Promise<string> {
    const baseTokens = await this.appToolkit.getBaseTokenPrices(this.network);
    const tokenFound = baseTokens.find(p => p.address === this.collateral);
    return `${tokenFound?.symbol ?? 'Raft'} Loan`;
  }

  async getTokenBalancesPerPosition({ address, contractPosition }): Promise<BigNumberish[]> {
    const collateral = this.raftContractFactory.raftToken({
      address: contractPosition.tokens[0].address,
      network: this.network,
    });
    const debt = this.raftContractFactory.raftToken({
      address: contractPosition.tokens[1].address,
      network: this.network,
    });
    const balances = await Promise.all([collateral.balanceOf(address), debt.balanceOf(address)]);
    return balances;
  }
}
