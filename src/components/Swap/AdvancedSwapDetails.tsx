import { Trade, TradeType } from '@onzechain/sdk';
import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Field } from 'state/swap/actions';
import { useUserSlippageTolerance } from 'state/user/hooks';
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
} from 'utils/prices';
import { QuestionHelper, FormattedPriceImpact, CurrencyLogo } from 'components';

const useStyles = makeStyles(({ palette }) => ({
  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '8px 24px 0',
    '& p': {
      color: '#b6b9cc',
    },
    '& > div': {
      display: 'flex',
      alignItems: 'center',
      '& > div': {
        marginLeft: 4,
      },
    },
  },
  analyticsWrapper: {
    border: `1px solid ${palette.divider}`,
    borderRadius: 12,
    padding: '8px 0',
    margin: '8px 0',
    '& a': {
      fontSize: 18,
      color: 'white',
      textDecoration: 'none',
    },
  },
  swapRoute: {
    margin: '8px 0',
    '& .header': {
      display: 'flex',
      alignItems: 'center',
      '& p': {
        fontSize: 16,
        lineHeight: '28px',
        marginRight: 4,
      },
    },
  },
}));

interface TradeSummaryProps {
  trade: Trade;
  allowedSlippage: number;
}

export const TradeSummary: React.FC<TradeSummaryProps> = ({
  trade,
  allowedSlippage,
}) => {
  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(
    trade,
  );
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT;
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(
    trade,
    allowedSlippage,
  );
  const classes = useStyles();

  return (
    <>
      <Box className={classes.summaryRow}>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2'>
            {isExactIn ? 'Minimum Received:' : 'Maximum sold:'}
          </Typography>
          <QuestionHelper text='Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.' />
        </Box>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2'>
            {isExactIn
              ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${
                  trade.outputAmount.currency.symbol
                }` ?? '-'
              : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${
                  trade.inputAmount.currency.symbol
                }` ?? '-'}
          </Typography>
          <Box
            width={16}
            height={16}
            ml={0.5}
            borderRadius={8}
            overflow='hidden'
          >
            {isExactIn ? (
              <CurrencyLogo
                currency={trade.outputAmount.currency}
                size='16px'
              />
            ) : (
              <CurrencyLogo currency={trade.inputAmount.currency} size='16px' />
            )}
          </Box>
        </Box>
      </Box>
      <Box className={classes.summaryRow}>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2'>Price Impact:</Typography>
          <QuestionHelper text='The difference between the market price and estimated price due to trade size.' />
        </Box>
        <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
      </Box>
      <Box className={classes.summaryRow}>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2'>Liquidity Provider Fee:</Typography>
          <QuestionHelper text='A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive.' />
        </Box>
        <Typography variant='body2'>
          {realizedLPFee
            ? `${realizedLPFee.toSignificant(4)} ${
                trade.inputAmount.currency.symbol
              }`
            : '-'}
        </Typography>
      </Box>
    </>
  );
};

export interface AdvancedSwapDetailsProps {
  trade?: Trade;
}

export const AdvancedSwapDetails: React.FC<AdvancedSwapDetailsProps> = ({
  trade,
}) => {
  const [allowedSlippage] = useUserSlippageTolerance();

  return (
    <Box>
      {trade && (
        <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
      )}
    </Box>
  );
};
