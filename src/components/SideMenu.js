import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core";
import Controls from "./controls/Controls";
import { useForm } from "./useForm";
import * as employeeService from "../services/employeeService";

const useStyles = makeStyles({
  sideMenu: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    left: "0px",
    width: "320px",
    height: "100%",
    backgroundColor: "#253053",
  },
  filtersArea: {
    display: "flex",
    marginTop: "250px",
    flexDirection: "column",
    justifyContent: "center",
    padding: "30px",
    backgroundColor: "#f984ef",
  },
});

export default function SideMenu(props) {
  const classes = useStyles();
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    setSelectedDepartment(departmentId);
    props.onDepartmentChange(departmentId);
  };

  console.log("SideMenu selectedDepartment:", selectedDepartment);

  return (
    <div className={classes.sideMenu}>
      <div className={classes.filtersArea}>
        <h2>Filters</h2>
        <Controls.Select
          name="department"
          label="Department"
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          options={employeeService.getDepartmentCollection()}
        />
      </div>
    </div>
  );
}
