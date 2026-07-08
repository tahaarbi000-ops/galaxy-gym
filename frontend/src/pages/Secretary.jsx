import {
  Box, Typography, Card, Stack, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Avatar, Chip, TableContainer, IconButton,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { secretaries } from '../data/mockData';

const statusColor = {
  Actif: { bg: 'rgba(62,213,152,0.15)', color: '#3ED598' },
  Congé: { bg: 'rgba(245,184,93,0.15)', color: '#F5B85D' },
};

export default function Secretary() {
  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Secrétariat</Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez l'équipe d'accueil et administrative de votre salle
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />}>Ajouter une secrétaire</Button>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Créneau</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Téléphone</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Statut</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {secretaries.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ bgcolor: 'rgba(212,175,55,0.15)', color: 'primary.main', fontWeight: 700 }}>
                        {s.name[0]}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{s.shift}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{s.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{s.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={s.status}
                      size="small"
                      sx={{ bgcolor: statusColor[s.status].bg, color: statusColor[s.status].color, fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: 'error.main' }}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
