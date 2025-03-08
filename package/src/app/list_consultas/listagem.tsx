import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
    Modal,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    styled,
    FormControlLabel,
    Switch
} from "@mui/material";
import { Edit, Delete, AccessTime, Add } from "@mui/icons-material";
import DashboardCard from "@/app/(DashboardLayout)//components/shared/DashboardCard";
import {
    CREATE_AGENDAMENTO,
    LIST_AGENDAMENTO,
    UPDATE_AGENDAMENTO,
    DELETE_AGENDAMENTO
} from "../APIroutes";
import { Consulta, HorarioAtendimento, Medico, Paciente } from "../interfaces";
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTheme } from "@mui/material/styles";

// Estilização para a linha da tabela com hover
const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        cursor: 'pointer',
    },
}));

const ListagemConsultas = () => {
    const theme = useTheme();

    const [consultas, setConsultas] = useState<Consulta[]>([]);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [consultaEdit, setConsultaEdit] = useState<Consulta | null>(null);
    const [consultaDelete, setConsultaDelete] = useState<Consulta | null>(null);

    const [horarios, setHorarios] = useState<HorarioAtendimento[]>([]);

    const [openHorarios, setOpenHorarios] = useState(false);
    const [consultaSelecionada, setConsultaSelecionada] = useState<Consulta | null>(null);

    const [openDetails, setOpenDetails] = useState(false);
    const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);

    useEffect(() => {
        fetch(LIST_AGENDAMENTO())
            .then((response) => response.json())
            .then((data) => {
                setConsultas(Array.isArray(data) ? data : []);
            })
            .catch((error) => console.error("Erro ao buscar Consultas:", error));
    }, []);


    const handleHorariosClick = (consulta: Consulta) => {
        setConsultaSelecionada(consulta);
        setOpenHorarios(true);

        //fetch(LIST_AGENDAMENTO()) // TODO: Trocar para rota de busca de médico.
        //    .then((response) => response.json())
        //    .then((data: HorarioAtendimento[]) => setHorarios(data))
        //    .catch((error) => console.error("Erro ao buscar horários:", error));
    };

    const handleOpenDetails = (consulta: Consulta) => {
        setSelectedConsulta(consulta);
        setOpenDetails(true);
    };

    const handleCloseDetails = () => {
        setOpenDetails(false);
        setSelectedConsulta(null);
    };

    const handleEditClick = (consulta: Consulta) => {
        setConsultaEdit(consulta);
        setOpenEdit(true);
    };

    const handleDeleteClick = (consulta: Consulta) => {
        setConsultaDelete(consulta);
        setOpenDelete(true);
    };

    const handleSave = () => {
        if (consultaEdit) {
            fetch(UPDATE_AGENDAMENTO(consultaEdit.id),
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(consultaEdit),
                }
            )
                .then((response) => response.json())
                .then((updatedConsulta) => {
                    setConsultas(
                        consultas.map((p) =>
                            p.id === updatedConsulta.id ? updatedConsulta : p
                        )
                    );
                    setOpenEdit(false);
                })
                .catch((error) => console.error("Erro ao atualizar Consulta:", error));
        }
    };

    const handleDelete = () => {
        if (consultaDelete) {
            fetch(DELETE_AGENDAMENTO(consultaDelete.id),
                {
                    method: "DELETE",
                }
            )
                .then(() => {
                    setConsultas(consultas.filter((p) => p.id !== consultaDelete.id));
                    setOpenDelete(false);
                })
                .catch((error) => console.error("Erro ao excluir consulta:", error));
        }
    };

    const reservarHorario = async (horarioId: number) => {
        const username = prompt("Digite seu username para reservar este horário:");
        if (!username) return;

        try {
            const response = await fetch("/api/reservar-horario", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, horarioId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao reservar o horário");
            }

            alert("Horário reservado com sucesso!");
        } catch (error: any) {
            alert(error.message);
        }
    };

    const [openNovaConsulta, setOpenNovaConsulta] = useState(false);
    const [selectedClinica, setSelectedClinica] = useState('');
    const [selectedMedico, setSelectedMedico] = useState('');
    const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);

    // Dados fictícios para as clínicas
    const clinicas = [
        { id: '1', nome: 'Clínica A' },
        { id: '2', nome: 'Clínica B' },
        { id: '3', nome: 'Clínica C' },
    ];

    // Dados fictícios para os médicos (você precisará filtrar isso no mundo real)
    const medicos = [
        { id: '1', nome: 'Dr. João' },
        { id: '2', nome: 'Dra. Maria' },
        { id: '3', nome: 'Dr. Pedro' },
    ];

    const handleNovaConsultaClick = () => {
        setOpenNovaConsulta(true);
    };

    const handleCloseNovaConsulta = () => {
        setOpenNovaConsulta(false);
        setSelectedClinica('');
        setSelectedMedico('');
        setSelectedDateTime(null);
    };

    const handleSalvarNovaConsulta = async () => {
        if (!selectedClinica || !selectedMedico || !selectedDateTime) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const novaConsulta = {
            clinicaId: selectedClinica,
            medicoId: selectedMedico,
            horario: selectedDateTime.toISOString(),
            // Outros campos da consulta
        };

        try {
            const response = await fetch(CREATE_AGENDAMENTO(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(novaConsulta),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao criar consulta');
            }

            alert('Consulta criada com sucesso!');
            handleCloseNovaConsulta();
        } catch (error: any) {
            console.error(error);
            alert(`Erro ao criar consulta: ${error.message}`);
        }
    };

    return (
        <DashboardCard title="Listagem geral de Consultas">
            <>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={handleNovaConsultaClick}
                    >
                        Nova consulta
                    </Button>
                </Box>
                <Box sx={{ overflow: "auto", width: { xs: "280px", sm: "auto" } }}>
                    <Table aria-label="simple table" sx={{ whiteSpace: "nowrap", mt: 2 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Id</TableCell>
                                <TableCell>Data/Hora</TableCell>
                                <TableCell>Médico</TableCell>
                                <TableCell>Paciente</TableCell>
                                <TableCell>Clínica</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {consultas.map((consulta) => (
                                 <StyledTableRow key={consulta.id} onClick={() => handleOpenDetails(consulta)}>
                                    <TableCell>{consulta.id}</TableCell>
                                    <TableCell>{consulta.dateTime}</TableCell>
                                    <TableCell>{consulta.doctorName}</TableCell>
                                    <TableCell>{consulta.patientName}</TableCell>
                                    <TableCell>{consulta.clinicName}</TableCell>
                                    <TableCell>{consulta.status}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleHorariosClick(consulta);
                                            }}
                                            color="secondary">
                                            <AccessTime />
                                        </IconButton>

                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(consulta);
                                            }}
                                            color="primary"
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(consulta);
                                            }}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>

                {/* Modal de Detalhes */}
                <Modal
                    open={openDetails}
                    onClose={handleCloseDetails}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 400,
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Detalhes da Consulta
                        </Typography>
                        {selectedConsulta && (
                            <>
                                <Typography variant="subtitle1">
                                    Médico: {selectedConsulta.medico?.nome}
                                </Typography>
                                <Typography variant="subtitle1">
                                    Horário: {selectedConsulta.horario}
                                </Typography>
                                <Typography variant="subtitle1">
                                    Paciente: {selectedConsulta.paciente?.nome}
                                </Typography>
                            </>
                        )}
                        <Button onClick={handleCloseDetails} sx={{ mt: 3 }} variant="outlined">
                            Fechar
                        </Button>
                    </Box>
                </Modal>

                {/* Modal para Nova Consulta */}
                <Modal open={openNovaConsulta} onClose={handleCloseNovaConsulta}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 400,
                            bgcolor: theme.palette.background.paper,
                            border: `2px solid ${theme.palette.primary.main}`,
                            borderRadius: '8px',
                            boxShadow: theme.shadows[5],
                            p: 4,
                        }}
                    >
                        <Typography variant="h6" gutterBottom textAlign="center">
                            Nova Consulta
                        </Typography>
                        <FormControl fullWidth margin="dense">
                            <InputLabel id="clinica-select-label">Clínica</InputLabel>
                            <Select
                                labelId="clinica-select-label"
                                id="clinica-select"
                                value={selectedClinica}
                                label="Clínica"
                                onChange={(e) => setSelectedClinica(e.target.value as string)}
                            >
                                {clinicas.map((clinica) => (
                                    <MenuItem key={clinica.id} value={clinica.id}>{clinica.nome}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="dense">
                            <InputLabel id="medico-select-label">Médico</InputLabel>
                            <Select
                                labelId="medico-select-label"
                                id="medico-select"
                                value={selectedMedico}
                                label="Médico"
                                onChange={(e) => setSelectedMedico(e.target.value as string)}
                            >
                                {medicos.map((medico) => (
                                    <MenuItem key={medico.id} value={medico.id}>{medico.nome}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="dense">
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateTimePicker
                                    label="Data e Hora"
                                    value={selectedDateTime}
                                    onChange={(newValue) => {
                                        setSelectedDateTime(newValue);
                                    }}
                                    renderInput={(params) => <TextField {...params} />} // Pode ignorar esse erro.
                                />
                            </LocalizationProvider>
                        </FormControl>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                            <Button variant="outlined" color="secondary" onClick={handleCloseNovaConsulta}>
                                Cancelar
                            </Button>
                            <Button variant="contained" color="primary" onClick={handleSalvarNovaConsulta}>
                                Salvar
                            </Button>
                        </Box>
                    </Box>
                </Modal>

                {/* Modal para exibir os horários */}
                <Modal open={openHorarios} onClose={() => setOpenHorarios(false)}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 900,
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                            textAlign: "center",
                        }}
                    >
                        <h2>Horários de {consultaSelecionada?.medico.nome}</h2>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Horário</TableCell>
                                    <TableCell>Disponível</TableCell>
                                    <TableCell>Paciente</TableCell>
                                    <TableCell>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {horarios.length > 0 ? (
                                    horarios.map((horario) => (
                                        <TableRow key={horario.id}>
                                            <TableCell>{new Date(horario.horario).toLocaleString()}</TableCell>
                                            <TableCell>{horario.reservado ? "Não" : "Sim"}</TableCell>
                                            <TableCell>{horario.paciente ? horario.paciente : "—"}</TableCell>
                                            <TableCell>
                                                {!horario.reservado && (
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => reservarHorario(horario.id)}
                                                    >
                                                        Reservar
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            Nenhum horário encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{ mt: 2 }}
                            onClick={() => setOpenHorarios(false)}
                        >
                            Fechar
                        </Button>
                    </Box>
                </Modal>

                {/* Modal de Edição */}
                <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 300,
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Editar Consulta
                        </Typography>
                        {consultaEdit && (
                            <>
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    label="Nome do Médico"
                                    value={consultaEdit.medico.nome}
                                    onChange={(e) =>
                                        setConsultaEdit({
                                            ...consultaEdit,
                                            medico: { ...consultaEdit.medico, nome: e.target.value },
                                        })
                                    }
                                />

                                <TextField
                                    fullWidth
                                    margin="dense"
                                    label="Email do Médico"
                                    value={consultaEdit.medico.email}
                                    onChange={(e) =>
                                        setConsultaEdit({
                                            ...consultaEdit,
                                            medico: { ...consultaEdit.medico, email: e.target.value },
                                        })
                                    }
                                />

                                <TextField
                                    fullWidth
                                    margin="dense"
                                    label="Username"
                                    value={consultaEdit.medico.nomeUsuario}
                                    onChange={(e) =>
                                        setConsultaEdit({
                                            ...consultaEdit,
                                            medico: { ...consultaEdit.medico, nomeUsuario: e.target.value },
                                        })
                                    }
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={consultaEdit.medico.enabled}
                                            onChange={(e) =>
                                                setConsultaEdit({
                                                    ...consultaEdit,
                                                    medico: { ...consultaEdit.medico, enabled: e.target.checked },
                                                })
                                            }
                                            color="primary"
                                        />
                                    }
                                    label="Ativo"
                                />

                                <TextField
                                    fullWidth
                                    margin="dense"
                                    label="RG do Médico"
                                    value={consultaEdit.medico.rg}
                                    onChange={(e) =>
                                        setConsultaEdit({
                                            ...consultaEdit,
                                            medico: { ...consultaEdit.medico, rg: e.target.value },
                                        })
                                    }
                                />

                                <TextField
                                    fullWidth
                                    margin="dense"
                                    label="CPF do Médico"
                                    value={consultaEdit.medico.cpf}
                                    onChange={(e) =>
                                        setConsultaEdit({
                                            ...consultaEdit,
                                            medico: { ...consultaEdit.medico, cpf: e.target.value },
                                        })
                                    }
                                />
                            </>
                        )}
                        <Box
                            sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
                        >
                            <Button variant="contained" color="primary" onClick={handleSave}>
                                Salvar
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => setOpenEdit(false)}
                            >
                                Cancelar
                            </Button>
                        </Box>
                    </Box>
                </Modal>

                {/* Modal de Exclusão */}
                <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 300,
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Deseja realmente excluir? <br></br> Esta ação não pode ser desfeita.
                        </Typography>
                        <Box
                            sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
                        >
                            <Button variant="contained" color="error" onClick={handleDelete}>
                                Excluir
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => setOpenDelete(false)}
                            >
                                Cancelar
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            </>
        </DashboardCard>
    );
};

export default ListagemConsultas;