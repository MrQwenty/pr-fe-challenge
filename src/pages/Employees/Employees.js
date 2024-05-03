import React, { useState, useEffect } from "react";
import EmployeeForm from "./EmployeeForm";
import PageHeader from "../../components/PageHeader";
import PeopleOutlineTwoToneIcon from "@material-ui/icons/PeopleOutlineTwoTone";
import {
  Paper,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  InputAdornment,
  Checkbox,
  Typography,
} from "@material-ui/core";
import useTable from "../../components/useTable";
import * as employeeService from "../../services/employeeService";
import Controls from "../../components/controls/Controls";
import { Search } from "@material-ui/icons";
import AddIcon from "@material-ui/icons/Add";
import Popup from "../../components/Popup";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import CloseIcon from "@material-ui/icons/Close";
import Notification from "../../components/Notification";
import ConfirmDialog from "../../components/ConfirmDialog";

const useStyles = makeStyles((theme) => ({
  pageContent: {
    margin: theme.spacing(5),
    padding: theme.spacing(3),
  },
  searchInput: {
    width: "75%",
  },
  newButton: {
    position: "absolute",
    right: "10px",
  },
  deleteButton: {
    marginRight: theme.spacing(2),
  },
}));

const headCells = [
  { id: "", label: "" },
  { id: "fullName", label: "Employee Name" },
  { id: "email", label: "Email Address (Personal)" },
  { id: "mobile", label: "Mobile Number" },
  { id: "department", label: "Department" },
  { id: "actions", label: "Actions", disableSorting: true },
];

export default function Employees({ selectedDepartment }) {
  const classes = useStyles();
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filterFn, setFilterFn] = useState({
    fn: (items) => {
      if (selectedDepartment === "") return items;
      else
        return items.filter(
          (x) => x.departmentId === parseInt(selectedDepartment)
        );
    },
  });
  const [openPopup, setOpenPopup] = useState(false);
  const [notify, setNotify] = useState({
    isOpen: false,
    message: "",
    type: "",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    subTitle: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    const employees = employeeService.getAllEmployees();
    setRecords(employees);
  }, []);

  useEffect(() => {
    setFilterFn((prevFilter) => ({
      ...prevFilter,
      fn: (items) => {
        if (selectedDepartment === "") return items;
        else
          return items.filter(
            (x) => x.departmentId === parseInt(selectedDepartment)
          );
      },
    }));
  }, [selectedDepartment]);

  const handleSearch = (e) => {
    let target = e.target;
    setFilterFn({
      fn: (items) => {
        if (target.value === "") return items;
        else {
          const searchTerm = target.value.toLowerCase();
          return items.filter((x) =>
            x.fullName.toLowerCase().includes(searchTerm)
          );
        }
      },
    });
  };

  const addOrEdit = (employee, resetForm) => {
    if (employee.id === 0) {
      employeeService.insertEmployee(employee);
    } else {
      employeeService.updateEmployee(employee);
    }
    resetForm();
    setRecordForEdit(null);
    setOpenPopup(false);
    setNotify({
      isOpen: true,
      message: "Submitted Successfully",
      type: "success",
    });
    const employees = employeeService.getAllEmployees();
    setRecords(employees);
  };

  const openInPopup = (item) => {
    setRecordForEdit(item);
    setOpenPopup(true);
  };

  const onDelete = (id) => {
    employeeService.deleteEmployee(id);
    setRecords((prevRecords) =>
      prevRecords.filter((record) => record.id !== id)
    );
    setNotify({
      isOpen: true,
      message: "Deleted Successfully",
      type: "error",
    });
    setConfirmDialog({
      ...confirmDialog,
      isOpen: false,
    });
  };

  const handleDelete = () => {
    if (selected.length === 0) {
      setConfirmDialog({
        isOpen: true,
        title: "Are you sure you want to delete this record?",
        subTitle: "You can't undo this operation",
        onConfirm: () => {
          onDelete(recordForEdit.id);
          setConfirmDialog({
            ...confirmDialog,
            isOpen: false,
          });
        },
      });
    } else {
      setConfirmDialog({
        isOpen: true,
        title: "Are you sure you want to delete the selected records?",
        subTitle: "You can't undo this operation",
        onConfirm: () => {
          selected.forEach((id) => {
            onDelete(id);
          });
          setSelected([]);
          setConfirmDialog({
            ...confirmDialog,
            isOpen: false,
          });
        },
      });
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = records.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleCheckboxClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const { TblContainer, TblHead, TblPagination, recordsAfterPagingAndSorting } =
    useTable(records, headCells, filterFn);

  return (
    <>
      <PageHeader
        title="New Employee"
        subTitle="Form design with validation"
        icon={<PeopleOutlineTwoToneIcon fontSize="large" />}
      />
      <Paper className={classes.pageContent}>
        <Toolbar>
          <Controls.Input
            label="Search Employees"
            className={classes.searchInput}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            onChange={handleSearch}
          />
          <Controls.Button
            text="Add New"
            variant="outlined"
            startIcon={<AddIcon />}
            className={classes.newButton}
            onClick={() => {
              setOpenPopup(true);
              setRecordForEdit(null);
            }}
          />
          {selected.length > 1 && (
            <Controls.Button
              text="Delete"
              variant="outlined"
              color="secondary"
              startIcon={<CloseIcon />}
              className={classes.deleteButton}
              onClick={handleDelete}
            />
          )}
        </Toolbar>
        <TableContainer>
          <Table>
            <TblHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selected.length > 0 && selected.length < records.length
                    }
                    checked={selected.length === records.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                {headCells.map((headCell) => (
                  <TableCell key={headCell.id}>{headCell.label}</TableCell>
                ))}
              </TableRow>
            </TblHead>
            <TableBody>
              {recordsAfterPagingAndSorting().map((item) => {
                const isItemSelected = isSelected(item.id);
                const labelId = `enhanced-table-checkbox-${item.id}`;
                return (
                  <TableRow
                    hover
                    onClick={(event) => handleCheckboxClick(event, item.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={item.id}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        inputProps={{ "aria-labelledby": labelId }}
                      />
                    </TableCell>
                    <TableCell>{item.fullName}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.mobile}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell>
                      <Controls.ActionButton
                        color="primary"
                        onClick={() => {
                          openInPopup(item);
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </Controls.ActionButton>
                      <Controls.ActionButton
                        color="secondary"
                        onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            title:
                              "Are you sure you want to delete this record?",
                            subTitle: "You can't undo this operation",
                            onConfirm: () => {
                              onDelete(item.id);
                            },
                          });
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </Controls.ActionButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TblPagination />
      </Paper>
      <Popup
        title="Employee Form"
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
      >
        <EmployeeForm recordForEdit={recordForEdit} addOrEdit={addOrEdit} />
      </Popup>
      <Notification notify={notify} setNotify={setNotify} />
      <ConfirmDialog
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
    </>
  );
}
