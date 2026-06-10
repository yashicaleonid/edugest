import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';
import PaymentsIcon from '@mui/icons-material/Payments';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useNavigate, useLocation } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Usuarios', icon: <PeopleIcon />, path: '/usuarios' },
  { text: 'Estudiantes', icon: <SchoolIcon />, path: '/estudiantes' },
  { text: 'Inscripciones', icon: <AssignmentIcon />, path: '/inscripciones' },
  { text: 'Docentes', icon: <PersonIcon />, path: '/docentes' },
  { text: 'Cursos', icon: <ClassIcon />, path: '/cursos' },
  { text: 'Pagos', icon: <PaymentsIcon />, path: '/pagos' },
  { text: 'Asistencia', icon: <EventNoteIcon />, path: '/asistencia' },
  { text: 'Reportes', icon: <AssessmentIcon />, path: '/reportes' },
  
];

const DRAWER_WIDTH = 240;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

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
        <Typography variant="h6" fontWeight="bold" color="white">
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