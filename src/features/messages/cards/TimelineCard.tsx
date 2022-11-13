import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import Image from 'next/future/image';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

import { ChainName, chainMetadata } from '@hyperlane-xyz/sdk';

import { WideChevronIcon } from '../../../components/icons/WideChevron';
import { Card } from '../../../components/layout/Card';
import { chainIdToBlockTime, chainIdToName } from '../../../consts/chains';
import EnvelopeIcon from '../../../images/icons/envelope-check.svg';
import LockIcon from '../../../images/icons/lock.svg';
import AirplaneIcon from '../../../images/icons/paper-airplane.svg';
import ShieldIcon from '../../../images/icons/shield-check.svg';
import { Message, MessageStatus } from '../../../types';
import { queryExplorerForBlock } from '../../../utils/explorers';
import { logger } from '../../../utils/logger';
import { fetchWithTimeout } from '../../../utils/timeout';

const VALIDATION_TIME_EST = 5;

enum Stage {
  Sent = 0,
  Finalized = 1,
  Validated = 2,
  Relayed = 3,
}

interface Props {
  message: Message;
  resolvedStatus: MessageStatus;
  shouldBlur: boolean;
}

export function TimelineCard({ message, resolvedStatus: status }: Props) {
  const {
    originChainId,
    destinationChainId,
    originTimestamp,
    destinationTimestamp,
    leafIndex,
    originTransaction,
  } = message;

  const { stage, timings } = useMessageStage(
    status,
    originChainId,
    destinationChainId,
    leafIndex,
    originTransaction.blockNumber,
    originTimestamp,
    destinationTimestamp,
  );

  const timeSent = new Date(originTimestamp);

  return (
    <Card width="w-full">
      {/* <div className="flex items-center justify-end">
        <h3 className="text-gray-500 font-medium text-md mr-2">Delivery Timeline</h3>
        <HelpIcon size={16} text="A breakdown of the stages for delivering a message" />
      </div> */}
      <div className="px-2 pt-14 pb-1 flex">
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full h-6 flex items-center justify-center bg-blue-500 rounded-l relative">
            <div className="w-3 h-3 rounded-full bg-white"></div>
            <div className="absolute -top-12 flex flex-col items-center">
              <StageIcon src={AirplaneIcon} />
              <div className="w-0.5 h-4 bg-blue-500"></div>
            </div>
            <div className="absolute -right-3 top-0 h-6">
              <WideChevronIcon direction="e" height="100%" width="auto" />
            </div>
          </div>
          <h4 className="mt-2.5 text-gray-700">Message sent</h4>
          <p className="mt-1 px-2 text-xs text-gray-500 text-center">{`Origin transaction sent at ${timeSent.toLocaleDateString()} ${timeSent.toLocaleTimeString()}`}</p>
        </div>
        <div className="flex-0 w-5"></div>
        <div className="flex-1 flex flex-col items-center">
          <div
            className={`w-full h-6 flex items-center justify-center bg-blue-500 relative ${getStageClass(
              Stage.Finalized,
              stage,
              status,
            )}`}
          >
            <div className="w-3 h-3 rounded-full bg-white"></div>
            <div className="absolute -top-12 flex flex-col items-center">
              <StageIcon src={LockIcon} size={12} />
              <div className="w-0.5 h-4 bg-blue-500"></div>
            </div>
            <div className="absolute -left-3 top-0 h-6">
              <WideChevronIcon direction="e" height="100%" width="auto" color="#ffffff" />
            </div>
            <div className="absolute -right-3 top-0 h-6">
              <WideChevronIcon direction="e" height="100%" width="auto" />
            </div>
          </div>
          <h4 className="mt-2.5 text-gray-700">
            {getStageHeader(Stage.Finalized, stage, timings, status)}
          </h4>
          <p className="mt-1 px-2 text-xs text-gray-500 text-center">{`Origin transaction has sufficient confirmations`}</p>
        </div>
        <div className="flex-0 w-5"></div>
        <div className="flex-1 flex flex-col items-center">
          <div
            className={`w-full h-6 flex items-center justify-center bg-blue-500 relative ${getStageClass(
              Stage.Validated,
              stage,
              status,
            )}`}
          >
            <div className="w-3 h-3 rounded-full bg-white"></div>
            <div className="absolute -top-12 flex flex-col items-center">
              <StageIcon src={ShieldIcon} />
              <div className="w-0.5 h-4 bg-blue-500"></div>
            </div>
            <div className="absolute -left-3 top-0 h-6">
              <WideChevronIcon direction="e" height="100%" width="auto" color="#ffffff" />
            </div>
            <div className="absolute -right-3 top-0 h-6">
              <WideChevronIcon direction="e" height="100%" width="auto" />
            </div>
          </div>
          <h4 className="mt-2.5 text-gray-700">
            {getStageHeader(Stage.Validated, stage, timings, status)}
          </h4>
          <p className="mt-1 px-2 text-xs text-gray-500 text-center">{`Validators have signed the message bundle`}</p>
        </div>
        <div className="flex-0 w-5"></div>
        <div className="flex-1 flex flex-col items-center">
          <div
            className={`w-full h-6 flex items-center justify-center bg-blue-500 rounded-r relative ${getStageClass(
              Stage.Relayed,
              stage,
              status,
            )}`}
          >
            <div className="w-3 h-3 rounded-full bg-white"></div>
            <div className="absolute -top-12 flex flex-col items-center">
              <StageIcon src={EnvelopeIcon} />
              <div className="w-0.5 h-4 bg-blue-500"></div>
            </div>
            <div className="absolute -left-3 top-0 h-6">
              <WideChevronIcon direction="e" height="100%" width="auto" color="#ffffff" />
            </div>
          </div>
          <h4 className="mt-2.5 text-gray-700">
            {getStageHeader(Stage.Relayed, stage, timings, status)}
          </h4>
          <p className="mt-1 px-2 text-xs text-gray-500 text-center">{`Destination transaction has been confirmed`}</p>
        </div>
      </div>
    </Card>
  );
}

function StageIcon({ src, size }: { src: any; size?: number }) {
  return (
    <div className="h-9 w-9 flex items-center justify-center rounded-full bg-blue-500">
      <Image src={src} width={size ?? 14} height={size ?? 14} alt="" />
    </div>
  );
}

function getStageHeader(
  targetStage: Stage,
  currentStage: Stage,
  timings: Partial<Record<Stage, string>>,
  status: MessageStatus,
) {
  let label = '';
  if (targetStage === Stage.Finalized) {
    label = currentStage >= targetStage ? 'Finalized' : 'Finalizing';
  } else if (targetStage === Stage.Validated) {
    label = currentStage >= targetStage ? 'Validated' : 'Validating';
  } else if (targetStage === Stage.Relayed) {
    label = currentStage >= targetStage ? 'Relayed' : 'Relaying';
  }
  const timing = timings[targetStage];
  if (status === MessageStatus.Failing) {
    if (targetStage === currentStage + 1) return `${label}: failed`;
    if (targetStage > currentStage + 1) return label;
  }
  if (timing) return `${label}: ${timing}`;
  else return label;
}

function getStageClass(targetStage: Stage, currentStage: Stage, messageStatus: MessageStatus) {
  if (currentStage >= targetStage) return '';
  if (currentStage === targetStage - 1 && messageStatus !== MessageStatus.Failing)
    return 'animate-pulse-slow';
  return 'opacity-50';
}

function useMessageStage(
  status: MessageStatus,
  originChainId: number,
  destChainId: number,
  leafIndex: number,
  originBlockNumber: number,
  originTimestamp: number,
  destinationTimestamp?: number,
) {
  const { data, isFetching, error } = useQuery(
    [
      'messageStage',
      status,
      originChainId,
      destChainId,
      originTimestamp,
      destinationTimestamp,
      leafIndex,
      originBlockNumber,
    ],
    async () => {
      if (!originChainId || !destChainId || !leafIndex || !originTimestamp || !originBlockNumber) {
        return null;
      }

      const relayEstimate = Math.floor(chainIdToBlockTime[destChainId] * 1.5);
      const finalityBlocks = getFinalityBlocks(originChainId);
      const finalityEstimate = finalityBlocks * (chainIdToBlockTime[originChainId] || 3);

      if (status === MessageStatus.Delivered && destinationTimestamp) {
        // For delivered messages, just to rough estimates for stages
        // This saves us from making extra explorer calls. May want to revisit in future

        const totalDuration = Math.round((destinationTimestamp - originTimestamp) / 1000);
        const finalityDuration = Math.max(
          Math.min(finalityEstimate, totalDuration - VALIDATION_TIME_EST),
          1,
        );
        const remaining = totalDuration - finalityDuration;
        const validateDuration = Math.min(Math.round(remaining * 0.25), VALIDATION_TIME_EST);
        const relayDuration = remaining - validateDuration;
        return {
          stage: Stage.Relayed,
          timings: {
            [Stage.Finalized]: `${finalityDuration} sec`,
            [Stage.Validated]: `${validateDuration} sec`,
            [Stage.Relayed]: `${relayDuration} sec`,
          },
        };
      }

      const latestLeafIndex = await tryFetchLatestLeafIndex(originChainId);
      if (latestLeafIndex && latestLeafIndex >= leafIndex) {
        return {
          stage: Stage.Validated,
          timings: {
            [Stage.Finalized]: `${finalityEstimate} sec`,
            [Stage.Validated]: `${VALIDATION_TIME_EST} sec`,
            [Stage.Relayed]: `~${relayEstimate} sec`,
          },
        };
      }

      const latestBlock = await tryFetchChainLatestBlock(originChainId);
      const finalizedBlock = originBlockNumber + finalityBlocks;
      if (latestBlock && BigNumber.from(latestBlock.number).gte(finalizedBlock)) {
        return {
          stage: Stage.Finalized,
          timings: {
            [Stage.Finalized]: `${finalityEstimate} sec`,
            [Stage.Validated]: `~${VALIDATION_TIME_EST} sec`,
            [Stage.Relayed]: `~${relayEstimate} sec`,
          },
        };
      }

      return {
        stage: Stage.Sent,
        timings: {
          [Stage.Finalized]: `~${finalityEstimate} sec`,
          [Stage.Validated]: `~${VALIDATION_TIME_EST} sec`,
          [Stage.Relayed]: `~${relayEstimate} sec`,
        },
      };
    },
  );

  // Show toast on error
  useEffect(() => {
    if (error) {
      logger.error('Error fetching message stage', error);
      toast.warn(`Error building timeline: ${error}`);
    }
  }, [error]);

  return {
    stage: data?.stage || Stage.Sent,
    timings: data?.timings || {},
    isFetching,
  };
}

function getFinalityBlocks(chainId: number) {
  const chainName = chainIdToName[chainId] as ChainName;
  const metadata = chainMetadata[chainName];
  const finalityBlocks = metadata?.finalityBlocks || 0;
  return Math.max(finalityBlocks, 1);
}

async function tryFetchChainLatestBlock(chainId: number) {
  logger.debug(`Attempting to fetch latest block for:`, chainId);
  try {
    // TODO do on backend and use API key
    const block = await queryExplorerForBlock(chainId, 'latest', false);
    return block;
  } catch (error) {
    logger.error('Error fetching latest block', error);
    return null;
  }
}

async function tryFetchLatestLeafIndex(chainId: number) {
  logger.debug(`Attempting to fetch leaf index for:`, chainId);
  try {
    const response = await fetchWithTimeout(
      '/api/latest-leaf-index',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chainId }),
      },
      3000,
    );
    const result = await response.json();
    logger.debug(`Found leaf index:`, result.leafIndex);
    return result.leafIndex;
  } catch (error) {
    logger.error('Error fetching leaf index', error);
    return null;
  }
}
