import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import {
  ConfirmationNumber,
  CheckCircle,
  Pending,
  Warning,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import api from '../../services/api';

function Dashboard() {
  const { data: stats } = useQuery('dashboard-stats', async () => {
    const response = await api.get('/home/dashboard');
    return response.data;
  });

  const cards = [
    {
      title: 'Total de Chamados',
      value: stats?.totalChamados || 0,
      icon: <ConfirmationNumber sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Chamados Abertos',
      value: stats?.chamadosAbertos || 0,
      icon: <Pending sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: 'Em Andamento',
      value: stats?.chamadosEmAndamento || 0,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'SLA Vencendo',
      value: stats?.slaVencendo || 0,
      icon: <Warning sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ borderTop: `4px solid ${card.color}` }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      {card.title}
                    </Typography>
                    <Typography variant="h3" sx={{ mt: 1 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Meus Chamados Recentes
            </Typography>
            {/* Adicionar lista de chamados */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Avisos
            </Typography>
            {/* Adicionar avisos */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
