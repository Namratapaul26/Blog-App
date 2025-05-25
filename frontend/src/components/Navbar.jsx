import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Container,
  useScrollTrigger,
  Slide,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CreateIcon from '@mui/icons-material/Create';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  boxShadow: 'none',
}));

const StyledToolbar = styled(Toolbar)({
  minHeight: '70px',
});

const NavButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  borderRadius: '20px',
  padding: '6px 20px',
  textTransform: 'none',
  fontWeight: 500,
}));

const CreateButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  borderRadius: '20px',
  padding: '8px 24px',
  textTransform: 'none',
  fontWeight: 500,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  transition: 'all 0.2s ease-in-out',
}));

const HideOnScroll = (props) => {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])).user : null;

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    handleClose();
    navigate('/login');
  };

  return (
    <HideOnScroll>
      <StyledAppBar position="sticky">
        <Container maxWidth="lg">
          <StyledToolbar>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                fontWeight: 700,
                letterSpacing: '-0.5px',
                '&:hover': {
                  color: 'primary.main',
                },
                transition: 'color 0.2s ease-in-out',
              }}
            >
              Blog App
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            {token ? (
              <>
                <Fade in={true}>
                  <CreateButton
                    component={RouterLink}
                    to="/blogs/create"
                    startIcon={<CreateIcon />}
                  >
                    Write a Blog
                  </CreateButton>
                </Fade>
                <IconButton
                  onClick={handleMenu}
                  sx={{
                    ml: 2,
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                    transition: 'transform 0.2s ease-in-out',
                  }}
                >
                  <Avatar
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name
                    )}&background=random`}
                    alt={user.name}
                  />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      borderRadius: 2,
                      minWidth: 180,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem
                    onClick={handleClose}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      mb: 0.5,
                      width: 'calc(100% - 16px)',
                    }}
                  >
                    <Typography variant="body2">{user.name}</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      color: 'error.main',
                      width: 'calc(100% - 16px)',
                    }}
                  >
                    <Typography variant="body2">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box>
                <NavButton
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  sx={{ color: 'text.primary' }}
                >
                  Login
                </NavButton>
                <NavButton
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  color="primary"
                >
                  Sign Up
                </NavButton>
              </Box>
            )}
          </StyledToolbar>
        </Container>
      </StyledAppBar>
    </HideOnScroll>
  );
};

export default Navbar; 