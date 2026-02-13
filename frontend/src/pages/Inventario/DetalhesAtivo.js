import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';

function DetalhesAtivo() {
  const { id } = useParams();

  return (
    <div>
      <Typography variant="h4">Detalhes do Ativo</Typography>
      {/* Implementar visualização detalhada do ativo */}
    </div>
  );
}

export default DetalhesAtivo;
