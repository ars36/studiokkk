import { Module } from '@nestjs/common';

import { AbstractApp } from '~app/app.dynamic-module';

import { StakefishContractFactory } from './contracts';
import { EthereumStakefishStakingContractPositionFetcher } from './ethereum/stakefish.staking.contract-position-fetcher';
import { StakefishAppDefinition } from './stakefish.definition';

@Module({
  providers: [EthereumStakefishStakingContractPositionFetcher, StakefishAppDefinition, StakefishContractFactory],
})
export class StakefishAppModule extends AbstractApp() {}
