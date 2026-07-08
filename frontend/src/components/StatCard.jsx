import { Card, CardContent, Box, Typography, Stack } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';

export default function StatCard({ title, value, icon, trend, trendUp = true, color = '#D4AF37' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 52, height: 52, borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: `${color}22`, color: color,
            }}
          >
            {icon}
          </Box>
        </Stack>
        {trend && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 2 }}>
            {trendUp ? (
              <TrendingUpRoundedIcon fontSize="small" sx={{ color: 'success.main' }} />
            ) : (
              <TrendingDownRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
            )}
            <Typography variant="caption" sx={{ color: trendUp ? 'success.main' : 'error.main' }} fontWeight={600}>
              {trend}
            </Typography>
            <Typography variant="caption" color="text.secondary">vs mois dernier</Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
