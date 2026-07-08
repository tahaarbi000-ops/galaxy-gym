import {
  Grid, Card, CardContent, Typography, Box, Stack, Avatar, Chip, LinearProgress, Divider,
} from '@mui/material';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SportsGymnasticsRoundedIcon from '@mui/icons-material/SportsGymnasticsRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import StatCard from '../components/StatCard';
import { stats, revenueByMonth, membersByCategory, members, trainers } from '../data/mockData';

const COLORS = ['#D4AF37', '#EF5A6F', '#5AA9E6', '#3ED598', '#8E7CC3'];

export default function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Bienvenue, Galaxy Gym Elfaouar 👋
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Voici un aperçu général de l'activité de votre salle aujourd'hui.
      </Typography>

      {/* Statistiques principales */}
      <Grid container spacing={3} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Membres totaux"
            value={stats.totalMembers}
            icon={<GroupRoundedIcon />}
            trend="+8.2%"
            trendUp
            color="#D4AF37"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Entraîneurs actifs"
            value={stats.totalTrainers}
            icon={<SportsGymnasticsRoundedIcon />}
            trend="+2"
            trendUp
            color="#5AA9E6"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Revenu mensuel"
            value={`${stats.monthlyRevenue.toLocaleString()} DT`}
            icon={<PaidRoundedIcon />}
            trend="+12.4%"
            trendUp
            color="#3ED598"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Nouveaux ce mois"
            value={stats.newThisMonth}
            icon={<PersonAddAltRoundedIcon />}
            trend="-3.1%"
            trendUp={false}
            color="#EF5A6F"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        {/* Graphique revenu */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Évolution du revenu</Typography>
                  <Typography variant="caption" color="text.secondary">7 derniers mois</Typography>
                </Box>
                <Chip label="+12.4% ce mois" size="small" sx={{ bgcolor: 'rgba(62,213,152,0.15)', color: 'success.main' }} />
              </Stack>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueByMonth}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(243,241,234,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(243,241,234,0.5)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: '#1A1A21', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 12 }}
                    labelStyle={{ color: '#F3F1EA' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#goldGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Répartition par catégorie */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Membres par catégorie</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={membersByCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {membersByCategory.map((entry, i) => (
                      <Cell key={entry.name} fill={COLORS[i % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1A1A21', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {membersByCategory.map((c, i) => (
                  <Stack key={c.name} direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                      <Typography variant="body2" color="text.secondary">{c.name}</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={700}>{c.value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Derniers membres */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Derniers membres inscrits</Typography>
              <Stack spacing={2}>
                {members.slice(0, 4).map((m) => (
                  <Stack key={m.id} direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ bgcolor: 'rgba(212,175,55,0.15)', color: 'primary.main', fontWeight: 700 }}>
                        {m.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{m.category}</Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label={m.status}
                      size="small"
                      sx={{
                        bgcolor: m.status === 'Actif' ? 'rgba(62,213,152,0.15)' : 'rgba(239,90,111,0.15)',
                        color: m.status === 'Actif' ? 'success.main' : 'error.main',
                      }}
                    />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Meilleurs entraîneurs */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Entraîneurs les mieux notés</Typography>
              <Stack spacing={2.2}>
                {trainers.slice(0, 4).map((t) => (
                  <Box key={t.id}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>{t.name}</Typography>
                      <Typography variant="body2" color="primary.main" fontWeight={700}>{t.rating} ★</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={t.rating * 20}
                      sx={{
                        height: 6, borderRadius: 4, bgcolor: 'rgba(212,175,55,0.1)',
                        '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 4 },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
