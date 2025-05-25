import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BlogCreate from './pages/BlogCreate';
import BlogDetail from './pages/BlogDetail';
import BlogEdit from './pages/BlogEdit';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
          }}
        >
          <Navbar />
          <Box
            component="main"
            sx={{
              flex: 1,
              py: 4,
              px: 2,
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/blogs/create"
                element={
                  <PrivateRoute>
                    <BlogCreate />
                  </PrivateRoute>
                }
              />
              <Route path="/blogs/:id" element={<BlogDetail />} />
              <Route
                path="/blogs/edit/:id"
                element={
                  <PrivateRoute>
                    <BlogEdit />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Box>
          <Box
            component="footer"
            sx={{
              py: 3,
              px: 2,
              mt: 'auto',
              backgroundColor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                maxWidth: 'lg',
                mx: 'auto',
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              © {new Date().getFullYear()} Blog App. All rights reserved.
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App; 