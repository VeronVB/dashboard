import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ViewListIcon from '@mui/icons-material/ViewList';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <HomeIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Homelab Dashboard
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/">
            Overview
          </Button>
          <Button color="inherit" component={Link} to="/containers">
            Containers
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;