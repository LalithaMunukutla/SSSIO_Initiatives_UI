import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConstantsContext } from "./ConstantsContext";
import { AgGridReact } from "ag-grid-react";
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import "../styles/ViewSubmittedForms.css"; // Import your CSS file for styling
import "../styles/Home.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { FaTrashAlt } from "react-icons/fa";

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([
  ClientSideRowModelModule
]);
const ViewSubmittedForms = () => {
  const [formResponses, setFormResponses] = useState([]);
  const { constants } = useContext(ConstantsContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");
  const StatusEnum = {
  TO_BE_APPROVED: "To be Approved",
  APPROVED: "Approved"
  // Add more statuses as needed
};

  useEffect(() => {
    const fetchSubmittedForms = async () => {
      try {
        const response = await fetch(
          `/user/form/getSubmitted?userName=${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch submitted forms");
        } else if (response.status === 404) {
          throw new Error("You have no submitted responses");
        }
        const data = await response.json();
        setFormResponses(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSubmittedForms();
  }, [email, token]);


  window.addEventListener('error', e => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
      e.stopImmediatePropagation();
    }
  });
  const handleDelete = async (form) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;
    try {
      const response = await fetch(`/user/form/submit?userDetails=${email}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        throw new Error("Failed to delete the form");
      }
      alert("Form deleted successfully!");
      setFormResponses((prev) =>
        prev.filter((item) => item.responseId !== form.responseId)
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Prepare row data with activity name
  const rowData = formResponses.map((form, index) => {
    const activity = constants.activities.find(
      (a) => a.id === form.activityId
    );
    return {
      ...form,
      serialNo: index + 1,
      activityName: activity ? activity.activity : "",
    };
  });

  // AG Grid column definitions
  const columns = [
    {
      headerName: "Serial No",
      field: "serialNo",
      width: 110,
      sortable: true,
      filter: "agNumberColumnFilter",
      floatingFilter: true,
    },
    {
      headerName: "Activity Name",
      field: "activityName",
      sortable: true,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      flex: 1,
    },
    {
      headerName: "Activity Date",
      field: "activityDate",
      sortable: true,
      filter: "agDateColumnFilter",
      floatingFilter: true,
      flex: 1,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      flex: 1,
      valueGetter: (params) => StatusEnum[params.data.status] || params.data.status,
    },
    {
      headerName: "View",
      cellRendererFramework: (params) => (
        <button
          className="view-form-btn"
          style={{ cursor: "pointer", color: "#1976d2", textDecoration: "underline" }}
          title="View Form"
          onClick={() => navigate(`/view-form/${params.data.responseId}`)}
        >
          View Form
        </button>
      ),
      width: 130,
      sortable: false,
      filter: false,
    },
    {
      headerName: "Delete",
      cellRendererFramework: (params) => (
        <button
          className="delete-form-icon-btn"
          onClick={() => handleDelete(params.data)}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          title="Delete Form"
        >
          <FaTrashAlt />
        </button>
      ),
      width: 90,
      sortable: false,
      filter: false,
    },
  ];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="view-submitted-forms-container">
      {/* Header Section */}
      <header className="header">
        <h1 className="title">SSSIO SAI 100 Initiatives Journal</h1>
        <div className="auth-links">
          <Link to="/submit-form" className="auth-btn">Submit a form</Link>
          &nbsp;|&nbsp;
          <Link to="/dashboard" className="auth-btn">View Dashboard</Link>
          &nbsp;|&nbsp;
          <Link to="/home" className="auth-btn">Log out</Link>
        </div>
      </header>

      {/* Content Section */}
      <div className="content">
        {formResponses.length === 0 ? (
          <p className="no-forms-message">You have not submitted any forms yet.</p>
        ) : (
          <div
            className="ag-theme-alpine ag-grid-custom"
            style={{
              width: "100vw",
              height: "calc(100vh - 120px)",
              minHeight: "70vh",
              margin: "0 auto",
            }}
          >
            <AgGridReact
              rowData={rowData}
              columnDefs={columns}
              rowHeight={44}
              domLayout="autoHeight"
              pagination={true}
              paginationPageSize={10}
              suppressRowClickSelection={true}
              autoSizeStrategy={{ type: 'fitGridWidth' }}
              defaultColDef={{
                resizable: true,
                floatingFilter: true,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSubmittedForms;