import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { ConstantsContext } from "./ConstantsContext";
import { AgGridReact } from "ag-grid-react";
import { DataGrid } from "@mui/x-data-grid";
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import "../styles/ViewSubmittedForms.css";
import "../styles/Home.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { FaTrashAlt } from "react-icons/fa";
import FormModal from "./FormModal"; // <-- Import your reusable form component
import Header from "../components/Header";

ModuleRegistry.registerModules([
  ClientSideRowModelModule
]);

const ViewSubmittedForms = () => {
  const [formResponses, setFormResponses] = useState([]);
  const { constants } = useContext(ConstantsContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalFormData, setModalFormData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("roleId");
  const userRoleObj = constants.roles?.find(r => String(r.id) === String(userRole));
  const isAdmin = userRoleObj?.canApprove;
  const StatusEnum = {
    TO_BE_APPROVED: "To be Approved",
    APPROVED: "Approved"
  };

  useEffect(() => {
    fetchSubmittedForms();
  }, [email, token]);

  window.addEventListener('error', e => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
      e.stopImmediatePropagation();
    }
  });

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

  const handleDelete = async (form) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;
    try {
      const payload = {
        responseId: form.responseId,
        activityId: form.activityId,
        zone: form.zone,
        country: form.country,
        region: form.region,
        activityDate: form.activityDate,
        answers: form.answers,
        status: "DELETED",
      };
      const response = await fetch(`/user/form/update/${form.responseId}?userDetails=${email}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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

  const rows = formResponses.map((form, index) => {
  const activity = constants.activities.find(a => a.id === form.activityId);
  const zone = constants.zones.find(z => z.id === form.zone);
  const country = constants.countries.find(c => c.id === form.country);
  const region = constants.regions.find(r => r.id === form.region);
  return {
    id: form.responseId, // DataGrid requires 'id'
    serialNo: index + 1,
    activityName: activity ? activity.activity : "",
    activityDate: form.activityDate,
    zone: zone ? zone.zone : "",
    country: country ? country.country : "",
    region: region ? region.region : "",
    status: StatusEnum[form.status] || form.status,
    raw: form, // keep original form for actions
  };
});

  // Prepare row data with activity name
  const rowData = formResponses.map((form, index) => {
    const activity = constants.activities.find(
      (a) => a.id === form.activityId
    );
    const zone = constants.zones.find(z => z.id === form.zone);
    const country = constants.countries.find(c => c.id === form.country);
    const region = constants.regions.find(r => r.id === form.region);
    return {
      ...form,
      serialNo: index + 1,
      activityName: activity ? activity.activity : "",
      zone: zone ? zone.zone : "",
      country: country ? country.country : "",
      region: region ? region.region : "",
      status: StatusEnum[form.status] || form.status,
        };
  });

  // Handle View Form click
  const handleViewForm = async (responseId) => {
    setModalLoading(true);
    try {
      const response = await fetch(`/user/form/get?responseId=${responseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch form details");
      const data = await response.json();
      setModalFormData(data);
      setShowModal(true);
    } catch (err) {
      alert(err.message);
    }
    setModalLoading(false);
  };

  const handleSaveForm = async () => {
    setModalLoading(true);
    try {
      // Get the correct ids from constants based on selected values (if needed)
      const activityId = constants.activities.find(a => String(a.id) === String(modalFormData.activityId))?.id;
      //const zone = constants.zones.find(z => String(z.id) === String(modalFormData.zone))?.id;
      //const country = constants.countries.find(c => String(c.id) === String(modalFormData.country))?.id;
      //const region = constants.regions.find(r => String(r.id) === String(modalFormData.region))?.id;
      
      // Use question ids from constants for the selected activity
    const activityQuestions = constants.questions?.filter(
      q => String(q.activityId) === String(activityId)
    );
    const answers = {};
    activityQuestions?.forEach(q => {
      answers[q.id] = modalFormData.answers?.[q.id] || "";
    });

      const payload = {
        responseId: modalFormData.responseId,
        activityId: modalFormData.activityId,
        zone: modalFormData.zone ? Number(modalFormData.zone) : null,      // Ensure Long/number
        country: modalFormData.country ? Number(modalFormData.country) : null,  // Ensure Long/number
        region: modalFormData.region ? Number(modalFormData.region) : null,     // Ensure Long/number 
        activityDate: modalFormData.activityDate,
        answers: answers,
        status: "TO_BE_APPROVED",
      };
  
      const response = await fetch(
        `/user/form/update/${modalFormData.responseId}?userDetails=${email}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to save the form");
      alert("Form updated successfully!");
      setShowModal(false);
      // Optionally refresh your grid here if needed
    } catch (err) {
      alert(err.message);
    }
    setModalLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setLoading(true);
      fetchSubmittedForms();
    }, 0);
  };

  // Material UI DataGrid column definitions
  const columns = [
    { field: "serialNo", headerName: "Serial No", width: 110 },
    { field: "activityName", headerName: "Activity Name", flex: 1 },
    { field: "activityDate", headerName: "Activity Date", flex: 1 },
    { field: "zone", headerName: "Zone", flex: 1 },
    { field: "country", headerName: "Country", flex: 1 },
    { field: "region", headerName: "Region", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1, minWdth: 150,
    },
    {
      field: "view",
      headerName: "View",
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <button
          className="view-form-btn"
          title="View Form"
          onClick={() => handleViewForm(params.row.raw.responseId)}
        >
          View Form
        </button>
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <button
          className="delete-form-icon-btn"
          onClick={() => handleDelete(params.row.raw)}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          title="Delete Form"
        >
          <FaTrashAlt />
        </button>
      ),
    },
  ];


  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <>
    {/* <div className="background-blur"></div> */}
    <div className="view-submitted-forms-container">
      {/* Header Section */}
      <Header>
      {isAdmin && (
          <>
            <Link to="/admin" className="auth-btn">Admin Page</Link>
          </>
        )}
        &nbsp;|&nbsp;
          <Link to="/submit-form" className="auth-btn">Submit a form</Link>
          &nbsp;|&nbsp;
          <Link to="/dashboard" className="auth-btn">View Dashboard</Link>
          &nbsp;|&nbsp;
          <Link to="/home" className="auth-btn">Log out</Link>
      </Header>

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
            {/* <AgGridReact
              rowData={rowData}
              columnDefs={columns}
              getRowClass={params => params.data && params.data.status === "APPROVED" ? "ag-row-approved" : ""}
              rowHeight={44}
              domLayout="autoHeight"
              pagination={true}
              paginationPageSize={10}
              suppressRowClickSelection={true}
              suppressMenuHide={false}
              autoSizeStrategy={{ type: 'fitGridWidth' }}
              defaultColDef={{
                resizable: true,
                floatingFilter: true,
                sortable: true,       // <-- ensures sort icons are always visible
    filter: true,
              }}
            /> */}
            <div style={{ width: "100%", height: "calc(100vh - 120px)", minHeight: "70vh", margin: "0 auto" }}>
  <DataGrid
    rows={rows}
    columns={columns}
    pageSize={10}
    rowsPerPageOptions={[10, 20, 50]}
    autoHeight
    getRowClassName={(params) =>
      params.row.status === "Approved" ? "ag-row-approved" : ""
    }
  />
</div>
          </div>
        )}
      </div>

      {/* Form Modal for View */}
      {showModal && modalFormData && (
        <FormModal
          mode="view"
          formData={modalFormData}
          setFormData={setModalFormData}
          constants={constants}
          onClose={handleCloseModal}
          isModal={true}
          loading={modalLoading}
          onSubmit={handleSaveForm}
        />
      )}
    </div>
    </>
    
  );
};

export default ViewSubmittedForms;