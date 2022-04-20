import React, { useState, useEffect, useCallback } from 'react';
import { Currency, TokenAmount, ETHER, JSBI } from '@onzechain/sdk';
import { ArrowLeft, Plus } from 'react-feather';
import { Box, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  CustomModal,
  CurrencyLogo,
  CurrencySearchModal,
  MinimalPositionCard,
} from 'components';
import { useTokenBalance } from 'state/wallet/hooks';
import { usePair, PairState } from 'data/Reserves';
import { usePairAdder } from 'state/user/hooks';
import { useActiveWeb3React } from 'hooks';
import { currencyId } from 'utils';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(({ palette }) => ({
  borderedCard: {
    border: `1px solid ${palette.divider}`,
    padding: 8,
    borderRadius: 10,
    cursor: 'pointer',
    '&:hover': {
      border: `1px solid ${palette.text.primary}`,
    },
  },
}));

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1,
}

interface PoolFinderModalProps {
  open: boolean;
  onClose: () => void;
}

const PoolFinderModal: React.FC<PoolFinderModalProps> = ({ open, onClose }) => {
  const classes = useStyles();
  const { palette } = useTheme();

  const { account } = useActiveWeb3React();

  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1);

  const [currency0, setCurrency0] = useState<Currency | null>(ETHER);
  const [currency1, setCurrency1] = useState<Currency | null>(null);

  const [pairState, pair] = usePair(
    currency0 ?? undefined,
    currency1 ?? undefined,
  );
  const addPair = usePairAdder();
  useEffect(() => {
    if (pair) {
      addPair(pair);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair?.liquidityToken.address, addPair]);

  const validPairNoLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean(
      pairState === PairState.EXISTS &&
        pair &&
        JSBI.equal(pair.reserve0.raw, JSBI.BigInt(0)) &&
        JSBI.equal(pair.reserve1.raw, JSBI.BigInt(0)),
    );

  const position: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    pair?.liquidityToken,
  );
  const hasPosition = Boolean(
    position && JSBI.greaterThan(position.raw, JSBI.BigInt(0)),
  );

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (activeField === Fields.TOKEN0) {
        setCurrency0(currency);
      } else {
        setCurrency1(currency);
      }
    },
    [activeField],
  );

  const handleSearchDismiss = useCallback(() => {
    setShowSearch(false);
  }, [setShowSearch]);

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box paddingX={3} paddingY={4}>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <ArrowLeft
            color={palette.text.secondary}
            style={{ cursor: 'pointer' }}
            onClick={onClose}
          />
          <Typography
            variant='subtitle2'
            style={{ color: palette.text.primary }}
          >
            Import Pool
          </Typography>
          <CloseIcon style={{ cursor: 'pointer' }} onClick={onClose} />
        </Box>
        <Box
          mt={2}
          className={classes.borderedCard}
          onClick={() => {
            setShowSearch(true);
            setActiveField(Fields.TOKEN0);
          }}
        >
          {currency0 ? (
            <Box display='flex' alignItems='center'>
              <CurrencyLogo currency={currency0} size='20px' />
              <Typography variant='h6' style={{ marginLeft: 6 }}>
                {currency0.symbol}
              </Typography>
            </Box>
          ) : (
            <Typography variant='h6'>Select a Token</Typography>
          )}
        </Box>
        <Box my={1} display='flex' justifyContent='center'>
          <Plus size='20' color={palette.text.secondary} />
        </Box>
        <Box
          className={classes.borderedCard}
          onClick={() => {
            setShowSearch(true);
            setActiveField(Fields.TOKEN1);
          }}
        >
          {currency1 ? (
            <Box display='flex'>
              <CurrencyLogo currency={currency1} />
              <Typography variant='h6' style={{ marginLeft: 6 }}>
                {currency1.symbol}
              </Typography>
            </Box>
          ) : (
            <Typography variant='h6'>Select a Token</Typography>
          )}
        </Box>
        {hasPosition && (
          <Box textAlign='center' mt={2}>
            <Typography variant='body1'>Pool Found!</Typography>
            <Typography
              variant='body1'
              style={{ cursor: 'pointer', color: palette.primary.main }}
              onClick={onClose}
            >
              Manage this pool.
            </Typography>
          </Box>
        )}
        <Box
          mt={2}
          p={1}
          borderRadius={10}
          display='flex'
          justifyContent='center'
          border={`1px solid ${palette.divider}`}
        >
          {currency0 && currency1 ? (
            pairState === PairState.EXISTS ? (
              hasPosition && pair ? (
                <MinimalPositionCard pair={pair} border='none' />
              ) : (
                <Box textAlign='center'>
                  <Typography>
                    You don’t have liquidity in this pool yet.
                  </Typography>
                  <Link
                    to={`/pools?currency0=${currencyId(
                      currency0,
                    )}&currency1=${currencyId(currency1)}`}
                    style={{
                      color: palette.primary.main,
                      textDecoration: 'none',
                    }}
                    onClick={onClose}
                  >
                    <Typography>Add liquidity.</Typography>
                  </Link>
                </Box>
              )
            ) : validPairNoLiquidity ? (
              <Box textAlign='center'>
                <Typography>No pool found.</Typography>
                <Link
                  to={`/pools?currency0=${currencyId(
                    currency0,
                  )}&currency1=${currencyId(currency1)}`}
                  style={{
                    color: palette.primary.main,
                    textDecoration: 'none',
                  }}
                  onClick={onClose}
                >
                  Create pool.
                </Link>
              </Box>
            ) : pairState === PairState.INVALID ? (
              <Typography>Invalid pair.</Typography>
            ) : pairState === PairState.LOADING ? (
              <Typography>Loading...</Typography>
            ) : null
          ) : (
            <Typography>
              {!account
                ? 'Connect to a wallet to find pools'
                : 'Select a token to find your liquidity.'}
            </Typography>
          )}
        </Box>
      </Box>
      {showSearch && (
        <CurrencySearchModal
          isOpen={showSearch}
          onCurrencySelect={handleCurrencySelect}
          onDismiss={handleSearchDismiss}
          showCommonBases
          selectedCurrency={
            (activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined
          }
        />
      )}
    </CustomModal>
  );
};

export default PoolFinderModal;
