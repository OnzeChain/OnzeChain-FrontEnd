import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ReactComponent as QuickIcon } from 'assets/images/quickIcon.svg';
import QuickLogo from 'assets/images/fulllogo_transparent_nobuffer.png';
import { Link, useLocation } from 'react-router-dom';
const useStyles = makeStyles(({}) => ({
  footer: {
    textAlign: 'center',
    paddingBottom: 110,
    position: 'relative',
    '& p': {
      fontSize: 14,
      lineHeight: '24px',
      marginTop: 20,
    },
  },
}));

const Footer: React.FC = () => {
  const classes = useStyles();
  const copyrightYear = new Date().getFullYear();

  return (
    <Box className={classes.footer}>
      {/* <QuickIcon /> */}
      <Link to='/'>
        <img src={QuickLogo} alt='QuickLogo' height={60} />
      </Link>
      <Typography>© {copyrightYear} Onzechain.</Typography>
    </Box>
  );
};

export default Footer;
