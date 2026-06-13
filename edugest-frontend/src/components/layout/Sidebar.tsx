import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Box,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';
import PaymentsIcon from '@mui/icons-material/Payments';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FolderIcon from '@mui/icons-material/Folder';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { puedeAcceder, type Modulo } from '../../utils/permissions';
import CampaignIcon from '@mui/icons-material/Campaign';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const ALL_MENU_ITEMS: { text: string; icon: React.ReactNode; path: string; modulo: Modulo }[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', modulo: 'dashboard' },
  { text: 'Usuarios', icon: <PeopleIcon />, path: '/usuarios', modulo: 'usuarios' },
  { text: 'Estudiantes', icon: <SchoolIcon />, path: '/estudiantes', modulo: 'estudiantes' },
  { text: 'Padres', icon: <FamilyRestroomIcon />, path: '/padres', modulo: 'padres' },
  { text: 'Inscripciones', icon: <AssignmentIcon />, path: '/inscripciones', modulo: 'inscripciones' },
  { text: 'Docentes', icon: <PersonIcon />, path: '/docentes', modulo: 'docentes' },
  { text: 'Cursos', icon: <ClassIcon />, path: '/cursos', modulo: 'cursos' },
  { text: 'Pagos', icon: <PaymentsIcon />, path: '/pagos', modulo: 'pagos' },
  { text: 'Facturas', icon: <ReceiptIcon />, path: '/facturas', modulo: 'facturas' },
  { text: 'Asistencia', icon: <EventNoteIcon />, path: '/asistencia', modulo: 'asistencia' },
  { text: 'Documentos', icon: <FolderIcon />, path: '/documentos', modulo: 'documentos' },
  { text: 'Reportes', icon: <AssessmentIcon />, path: '/reportes', modulo: 'reportes' },
  { text: 'Notificaciones', icon: <NotificationsIcon />, path: '/notificaciones', modulo: 'notificaciones' },
  { text: 'Eventos', icon: <CalendarMonthIcon />, path: '/eventos', modulo: 'eventos' },
  { text: 'Comunicados', icon: <CampaignIcon />, path: '/comunicados', modulo: 'comunicados' },
];

const DRAWER_WIDTH = 240;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = ALL_MENU_ITEMS.filter(
    (item) => user && puedeAcceder(user.role, item.modulo),
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: '#1e293b',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid #334155' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }} color="white">
          EduGest
        </Typography>
        <Typography variant="caption" color="#94a3b8">
          Gestión Escolar
        </Typography>
      </Box>
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: '#3b82f6',
                '&:hover': { bgcolor: '#2563eb' },
              },
              '&:hover': { bgcolor: '#334155' },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} sx={{ color: 'white' }} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
