import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, Grid } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { SwapTokenDetails } from 'components';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { Field } from 'state/swap/actions';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useActiveWeb3React } from 'hooks';
import SwapMain from './SwapMain';
import LiquidityPools from './LiquidityPools';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  helpWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    border: `1px solid ${palette.secondary.light}`,
    borderRadius: 10,
    '& p': {
      color: palette.text.hint,
    },
    '& svg': {
      marginLeft: 8,
    },
  },
  wrapper: {
    padding: 24,
    backgroundColor: palette.background.paper,
    borderRadius: 20,
    [breakpoints.down('xs')]: {
      padding: '16px 12px',
    },
  },
  swapTokenDetails: {
    backgroundColor: palette.background.paper,
    borderRadius: 16,
    width: 'calc(50% - 16px)',
    [breakpoints.down('xs')]: {
      width: '100%',
      marginTop: 16,
      marginBottom: 16,
    },
  },
}));

const SwapPage: React.FC = () => {
  const classes = useStyles();

  const { currencies } = useDerivedSwapInfo();
  const { chainId } = useActiveWeb3React();

  const token1 = wrappedCurrency(currencies[Field.INPUT], chainId);
  const token2 = wrappedCurrency(currencies[Field.OUTPUT], chainId);

  return (
    <Box width='100%' mb={3} id='swap-page'>
      {/* <Grid container spacing={4}> */}
      {/* <Grid item xs={12} sm={12} md={5}> */}
      <Box style={{ width: 550, margin: '0 auto' }}>
        <Typography variant='h4' style={{ margin: '10px 0' }}>
          Swap
        </Typography>
        <Box className={classes.wrapper}>
          <SwapMain />
        </Box>
      </Box>
      {/* </Grid> */}
      {/* <Grid item xs={12} sm={12} md={7}>
          <Box
            display='flex'
            flexWrap='wrap'
            justifyContent='space-between'
            width='100%'
          >
            {token1 && (
              <Box className={classes.swapTokenDetails}>
                <SwapTokenDetails token={token1} />
              </Box>
            )}
            {token2 && (
              <Box className={classes.swapTokenDetails}>
                <SwapTokenDetails token={token2} />
              </Box>
            )}
          </Box>
          {token1 && token2 && (
            <Box className={classes.wrapper} marginTop='32px'>
              <LiquidityPools token1={token1} token2={token2} />
            </Box>
          )}
        </Grid> */}
      {/* </Grid> */}
      <Box
        mb={2}
        display='flex'
        alignItems='center'
        justifyContent='end'
        width='100%'
      >
        <Box className={classes.helpWrapper}>
          <Typography variant='body2'>Help</Typography>
          <HelpIcon />
        </Box>
      </Box>
    </Box>
  );
};

export default SwapPage;
