import React, { useState, useEffect } from "react";
import axios from "axios";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import {
  TableContainer,
  Table,
  TableHead,
  Typography,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  TableSortLabel,
  TablePagination,
  Paper,
  IconButton,
  Dialog,
  ListItemText,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControl,
  Grid,
  FormGroup,
  FormControlLabel ,
  InputLabel,
  Select,
  Menu,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const TraineesList = () => {
  const baseUrl = import.meta.env.VITE_PORT_URL;
  const [trainees, setTrainees] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search state
  const [orderBy, setOrderBy] = useState("userUsername"); // Default sort order
  const [sortDirection, setSortDirection] = useState("asc"); // Default sort direction
  const [page, setPage] = useState(0); // Current page for pagination
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [usernameToDelete, setUsernameToDelete] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTrainees, setSelectedTrainees] = useState([]); // State to hold selected trainees
  const [selectedSupervisors, setSelectedSupervisors] = useState([]); // State to hold selected supervisors
  const [supervisors, setSupervisors] = useState([]); // State to hold all supervisors
  const [openAssignDialog, setOpenAssignDialog] = useState(false); // Dialog state
  const navigate = useNavigate();

  const filteredTrainees = trainees.filter((trainee) =>
    trainee.userUsername.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedTrainees = filteredTrainees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const deleteUser = async (userId) => {
    try {
      const response = await axios.delete(
        `${baseUrl}/api/v1/admin/users/${userId}`
      );
      if (response.status === 200) {
        console.log("Trainee deleted successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRequestSort = (event, newOrderBy) => {
    setOrderBy(newOrderBy);
    if (sortDirection === "asc") {
      setSortDirection("desc");
    } else {
      setSortDirection("asc");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 1 when rows per page changes
  };

  const handleDelete = (user) => {
    setUserIdToDelete(user.userId);
    setUsernameToDelete(user.userUsername);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setUserIdToDelete(null);
    setUsernameToDelete("");
  };

  const handleConfirmDelete = () => {
    if (userIdToDelete) {
      deleteUser(userIdToDelete);
      setOpenDeleteDialog(false);
      setUserIdToDelete(null);
      setUsernameToDelete("");
    } else {
      console.error("User ID not available for deletion");
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset page when search term changes
  };

  const handleCheckboxChange = (event, trainee) => {
    if (event.target.checked) {
      setSelectedTrainees((prevSelected) => [...prevSelected, trainee]);
    } else {
      setSelectedTrainees((prevSelected) =>
        prevSelected.filter((item) => item.userId !== trainee.userId)
      );
    }
  };

  const handleAssignToSupervisor = () => {
    setOpenAssignDialog(true);
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
  };

  const handleAssignConfirm = async () => {
    try {
      const traineeIds = selectedTrainees.map((trainee) => trainee.userId);
      const supervisorIds = selectedSupervisors.map(
        (supervisor) => supervisor.userId
      );

      const response = await axios.put(
        `${baseUrl}/api/v1/admin/assign-trainees`,
        {
          traineeIds,
          supervisorIds,
        }
      );

      if (response.status === 200) {
        console.log("Trainees assigned successfully");
        // Refresh the list of trainees after assignment
        fetchTrainees();
        setOpenAssignDialog(false);
        setSelectedTrainees([]);
        setSelectedSupervisors([]);
      } else {
        console.error("Failed to assign trainees");
      }
    } catch (error) {
      console.error("Error assigning trainees:", error);
    }
  };

  const handleSupervisorCheckboxChange = (event, supervisor) => {
    if (event.target.checked) {
      setSelectedSupervisors((prevSelected) => [...prevSelected, supervisor]);
    } else {
      setSelectedSupervisors((prevSelected) =>
        prevSelected.filter((item) => item.userId !== supervisor.userId)
      );
    }
  };

  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ws = XLSX.utils.json_to_sheet(filteredTrainees);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "traineesList" + fileExtension;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  useEffect(() => {
    const fetchTrainees = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/v1/admin/users`);
        if (response.status === 200) {
          const traineeUsers = response.data.filter(
            (item) => item.userRole === "TRAINEE"
          );
          setTrainees(traineeUsers);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchTrainees();
  }, [userIdToDelete]);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/v1/admin/users`);
        if (response.status === 200) {
          const supervisorUsers = response.data.filter(
            (item) => item.userRole === "SUPERVISOR"
          );
          setSupervisors(supervisorUsers);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSupervisors();
  }, [openAssignDialog]);

  return (
    <div style={{ padding: "3rem" }}>
      <div className="flex items-center justify-between mb-4">
        <TextField
          label="Search username"
          variant="standard"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <div>
          <IconButton color="primary" onClick={exportToExcel}>
            <DownloadIcon />
            &nbsp;Export
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAssignToSupervisor}
            disabled={selectedTrainees.length === 0}
          >
            Assign to Supervisor
          </Button>
        </div>
      </div>
      <TableContainer component={Paper}>
        <Table aria-label="trainee table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  checked={selectedTrainees.length === paginatedTrainees.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTrainees(paginatedTrainees);
                    } else {
                      setSelectedTrainees([]);
                    }
                  }}
                />
              </TableCell>
              <TableCell variant="head">
                <TableSortLabel
                  active={orderBy === "userUsername"}
                  direction={sortDirection}
                  onClick={(event) => handleRequestSort(event, "userUsername")}
                >
                  <Typography variant="h6">Username</Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell variant="head">
                <Typography variant="h6">First Name</Typography>
              </TableCell>
              <TableCell variant="head">
                <Typography variant="h6">Last Name</Typography>
              </TableCell>
              <TableCell variant="head">
                <Typography variant="h6">Email</Typography>
              </TableCell>
              <TableCell variant="head">
                <Typography variant="h6">Role</Typography>
              </TableCell>
              <TableCell variant="head">
                <Typography variant="h6">Actions</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTrainees.map((item) => (
              <TableRow key={item.userId} hover>
                <TableCell>
                  <Checkbox
                    checked={selectedTrainees.some(
                      (trainee) => trainee.userId === item.userId
                    )}
                    onChange={(e) => handleCheckboxChange(e, item)}
                  />
                </TableCell>
                <TableCell>{item.userUsername}</TableCell>
                <TableCell>{item.userFirstName}</TableCell>
                <TableCell>{item.userLastName}</TableCell>
                <TableCell>{item.userEmail}</TableCell>
                <TableCell>
                  {item.userRole.charAt(0).toUpperCase() +
                    item.userRole.slice(1).toLowerCase()}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/edit-trainee/${item.userId}`)}
                    color="primary"
                  >
                    <ManageAccountsIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(item)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredTrainees.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Assign Dialog */}
      <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog}>
        <DialogTitle>Assign Supervisors</DialogTitle>
        <DialogContent dividers>
          <Grid container direction="column" alignItems="center">
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormGroup>
                  {supervisors.map((supervisor) => (
                    <FormControlLabel
                      key={supervisor.userId}
                      control={
                        <Checkbox
                          checked={selectedSupervisors.some(
                            (item) => item.userId === supervisor.userId
                          )}
                          onChange={(e) =>
                            handleSupervisorCheckboxChange(e, supervisor)
                          }
                        />
                      }
                      label={supervisor.userUsername}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Grid container justifyContent="center">
            <Button onClick={handleCloseAssignDialog}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAssignConfirm}
            >
              Assign
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Are you sure you want to delete '{usernameToDelete}'?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TraineesList;
