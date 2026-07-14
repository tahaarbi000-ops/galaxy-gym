import { useState } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar,
  AppBar, Typography, Avatar, IconButton, Menu, MenuItem, Divider,
  InputBase, Badge, useMediaQuery, useTheme as useMuiTheme,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SportsGymnasticsRoundedIcon from '@mui/icons-material/SportsGymnasticsRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import CardMembershipRoundedIcon from '@mui/icons-material/CardMembershipRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import { useAuth } from '../context/AuthContext';
import Logo from "../assets/images/logo.png"

const drawerWidth = 268;

const navItems = [
  { label: "Vue d'ensemble", path: '/', icon: <DashboardRoundedIcon /> },
  { label: 'Membres', path: '/members', icon: <GroupRoundedIcon /> },
  { label: 'Entraîneurs', path: '/trainers', icon: <SportsGymnasticsRoundedIcon /> },
  { label: 'Secrétariat', path: '/secretary', icon: <BadgeRoundedIcon />, adminOnly: true },
  { label: 'Catégories', path: '/categories', icon: <CategoryRoundedIcon /> },
  { label: 'Abonnements', path: '/subscriptions', icon: <CardMembershipRoundedIcon /> },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentLabel = navItems.find((n) => n.path === location.pathname)?.label || '';

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ py: 3, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 60, height: 60, borderRadius: '12px',
              background: 'black',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 18px black',
            }}
          >
            <img width={60} src={Logo} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1} fontFamily='"Playfair Display", serif'>
              Galaxy Gym
            </Typography>
            <Typography variant="caption" color="text.secondary" letterSpacing={1}>
              ELFAOUAR
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider />

      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {visibleNavItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === '/'}
            onClick={() => setMobileOpen(false)}
            sx={{
              mb: 1, borderRadius: 3, py: 1.2,
              color: 'text.secondary',
              '&.active': {
                color: 'primary.main',
                bgcolor: 'rgba(212,175,55,0.1)',
                border: '1px solid rgba(212,175,55,0.25)',
                '& .MuiListItemIcon-root': { color: 'primary.main' },
              },
              '&:hover': { bgcolor: 'rgba(212,175,55,0.06)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}>
              {item.label}
            </ListItemText>
          </ListItemButton>
        ))}
      </List>

    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'rgba(11,11,15,0.75)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(212,175,55,0.12)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              sx={{ display: { md: 'none' } }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuRoundedIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700}>
              {currentLabel}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', color: '#0B0B0F', fontWeight: 700 }}>
                {user?.name?.[0].toUpperCase() || 'A'}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography sx={{textTransform:"capitalize"}} variant="body2" fontWeight={700}>{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.role === "admin" ? "Administrateur" : user?.role }</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ gap: 1, color: 'error.main' }}>
                <LogoutRoundedIcon fontSize="small" /> Déconnexion
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth, bgcolor: 'background.paper' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth, boxSizing: 'border-box',
              bgcolor: 'background.paper', borderRight: '1px solid rgba(212,175,55,0.12)',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, p: { xs: 2, sm: 3, md: 4 } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}