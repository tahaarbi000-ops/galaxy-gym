import {
  Box, Typography, Grid, Card, CardContent, Avatar, Stack, Chip, Button, Divider, IconButton,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { trainers } from '../data/mockData';

export default function Trainers() {
  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Entraîneurs</Typography>
          <Typography variant="body2" color="text.secondary">
            {trainers.length} coachs professionnels dans votre équipe
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />}>Ajouter un entraîneur</Button>
      </Stack>

      <Grid container spacing={3}>
        {trainers.map((t) => (
          <Grid item xs={12} sm={6} lg={4} key={t.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 60, height: 60, fontSize: 22, fontWeight: 700,
                      background: 'linear-gradient(135deg,#F1D57A,#D4AF37 60%,#A8862B)',
                      color: '#0B0B0F',
                    }}
                  >
                    {t.name.replace('Coach ', '')[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>{t.name}</Typography>
                    <Chip
                      label={t.specialty}
                      size="small"
                      sx={{ mt: 0.5, bgcolor: 'rgba(212,175,55,0.15)', color: 'primary.main', fontWeight: 600 }}
                    />
                  </Box>
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <WorkspacePremiumRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">Expérience</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={600}>{t.experience}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <GroupRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">Membres suivis</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={600}>{t.members}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <StarRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">Note moyenne</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={700} color="primary.main">{t.rating} / 5</Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PhoneRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">{t.phone}</Typography>
                  </Stack>
                  <Button size="small" variant="outlined">Profil</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
