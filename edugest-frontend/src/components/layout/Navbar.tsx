import {
  AppBar, Toolbar, Typography, IconButton,
  Box, Avatar, Menu, MenuItem, Divider, ListItemIcon,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  DIRECTOR: 'Director',
  CAJERO: 'Cajero',
  DOCENTE: 'Docente',
};

const ROLE_COLORS: Record<string, string> = {
  ADMINISTRADOR: '#ef4444',
  DIRECTOR: '#f59e0b',
  CAJERO: '#3b82f6',
  DOCENTE: '#8b5cf6',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const initiales = user
    ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
    : '?';

  const roleColor = user ? ROLE_COLORS[user.role] || '#64748b' : '#64748b';

  return (
    <AppBar position="static" color="inherit" elevation={1} sx={{ bgcolor: 'white' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Título de la app */}
        <Typography variant="h6" fontWeight="bold" color="primary">
          EduGest
        </Typography>

        {/* Info del usuario */}
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ cursor: 'pointer', borderRadius: 2, px: 1, py: 0.5, '&:hover': { bgcolor: '#f1f5f9' } }}
          onClick={handleOpen}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: roleColor,
              fontSize: 13,
              fontWeight: 'bold',
            }}
          >
            {initiales}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" fontWeight="bold" lineHeight={1.2}>
              {user?.nombre} {user?.apellido}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: roleColor, fontWeight: 'medium' }}
            >
              {user ? ROLE_LABELS[user.role] : ''}
            </Typography>
          </Box>
          <KeyboardArrowDownIcon fontSize="small" sx={{ color: '#94a3b8' }} />
        </Box>

        {/* Menú desplegable */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { mt: 1, minWidth: 200, borderRadius: 2, boxShadow: 3 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" fontWeight="bold">
              {user?.nombre} {user?.apellido}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
            <Box mt={0.5}>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: roleColor,
                  color: 'white',
                  borderRadius: 1,
                  px: 1,
                  py: 0.3,
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              >
                {user ? ROLE_LABELS[user.role] : ''}
              </Typography>
            </Box>
          </Box>

          <Divider />

          <MenuItem onClick={handleClose} sx={{ gap: 1 }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Mi perfil
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout} sx={{ gap: 1, color: 'error.main' }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}