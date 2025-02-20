import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip, IconButton, Modal, TextField, FormControlLabel, Switch, Button, styled
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';
import {useEffect, useState} from "react";
import {Delete, Edit} from "@mui/icons-material";
import {LIST_CLINICA, UPDATE_CLINICA, DELETE_CLINICA} from "../APIroutes";
import { Clinica } from "../interfaces";
import {useTheme} from "@mui/material/styles";

// Estilização para a linha da tabela com hover
const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        cursor: 'pointer',
    },
}));

const ListagemClinicas = () => {
    const theme = useTheme();

    const [clinicas, setClinicas] = useState<Clinica[]>([]);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [clinicaEdit, setClinicaEdit] = useState<Clinica | null>(null);
    const [clinicaDelete, setClinicaDelete] = useState<Clinica | null>(null);
    const [openClinicDetails, setOpenClinicDetails] = useState(false);
    const [selectedClinicDetails, setSelectedClinicDetails] = useState<Clinica | null>(null);

    useEffect(() => {
        fetch(LIST_CLINICA())
            .then((response) => response.json())
            .then((data) => {
                setClinicas(data);
            })
            .catch((error) => console.error("Erro ao buscar clinicas:", error));
    }, []);

    const handleEditClick = (clinica: Clinica) => {
        setClinicaEdit(clinica);
        setOpenEdit(true);
    };

    const handleDeleteClick = (clinica: Clinica) => {
        setClinicaDelete(clinica);
        setOpenDelete(true);
    };

    const handleSave = () => {
        if (clinicaEdit) {
            fetch(
                UPDATE_CLINICA(clinicaEdit.id),
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(clinicaEdit),
                }
            )
                .then((response) => response.json())
                .then((updatedClinica) => {
                    setClinicas(
                        clinicas.map((p) =>
                            p.id === updatedClinica.id ? updatedClinica : p
                        )
                    );
                    setOpenEdit(false);
                })
                .catch((error) => console.error("Erro ao atualizar clinica:", error));
        }
    };

    const handleDelete = () => {
        if (clinicaDelete) {
            fetch(
                DELETE_CLINICA(clinicaDelete.id),
                {
                    method: "DELETE",
                }
            )
                .then(() => {
                    setClinicas(clinicas.filter((p) => p.id !== clinicaDelete.id));
                    setOpenDelete(false);
                })
                .catch((error) => console.error("Erro ao excluir clinica:", error));
        }
    };

        const handleOpenClinicDetails = (clinica: Clinica) => {
            setSelectedClinicDetails(clinica);
            setOpenClinicDetails(true);
        };

        const handleCloseClinicDetails = () => {
            setOpenClinicDetails(false);
            setSelectedClinicDetails(null);
        };


    return (
        <DashboardCard title="Listagem geral de clinicas">
            <>
                <Box sx={{ overflow: "auto", width: { xs: "280px", sm: "auto" } }}>
                    <Table aria-label="simple table" sx={{ whiteSpace: "nowrap", mt: 2 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nome</TableCell>
                                <TableCell>CNPJ</TableCell>
                                <TableCell>Telefone</TableCell>
                                <TableCell>Horário abertura</TableCell>
                                <TableCell>Horário fechamento</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clinicas.map((clinica) => (
                                <StyledTableRow key={clinica.id} onClick={() => handleOpenClinicDetails(clinica)}>
                                    <TableCell>{clinica.nomeFantasia}</TableCell>
                                    <TableCell>{clinica.cnpj}</TableCell>
                                    <TableCell>{clinica.telefone}</TableCell>
                                    <TableCell>{clinica.horarioAbertura}</TableCell>
                                    <TableCell>{clinica.horarioFechamento}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation(); // Impede que o evento de clique na linha seja disparado
                                                handleEditClick(clinica);
                                            }}
                                            color="primary"
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation(); // Impede que o evento de clique na linha seja disparado
                                                handleDeleteClick(clinica);
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
                <Modal
                    open={openClinicDetails}
                    onClose={handleCloseClinicDetails}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: theme.palette.background.paper,
                        border: `2px solid ${theme.palette.primary.main}`,
                        borderRadius: '8px',
                        boxShadow: theme.shadows[5],
                        p: 4,
                    }}>
                        <Typography id="modal-modal-title" variant="h6" component="h2" mb={2} textAlign="center">
                            Detalhes da Clínica
                        </Typography>
                        {selectedClinicDetails && (
                            <Table aria-label="clinic details table">
                                <TableBody>
                                    <TableRow>
                                        <TableCell component="th" scope="row">Nome:</TableCell>
                                        <TableCell>{selectedClinicDetails.nomeFantasia}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row">CNPJ:</TableCell>
                                        <TableCell>{selectedClinicDetails.cnpj}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row">Telefone:</TableCell>
                                        <TableCell>{selectedClinicDetails.telefone}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row">Horário de Abertura:</TableCell>
                                        <TableCell>{selectedClinicDetails.horarioAbertura}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row">Horário de Fechamento:</TableCell>
                                        <TableCell>{selectedClinicDetails.horarioFechamento}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        )}
                        <Box display="flex" justifyContent="center">
                            <Button onClick={handleCloseClinicDetails} sx={{ mt: 3 }} variant="outlined">Fechar</Button>
                        </Box>
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
                            Editar Clinica
                        </Typography>
                        {clinicaEdit && (
                            <>
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    label="nomeFantasia"
                                    value={clinicaEdit.nomeFantasia}
                                    onChange={(e) =>
                                        setClinicaEdit({ ...clinicaEdit, nomeFantasia: e.target.value })
                                    }
                                />
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    label="cnpj"
                                    value={clinicaEdit.cnpj}
                                    onChange={(e) =>
                                        setClinicaEdit({ ...clinicaEdit, cnpj: e.target.value })
                                    }
                                />
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    label="telefone"
                                    value={clinicaEdit.telefone}
                                    onChange={(e) =>
                                        setClinicaEdit({
                                            ...clinicaEdit,
                                            telefone: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    label="horarioAbertura"
                                    value={clinicaEdit.horarioAbertura}
                                    onChange={(e) =>
                                        setClinicaEdit({ ...clinicaEdit, horarioAbertura: e.target.value })
                                    }
                                />
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    label="horarioFechamento"
                                    value={clinicaEdit.horarioFechamento}
                                    onChange={(e) =>
                                        setClinicaEdit({ ...clinicaEdit, horarioFechamento: e.target.value })
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

export default ListagemClinicas;
