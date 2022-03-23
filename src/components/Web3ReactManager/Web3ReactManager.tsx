import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { network } from 'connectors';
import { useEagerConnect, useInactiveListener } from 'hooks';
import { GlobalConst } from 'constants/index';

const useStyles = makeStyles(({}) => ({
  messageWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '20rem',
  },
  message: {
    color: 'black',
  },
}));

const Web3ReactManager: React.FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { active } = useWeb3React();
  const {
    active: networkActive,
    error: networkError,
    activate: activateNetwork,
  } = useWeb3React(GlobalConst.utils.NetworkContextName);

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate itd
  useEffect(() => {
    if (triedEager && !networkActive && !networkError && !active) {
      activateNetwork(network);
    }
  }, [triedEager, networkActive, networkError, activateNetwork, active]);

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager);

  // handle delayed loader state
  const [showLoader, setShowLoader] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(true);
    }, 600);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    return null;
  }

  // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
  if (!active && networkError) {
    return (
      <Box className={classes.messageWrapper}>
        <Typography className={classes.message}>{t('unknownError')}</Typography>
      </Box>
    );
  }

  // if neither context is active, spin
  if (!active && !networkActive) {
    return showLoader ? (
      <Box className={classes.messageWrapper}>
        <CircularProgress />
      </Box>
    ) : null;
  }

  return children;
};

export default Web3ReactManager;
