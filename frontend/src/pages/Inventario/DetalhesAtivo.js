import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { selectA11yProps } from '../../utils/selectAccessibility';

const emptyForm = {
  // Identificação básica
  codigo: '',
  nome: '',
  descricao: '',
  tipo_id: '',
  status_id: '',
  categoria_id: '',
  // Identificação técnica
  numero_serie: '',
  numero_patrimonio: '',
  // Rede & conectividade (gravados em caracteristicas JSONB)
  imei: '',
  mac_address: '',
  ip_address: '',
  // Especificações de hardware (gravados em caracteristicas JSONB)
  cpu: '',
  ram: '',
  armazenamento: '',
  // Aquisição & garantia
  data_aquisicao: '',
  valor_aquisicao: '',
  fornecedor: '',
  nota_fiscal: '',
  data_garantia_inicio: '',
  data_garantia_fim: '',
  garantia_ativa: false,
  // Observações
  observacoes: '',
};

function DetalhesAtivo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'novo';
  const [form, setForm] = React.useState(emptyForm);
  const [movimentacao, setMovimentacao] = React.useState({
    localizacao_nova_id: '',
    responsavel_novo_id: '',
    motivo: '',
  });

  const { data: ativo, isLoading, isError } = useQuery(['inventario-ativo', id], async () => {
    const response = await api.get(`/inventario/${id}`);
    return response.data;
  }, { enabled: !isNew });

  const { data: tipos = [] } = useQuery('inventario-config-tipos', async () => {
    const response = await api.get('/inventario/config/tipos');
    return response.data || [];
  });

  const { data: statusList = [] } = useQuery('inventario-config-status', async () => {
    const response = await api.get('/inventario/config/status');
    return response.data || [];
  });

  const { data: categorias = [] } = useQuery('inventario-config-categorias', async () => {
    const response = await api.get('/inventario/config/categorias');
    return response.data || [];
  });

  const { data: responsaveis = [] } = useQuery('inventario-config-responsaveis', async () => {
    const response = await api.get('/inventario/config/responsaveis');
    return response.data || [];
  });

  const { data: unidades = [] } = useQuery('inventario-config-unidades', async () => {
    const response = await api.get('/inventario/config/unidades');
    return response.data || [];
  });

  const { data: historico = [], isLoading: loadingHistorico } = useQuery(['inventario-historico', id], async () => {
    const response = await api.get(`/inventario/${id}/historico`);
    return response.data || [];
  }, { enabled: !isNew });

  React.useEffect(() => {
    if (!ativo) return;
    const c = ativo.caracteristicas || {};
    setForm({
      codigo: ativo.codigo || '',
      nome: ativo.nome || '',
      descricao: ativo.descricao || '',
      tipo_id: ativo.tipo_id || '',
      status_id: ativo.status_id || '',
      categoria_id: ativo.categoria_id || '',
      numero_serie: ativo.numero_serie || '',
      numero_patrimonio: ativo.numero_patrimonio || '',
      imei: c.imei || '',
      mac_address: c.mac_address || '',
      ip_address: c.ip_address || '',
      cpu: c.cpu || '',
      ram: c.ram || '',
      armazenamento: c.armazenamento || '',
      data_aquisicao: ativo.data_aquisicao || '',
      valor_aquisicao: ativo.valor_aquisicao != null ? String(ativo.valor_aquisicao) : '',
      fornecedor: ativo.fornecedor || '',
      nota_fiscal: ativo.nota_fiscal || '',
      data_garantia_inicio: ativo.data_garantia_inicio || '',
      data_garantia_fim: ativo.data_garantia_fim || '',
      garantia_ativa: Boolean(ativo.garantia_ativa),
      observacoes: ativo.observacoes || '',
    });
  }, [ativo]);

  const createMutation = useMutation(
    async (payload) => {
      const response = await api.post('/inventario', payload);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Ativo criado com sucesso');
        queryClient.invalidateQueries('inventario-list');
        navigate(`/inventario/${data.id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Falha ao criar ativo');
      },
    }
  );

  const updateMutation = useMutation(
    async (payload) => {
      const response = await api.put(`/inventario/${id}`, payload);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Ativo atualizado com sucesso');
        queryClient.invalidateQueries(['inventario-ativo', id]);
        queryClient.invalidateQueries('inventario-list');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Falha ao atualizar ativo');
      },
    }
  );

  const movimentarMutation = useMutation(
    async (payload) => {
      const response = await api.post(`/inventario/${id}/movimentar`, payload);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Movimentação registrada com sucesso');
        setMovimentacao({ localizacao_nova_id: '', responsavel_novo_id: '', motivo: '' });
        queryClient.invalidateQueries(['inventario-ativo', id]);
        queryClient.invalidateQueries(['inventario-historico', id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Falha ao movimentar ativo');
      },
    }
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'garantia_ativa' ? value === 'true' : value,
    }));
  };

  const buildPayload = () => {
    const caracteristicas = {};
    if (form.imei.trim()) caracteristicas.imei = form.imei.trim();
    if (form.mac_address.trim()) caracteristicas.mac_address = form.mac_address.trim();
    if (form.ip_address.trim()) caracteristicas.ip_address = form.ip_address.trim();
    if (form.cpu.trim()) caracteristicas.cpu = form.cpu.trim();
    if (form.ram.trim()) caracteristicas.ram = form.ram.trim();
    if (form.armazenamento.trim()) caracteristicas.armazenamento = form.armazenamento.trim();

    return {
      codigo: form.codigo.trim(),
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      tipo_id: form.tipo_id,
      status_id: form.status_id,
      categoria_id: form.categoria_id || null,
      numero_serie: form.numero_serie.trim() || null,
      numero_patrimonio: form.numero_patrimonio.trim() || null,
      data_aquisicao: form.data_aquisicao || null,
      valor_aquisicao: form.valor_aquisicao !== '' ? Number(form.valor_aquisicao) : null,
      fornecedor: form.fornecedor.trim() || null,
      nota_fiscal: form.nota_fiscal.trim() || null,
      data_garantia_inicio: form.data_garantia_inicio || null,
      data_garantia_fim: form.data_garantia_fim || null,
      garantia_ativa: form.garantia_ativa,
      observacoes: form.observacoes.trim() || null,
      caracteristicas,
    };
  };

  const handleSave = (event) => {
    event.preventDefault();
    const payload = buildPayload();
    if (isNew) {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate(payload);
    }
  };

  const handleMovimentar = (event) => {
    event.preventDefault();
    movimentarMutation.mutate({
      localizacao_nova_id: movimentacao.localizacao_nova_id || null,
      responsavel_novo_id: movimentacao.responsavel_novo_id || null,
      motivo: movimentacao.motivo,
    });
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">{isNew ? 'Novo Ativo' : 'Detalhes do Ativo'}</Typography>
      </Stack>

      {!isNew && isLoading ? (
        <CircularProgress size={24} />
      ) : !isNew && isError ? (
        <Alert severity="error">Não foi possível carregar o ativo.</Alert>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {/* ── Seção 1: Identificação ── */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Identificação</Typography>
              <Divider sx={{ mb: 2 }} />
              <form onSubmit={handleSave} id="form-ativo">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField id="ativo-codigo" name="codigo" fullWidth required label="Código *" value={form.codigo} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField id="ativo-nome" name="nome" fullWidth required label="Nome *" value={form.nome} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField id="ativo-tipo" name="tipo_id" fullWidth required select label="Tipo *" value={form.tipo_id} onChange={handleChange} SelectProps={selectA11yProps}>
                      {tipos.map((item) => (
                        <MenuItem key={item.id} value={item.id}>{item.nome}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField id="ativo-status" name="status_id" fullWidth required select label="Status *" value={form.status_id} onChange={handleChange} SelectProps={selectA11yProps}>
                      {statusList.map((item) => (
                        <MenuItem key={item.id} value={item.id}>{item.nome}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField id="ativo-categoria" name="categoria_id" fullWidth select label="Categoria" value={form.categoria_id} onChange={handleChange} SelectProps={selectA11yProps}>
                      <MenuItem value="">Sem categoria</MenuItem>
                      {categorias.map((item) => (
                        <MenuItem key={item.id} value={item.id}>{item.nome}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField id="ativo-descricao" name="descricao" fullWidth multiline minRows={2} label="Descrição" value={form.descricao} onChange={handleChange} placeholder="Descrição detalhada do ativo" />
                  </Grid>
                </Grid>
              </form>
            </Paper>

            {/* ── Seção 2: Identificação Técnica ── */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Identificação Técnica</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField id="ativo-serie" name="numero_serie" fullWidth label="Número de Série (S/N)" value={form.numero_serie} onChange={handleChange} placeholder="Ex: SN123456789" inputProps={{ maxLength: 255 }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField id="ativo-patrimonio" name="numero_patrimonio" fullWidth label="Número de Patrimônio" value={form.numero_patrimonio} onChange={handleChange} placeholder="Ex: PAT-2024-001" inputProps={{ maxLength: 100 }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField id="ativo-imei" name="imei" fullWidth label="IMEI" value={form.imei} onChange={handleChange} placeholder="Ex: 356938035643809" inputProps={{ maxLength: 20 }} helperText="Para dispositivos móveis" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField id="ativo-mac" name="mac_address" fullWidth label="Endereço MAC" value={form.mac_address} onChange={handleChange} placeholder="Ex: AA:BB:CC:DD:EE:FF" inputProps={{ maxLength: 17 }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField id="ativo-ip" name="ip_address" fullWidth label="Endereço IP" value={form.ip_address} onChange={handleChange} placeholder="Ex: 192.168.1.100" inputProps={{ maxLength: 45 }} helperText="IPv4 ou IPv6" />
                </Grid>
              </Grid>
            </Paper>

            {/* ── Seção 3: Especificações de Hardware ── */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Especificações de Hardware</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField id="ativo-cpu" name="cpu" fullWidth label="Processador (CPU)" value={form.cpu} onChange={handleChange} placeholder="Ex: Intel Core i7-12700" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField id="ativo-ram" name="ram" fullWidth label="Memória RAM" value={form.ram} onChange={handleChange} placeholder="Ex: 16 GB DDR4" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField id="ativo-armazenamento" name="armazenamento" fullWidth label="Armazenamento (HD/SSD)" value={form.armazenamento} onChange={handleChange} placeholder="Ex: SSD 512 GB NVMe" />
                </Grid>
              </Grid>
            </Paper>

            {/* ── Seção 4: Aquisição & Garantia ── */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Aquisição & Garantia</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField id="ativo-data-aquisicao" name="data_aquisicao" fullWidth type="date" label="Data de Aquisição" value={form.data_aquisicao} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField id="ativo-valor" name="valor_aquisicao" fullWidth type="number" label="Valor de Aquisição (R$)" value={form.valor_aquisicao} onChange={handleChange} inputProps={{ min: 0, step: '0.01' }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField id="ativo-fornecedor" name="fornecedor" fullWidth label="Fornecedor" value={form.fornecedor} onChange={handleChange} placeholder="Ex: Dell Brasil" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField id="ativo-nota-fiscal" name="nota_fiscal" fullWidth label="Nota Fiscal (NF)" value={form.nota_fiscal} onChange={handleChange} placeholder="Ex: NF-0001234" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField id="ativo-garantia-inicio" name="data_garantia_inicio" fullWidth type="date" label="Início da Garantia" value={form.data_garantia_inicio} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField id="ativo-garantia-fim" name="data_garantia_fim" fullWidth type="date" label="Fim da Garantia" value={form.data_garantia_fim} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField id="ativo-garantia-ativa" name="garantia_ativa" fullWidth select label="Garantia Ativa" value={String(form.garantia_ativa)} onChange={handleChange} SelectProps={selectA11yProps}>
                    <MenuItem value="true">Sim</MenuItem>
                    <MenuItem value="false">Não</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* ── Seção 5: Observações ── */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Observações</Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField id="ativo-observacoes" name="observacoes" fullWidth multiline minRows={3} label="Observações" value={form.observacoes} onChange={handleChange} />
            </Paper>

            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mb: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/inventario')}>Voltar</Button>
              <Button type="submit" form="form-ativo" variant="contained" disabled={createMutation.isLoading || updateMutation.isLoading}>
                {createMutation.isLoading || updateMutation.isLoading ? 'Salvando...' : isNew ? 'Criar Ativo' : 'Salvar alterações'}
              </Button>
            </Stack>

            {!isNew && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Movimentação
                </Typography>

                <form onSubmit={handleMovimentar}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField id="mov-localizacao" name="localizacao_nova_id" fullWidth required select label="Nova localização" value={movimentacao.localizacao_nova_id} onChange={(event) => setMovimentacao((prev) => ({ ...prev, localizacao_nova_id: event.target.value }))} SelectProps={selectA11yProps}>
                        <MenuItem value="" disabled>Selecione</MenuItem>
                        {unidades.map((item) => (
                          <MenuItem key={item.id} value={item.id}>{item.nome}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField id="mov-responsavel" name="responsavel_novo_id" fullWidth select label="Novo responsável" value={movimentacao.responsavel_novo_id} onChange={(event) => setMovimentacao((prev) => ({ ...prev, responsavel_novo_id: event.target.value }))} SelectProps={selectA11yProps}>
                        <MenuItem value="">Manter responsável</MenuItem>
                        {responsaveis.map((item) => (
                          <MenuItem key={item.id} value={item.id}>{item.nome} ({item.email})</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField id="mov-motivo" name="motivo" fullWidth required label="Motivo" value={movimentacao.motivo} onChange={(event) => setMovimentacao((prev) => ({ ...prev, motivo: event.target.value }))} />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="outlined" disabled={movimentarMutation.isLoading}>
                        {movimentarMutation.isLoading ? 'Movimentando...' : 'Registrar movimentação'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            )}
          </Grid>

          {!isNew && (
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Histórico de Movimentação
                </Typography>

                {loadingHistorico ? (
                  <CircularProgress size={20} />
                ) : (
                  <List dense>
                    {historico.map((item) => (
                      <ListItem key={item.id} divider alignItems="flex-start">
                        <ListItemText
                          primary={new Date(item.data_movimentacao).toLocaleString('pt-BR')}
                          secondary={`De: ${item.localizacao_anterior?.nome || '-'} | Para: ${item.localizacao_nova?.nome || '-'}\nResponsável: ${item.responsavel_novo?.nome || '-'}\nMotivo: ${item.motivo || '-'}\nPor: ${item.realizado_por?.nome || '-'}`}
                        />
                      </ListItem>
                    ))}
                    {!historico.length && <ListItem><ListItemText primary="Nenhuma movimentação registrada." /></ListItem>}
                  </List>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}

export default DetalhesAtivo;
