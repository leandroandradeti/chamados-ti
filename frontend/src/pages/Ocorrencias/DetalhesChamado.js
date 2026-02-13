import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';

function DetalhesChamado() {
  const { id } = useParams();

  return (
    <div>
      <Typography variant="h4">Detalhes do Chamado #{id}</Typography>
      {/* Implementar visualização detalhada */}
    </div>
  );
}

export default DetalhesChamado;
