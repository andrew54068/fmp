import { useState, useEffect } from "react";
import {
  getBurningInfoScript,
  getBurningScript,
  getPredictedStakingScript,
  getStakingInfoScript,
  getStakingScoreScript,
  getStakingScript,
} from "src/utils/getScripts";
import { sendScript } from "src/services/fcl/send-script";
import BigNumber from "bignumber.js";
import {
  Transaction,
  TransactionEvent,
  sendTransaction,
} from "src/services/fcl/send-transaction";

export type StakingInfo = {
  startTime: number;
  endTime: number;
  divisor: BigNumber;
};

export type BurningInfo = {
  startTime: number;
  endTime: number;
  divisor: BigNumber;
  currentIssued: BigNumber;
  totalSupply: BigNumber;
};

export default function useFomopolyContract() {

  const fetchPredictedScore = async (
    address: string,
    amount: number,
    endTime: number
  ): Promise<BigNumber> => {
    const predictedScore: string = await sendScript(
      getPredictedStakingScript(),
      (arg, t) => [
        arg(address, t.Address),
        arg(amount, t.Int),
        arg(endTime, t.UFix64),
      ]
    );
    return BigNumber(predictedScore);
  };

  const fetchCurrentScoreInfo = async (
    address: string,
    endTime: number
  ): Promise<BigNumber[]> => {
    const [totalScore, calculateScore] = (await sendScript(
      getStakingScoreScript(),
      (arg, t) => [arg(address, t.Address), arg(endTime, t.UFix64)]
    )) as string[];
    return [BigNumber(totalScore), BigNumber(calculateScore)];
  };

  const stakeInscription = async (
    amount: number
  ): Promise<Transaction<TransactionEvent<any>[]>> => {
    const txData = await sendTransaction(getStakingScript(), (arg, types) => [
      arg(amount, types.UInt64),
    ]);
    return txData;
  };

  const burnInscription = async (
    amount: number
  ): Promise<Transaction<TransactionEvent<any>[]>> => {
    const txData = await sendTransaction(getBurningScript(), (arg, types) => [
      arg(amount, types.UInt64),
    ]);
    return txData;
  };

  useEffect(() => {
    const fetchData = async () => {};
    fetchData();
  }, []);

  const fetchStakingInfo = async (): Promise<StakingInfo> => {
    const [stakingStartTime, stakingEndTime, stakingDivisor] =
      (await sendScript(getStakingInfoScript())) as string[];
    return {
      startTime: +stakingStartTime,
      endTime: +stakingEndTime,
      divisor: BigNumber(stakingDivisor),
    };
  };

  const fetchBurningInfo = async (): Promise<BurningInfo> => {
    const [
      burningStartTime,
      burningEndTime,
      divisor,
      currentIssued,
      totalSupply,
    ] = (await sendScript(getBurningInfoScript())) as string[];
    return {
      startTime: +burningStartTime,
      endTime: +burningEndTime,
      divisor: BigNumber(divisor),
      currentIssued: BigNumber(currentIssued),
      totalSupply: BigNumber(totalSupply),
    };
  };

  return {
    fetchStakingInfo,
    fetchBurningInfo,
    fetchCurrentScoreInfo,
    fetchPredictedScore,
    stakeInscription,
    burnInscription,
  };
}
