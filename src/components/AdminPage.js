import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { ConstantsContext } from "./ConstantsContext";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../styles/Home.css";
import Header from "./Header";
import { DataGrid } from '@mui/x-data-grid';
import "../styles/AdminPage.css";
import FormModal from "./FormModal";

const AdminPage = () => {
  const { constants, refreshConstants } = useContext(ConstantsContext);
  const [view, setView] = useState("");
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalFormData, setModalFormData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // State for create activity form
  const [activityName, setActivityName] = useState("");
  const [activityDesc, setActivityDesc] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionDraft, setQuestionDraft] = useState({
    quesDescription: "",
    quesTypeId: "",
    analyticsNeeded: false,
  });

  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [editActivityName, setEditActivityName] = useState("");
  const [editActivityDesc, setEditActivityDesc] = useState("");
  const [editQuestions, setEditQuestions] = useState([]);
  const [deletedQuestions, setDeletedQuestions] = useState([]);

  // Helper functions to get names from ids
  const getZoneName = (id) => {
    if (!id) return "";
    const zoneObj = constants.zones?.find(z => String(z.id) === String(id));
    return zoneObj ? zoneObj.zone : id;
  };
  const getCountryName = (id) => {
    if (!id) return "";
    const countryObj = constants.countries?.find(c => String(c.id) === String(id));
    return countryObj ? countryObj.country : id;
  };
  const getRegionName = (id) => {
    if (!id) return "";
    const regionObj = constants.regions?.find(r => String(r.id) === String(id));
    return regionObj ? regionObj.region : id;
  };
  const getActivityName = (id) => {
    if (!id) return "";
    const activityObj = constants.activities?.find(a => String(a.id) === String(id));
    return activityObj ? activityObj.activity : id;
  };

  const StatusEnum = {
    TO_BE_APPROVED: "To be Approved",
    APPROVED: "Approved"
  };

  // DataGrid columns
  const dataGridColumns = [
    {
      field: "serialNo",
      headerName: "Serial No",
      width: 100
    }, { field: "activity", headerName: "Activity", width: 120 },
    { field: "zone", headerName: "Zone", width: 120 },
    { field: "country", headerName: "Country", width: 120 },
    { field: "region", headerName: "Region", width: 120 },
    { field: "activityDate", headerName: "Activity Date", width: 140 },
    { field: "status", headerName: "Status", width: 160 },
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
          onClick={() => handleViewForm(params.row)}
          style={{
            cursor: "pointer",
            color: "#003366",
            border: "none",
            borderRadius: "4px",
            padding: "6px 16px"
          }}
        >
          View Form
        </button>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <button
          style={{
            cursor: "pointer",
            color: "#fff",
            background: "#003366",
            border: "none",
            borderRadius: "4px",
            padding: "6px 16px"
          }}
          onClick={() => handleApprove(params.row)}
          title="Review Form"
        >
          Review Form
        </button>
      ),
    },
  ];

  // DataGrid rows (must have unique 'id')
  const dataGridRows = rowData.map((row, idx) => ({
    ...row,
    id: row.responseId,
    serialNo: idx + 1
  }));

  const handleViewForm = async (row) => {
    setModalLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/user/form/get?responseId=${row.responseId}`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Fetch forms to be approved
  const fetchToBeApproved = async () => {
    if (view === "approve") {
      setView("");
      return;
    }
    setLoading(true);
    setView("approve");
    try {
      const email = localStorage.getItem("email");
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/user/form/getToBeApproved?userName=${email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch forms");
      const data = await response.json();
      const mapped = data.map(item => ({
        ...item,
        activity: getActivityName(item.activityId),
        zone: getZoneName(item.zone),
        country: getCountryName(item.country),
        region: getRegionName(item.region),
        status: StatusEnum[item.status] || item.status,
      }));
      setRowData(mapped);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const handleApprove = async (row) => {
    if (!window.confirm("Are you sure you want to approve this submission?")) return;
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      const payload = {
        responseId: row.responseId,
        activityId: row.activityId,
        zone: row.zone ? Number(row.zone) : null,
        country: row.country ? Number(row.country) : null,
        region: row.region ? Number(row.region) : null,
        activityDate: row.activityDate,
        answers: row.answers,
        status: "APPROVED",
      };
      const response = await fetch(`/user/form/update/${row.responseId}?userDetails=${email}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to approve the form");
      alert("Form approved successfully!");
      setRowData((prev) =>
        prev.map((item) =>
          item.responseId === row.responseId ? { ...item, status: "APPROVED" } : item
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Remove question from list
  const handleRemoveQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Remove question from list (for edit)
  const handleRemoveEditQuestion = (idx) => {
    setEditQuestions(editQuestions => {
      const q = editQuestions[idx];
      if (q.quesId) {
        setDeletedQuestions(prev => {
          if (!prev.some(dq => dq.quesId === q.quesId)) {
            return [...prev, { ...q, status: "DELETED" }];
          }
          return prev;
        });
        return editQuestions.filter((_, i) => i !== idx);
      } else {
        return editQuestions.filter((_, i) => i !== idx);
      }
    });
  };

  // When user selects an activity to edit
  const handleSelectActivity = (e) => {
    const activityId = e.target.value;
    setSelectedActivityId(activityId);
    if (!activityId) {
      setEditActivityName("");
      setEditActivityDesc("");
      setEditQuestions([]);
      setDeletedQuestions([]);
      return;
    }
    const activity = constants.activities.find(a => String(a.id) === String(activityId));
    setEditActivityName(activity?.activity || "");
    setEditActivityDesc(activity?.activityDesc || "");
    const activityQuestions = constants.questions
      ?.filter(q => String(q.activityId) === String(activityId))
      .map(q => ({
        quesId: q.id,
        quesDescription: q.description,
        quesTypeId: q.questionType,
        analyticsNeeded: q.analyticsNeeded,
        status: "ACTIVE",
        options: q.options || []
      })) || [];
    setEditQuestions(activityQuestions);
    setDeletedQuestions([]);
  };

  // Add option to an edit question
  const handleAddEditOption = (idx) => {
    setEditQuestions(editQuestions =>
      editQuestions.map((q, i) =>
        i === idx ? { ...q, options: [...(q.options || []), ""] } : q
      )
    );
  };

  // Update option value in edit
  const handleEditOptionChange = (qIdx, optIdx, value) => {
    setEditQuestions(editQuestions =>
      editQuestions.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((opt, oi) => oi === optIdx ? value : opt) }
          : q
      )
    );
  };

  // Remove option in edit
  const handleRemoveEditOption = (qIdx, optIdx) => {
    setEditQuestions(editQuestions =>
      editQuestions.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.filter((_, oi) => oi !== optIdx) }
          : q
      )
    );
  };

  // Save edited activity
  const handleSaveEditActivity = async (e) => {
    e.preventDefault();
    if (!editActivityName || !editActivityDesc || (editQuestions.length === 0 && deletedQuestions.length === 0)) {
      alert("Please fill all fields and have at least one question.");
      return;
    }
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");
    const payloadQuestions = [
      ...editQuestions.map(q => ({
        quesId: q.quesId || null,
        quesDescription: q.quesDescription,
        quesTypeId: q.quesTypeId,
        analyticsNeeded: q.analyticsNeeded,
        status: "ACTIVE",
      })),
      ...deletedQuestions.map(q => ({
        quesId: q.quesId,
        quesDescription: q.quesDescription,
        quesTypeId: q.quesTypeId,
        analyticsNeeded: q.analyticsNeeded,
        status: "DELETED",
      })),
    ];
    const payload = {
      activityId: Number(selectedActivityId),
      activityName: editActivityName,
      description: editActivityDesc,
      superType: null,
      questions: payloadQuestions,
    };
    try {
      const response = await fetch(`/saveOrUpdate/activity?userDetails=${email}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update activity");
      alert("Activity updated successfully!");
      setSelectedActivityId("");
      setEditActivityName("");
      setEditActivityDesc("");
      setEditQuestions([]);
      setDeletedQuestions([]);
      setView("");
      await refreshConstants();
    } catch (err) {
      alert(err.message);
    }
  };

  // Add a new empty question row
  const handleAddQuestionRow = () => {
    setQuestions([
      ...questions,
      {
        quesId: null,
        quesDescription: "",
        quesTypeId: "",
        analyticsNeeded: false,
        options: []
      },
    ]);
  };

  // Add option to a question
  const handleAddOption = (idx) => {
    setQuestions(questions =>
      questions.map((q, i) =>
        i === idx ? { ...q, options: [...(q.options || []), ""] } : q
      )
    );
  };

  // Update option value
  const handleOptionChange = (qIdx, optIdx, value) => {
    setQuestions(questions =>
      questions.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((opt, oi) => oi === optIdx ? value : opt) }
          : q
      )
    );
  };

  // Remove option
  const handleRemoveOption = (qIdx, optIdx) => {
    setQuestions(questions =>
      questions.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.filter((_, oi) => oi !== optIdx) }
          : q
      )
    );
  };

  // Add a new empty question row (for edit)
  const handleAddEditQuestionRow = () => {
    setEditQuestions([
      ...editQuestions,
      {
        quesId: null,
        quesDescription: "",
        quesTypeId: "",
        analyticsNeeded: false,
        status: "ACTIVE",
        options: []
      },
    ]);
  };

  // Update a question in the list
  const handleQuestionChange = (idx, field, value) => {
    setQuestions(questions =>
      questions.map((q, i) =>
        i === idx ? { ...q, [field]: field === "quesTypeId" ? Number(value) : value } : q
      )
    );
  };

  // Update a question in the list (for edit)
  const handleEditQuestionChange = (idx, field, value) => {
    setEditQuestions(editQuestions =>
      editQuestions.map((q, i) =>
        i === idx ? { ...q, [field]: field === "quesTypeId" ? Number(value) : value } : q
      )
    );
  };

  // Update analyticsNeeded checkbox
  const handleAnalyticsNeededChange = (idx, checked) => {
    setQuestions(questions =>
      questions.map((q, i) =>
        i === idx ? { ...q, analyticsNeeded: checked } : q
      )
    );
  };

  // Update analyticsNeeded checkbox (for edit)
  const handleEditAnalyticsNeededChange = (idx, checked) => {
    setEditQuestions(editQuestions =>
      editQuestions.map((q, i) =>
        i === idx ? { ...q, analyticsNeeded: checked } : q
      )
    );
  };

  const QuestionTypeEnum = {
    TEXT: "Text",
    "MULTIPLE CHOICE": "Multiple Choice",
    "MULTI SELECT": "Multi Select",
    DATE: "Date",
    NUMBER: "Number"
  };

  // Save activity
  const handleSaveActivity = async (e) => {
    e.preventDefault();
    if (!activityName || !activityDesc || questions.length === 0) {
      alert("Please fill all fields and add at least one question.");
      return;
    }
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");
    const payload = {
      activityId: null,
      activityName,
      description: activityDesc,
      superType: null,
      questions,
    };
    try {
      const response = await fetch(`/saveOrUpdate/activity?userDetails=${email}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to save activity");
      alert("Activity created successfully!");
      setActivityName("");
      setActivityDesc("");
      setQuestions([]);
      setView("");
      await refreshConstants();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="view-submitted-forms-container">
        <Header>
          <Link to="/submit-form" className="auth-btn">Submit a form</Link>
          &nbsp;|&nbsp;
          <Link to="/dashboard" className="auth-btn">View Dashboard</Link>
          &nbsp;|&nbsp;
          <Link to="/home" className="auth-btn">Log out</Link>
        </Header>

        <div style={{ display: "flex", minHeight: "90vh" }}>
          <div className={`side-panel${sidePanelOpen ? " open" : ""}`}>
            <button
              className="side-panel-toggle"
              onClick={() => setSidePanelOpen(open => !open)}
              title={sidePanelOpen ? "Close panel" : "Open panel"}
            >
              {sidePanelOpen ? "←" : "→"}
            </button>
            {sidePanelOpen && (
              <ul className="side-panel-list">
                <li
                  className={view === "approve" ? "active" : ""}
                  onClick={() => {
                    if (view !== "approve") fetchToBeApproved();
                    setView("approve");
                  }}
                >
                  Approve forms
                </li>
                <li
                  className={view === "createActivity" ? "active" : ""}
                  onClick={() => setView("createActivity")}
                >
                  Create a new activity
                </li>
                <li
                  className={view === "editActivity" ? "active" : ""}
                  onClick={() => setView("editActivity")}
                >
                  Edit an existing activity
                </li>
              </ul>
            )}
          </div>

          {view === "approve" && (
            <div style={{ width: "90%", minHeight: 400, textAlign: "center", margin: "0 auto" }}>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <DataGrid
                  rows={dataGridRows}
                  columns={dataGridColumns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 50]}
                  autoHeight
                  disableRowSelectionOnClick
                />
              )}
            </div>
          )}

          {view === "createActivity" && (
            <form
              onSubmit={handleSaveActivity}
              style={{
                width: "70%",
                margin: "0 auto",
                background: "#fff",
                padding: 32,
                borderRadius: 8,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ marginBottom: 16, textAlign: "left" }}>
                <label style={{ display: "block", marginBottom: 4 }}>
                  Activity Name:
                  <input
                    type="text"
                    value={activityName}
                    onChange={e => setActivityName(e.target.value)}
                    required
                    style={{ width: "100%", padding: 8, marginTop: 4 }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: 16, textAlign: "left" }}>
                <label style={{ display: "block", marginBottom: 4 }}>
                  Activity Description:
                  <input
                    type="text"
                    value={activityDesc}
                    onChange={e => setActivityDesc(e.target.value)}
                    required
                    style={{ width: "100%", padding: 8, marginTop: 4, minHeight: 60 }}
                  />
                </label>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h4 style={{ margin: 0 }}>Questions</h4>
                <button
                  type="button"
                  onClick={handleAddQuestionRow}
                  style={{
                    background: "#fff",
                    color: "#003366",
                    border: "2px solid #003366",
                    borderRadius: 4,
                    padding: "4px 10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: 15,
                    minWidth: "unset",
                    width: "auto",
                    lineHeight: 1.2
                  }}
                >
                  + Add question
                </button>
              </div>
              {/* Render all question rows */}
              {questions.length > 0 && (
                <div style={{ marginBottom: 16, width: "100%" }}>
                  <ul style={{ listStyle: "none", padding: 0, width: "100%" }}>
                    {questions.map((q, idx) => (
                      <React.Fragment key={idx}>
                        <li
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 6,
                            width: "100%",
                            flexWrap: "nowrap"
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Question Description"
                            value={q.quesDescription}
                            onChange={e => handleQuestionChange(idx, "quesDescription", e.target.value)}
                            style={{
                              padding: 8,
                              flex: 1,
                              minWidth: 0,
                              resize: "vertical",
                              maxHeight: 200
                            }}
                          />
                          <select
                            value={q.quesTypeId}
                            onChange={e => handleQuestionChange(idx, "quesTypeId", e.target.value)}
                            style={{
                              padding: 8,
                              width: 180,
                              minWidth: 140,
                              maxWidth: 200,
                              flex: "0 0 180px"
                            }}
                          >
                            <option value="">Type</option>
                            {constants.questionTypes?.map(type => (
                              <option key={type.id} value={type.id}>
                                {QuestionTypeEnum[type.type] || type.type}
                              </option>
                            ))}
                          </select>
                          <label style={{ flex: 1, display: "flex", margin: 0, alignItems: "center", minWidth: 140 }}>
                            <input
                              type="checkbox"
                              checked={q.analyticsNeeded}
                              onChange={e => handleAnalyticsNeededChange(idx, e.target.checked)}
                              style={{ marginRight: 4 }}
                            />
                            Analytics
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            style={{
                              background: "transparent",
                              color: "#e74c3c",
                              border: "none",
                              borderRadius: 4,
                              padding: "2px 10px",
                              cursor: "pointer",
                              fontSize: 18,
                              display: "flex",
                              alignItems: "center"
                            }}
                            title="Remove"
                          >
                            &#128465;
                          </button>
                        </li>
                        {/* Render options as a sibling, not inside the question row */}
                        {["2", "3"].includes(String(q.quesTypeId)) && (
                          <li style={{ width: "100%", marginBottom: 6, display: "block" }}>
                            {(q.options || []).map((opt, optIdx) => (
                              <div key={optIdx} style={{ display: "flex", alignItems: "center", gap: 4, width: "100%" }}>
                                <input
                                  type="text"
                                  placeholder={`Option ${optIdx + 1}`}
                                  value={opt}
                                  onChange={e => handleOptionChange(idx, optIdx, e.target.value)}
                                  style={{
                                    padding: 6,
                                    flex: 1,
                                    minWidth: 0,
                                    width: "100%",
                                    boxSizing: "border-box"
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(idx, optIdx)}
                                  style={{
                                    background: "transparent",
                                    color: "#e74c3c",
                                    border: "none",
                                    borderRadius: 4,
                                    padding: "2px 8px",
                                    cursor: "pointer",
                                    fontSize: 16
                                  }}
                                  title="Remove Option"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddOption(idx)}
                              style={{
                                background: "#fff",
                                color: "#003366",
                                border: "1px solid #003366",
                                borderRadius: 4,
                                padding: "2px 8px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: 13,
                                marginTop: 2,
                                alignSelf: "flex-start"
                              }}
                            >
                              + Add Option
                            </button>
                          </li>
                        )}
                      </React.Fragment>
                    ))}
                  </ul>
                </div>
              )}
              <button
                type="submit"
                style={{
                  background: "#003366",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "10px 28px",
                  fontWeight: "bold",
                  fontSize: 16,
                  cursor: "pointer"
                }}
              >
                Save Activity
              </button>
            </form>
          )}

          {view === "editActivity" && (
            <form
              onSubmit={handleSaveEditActivity}
              style={{
                width: 900,
                margin: "0 auto",
                background: "#fff",
                padding: 32,
                borderRadius: 8,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            >
              <h3>Edit an Activity</h3>
              <div style={{ marginBottom: 16 }}>
                <label>
                  Select Activity:
                  <select
                    value={selectedActivityId}
                    onChange={handleSelectActivity}
                    required
                    style={{ width: "100%", padding: 8, marginTop: 4 }}
                  >
                    <option value="">-- Select --</option>
                    {constants.activities?.map(a => (
                      <option key={a.id} value={a.id}>{a.activity}</option>
                    ))}
                  </select>
                </label>
              </div>
              {selectedActivityId && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label>
                      Activity Name:
                      <input
                        type="text"
                        value={editActivityName}
                        onChange={e => setEditActivityName(e.target.value)}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 4 }}
                      />
                    </label>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label>
                      Activity Description:
                      <input
                        type="text"
                        value={editActivityDesc}
                        onChange={e => setEditActivityDesc(e.target.value)}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 4, minHeight: 60 }}
                      />
                    </label>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h4 style={{ margin: 0 }}>Questions</h4>
                    <button
                      type="button"
                      onClick={handleAddEditQuestionRow}
                      style={{
                        background: "#fff",
                        color: "#003366",
                        border: "2px solid #003366",
                        borderRadius: 4,
                        padding: "4px 10px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: 15,
                        minWidth: "unset",
                        width: "auto",
                        lineHeight: 1.2
                      }}
                    >
                      + Add question
                    </button>
                  </div>
                  {editQuestions.length > 0 && (
                    <div style={{ marginBottom: 16, width: "100%" }}>
                      <ul style={{ listStyle: "none", padding: 0, width: "100%" }}>
  {editQuestions.map((q, idx) => (
    <li
      key={q.quesId || idx}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 6,
        width: "100%",
        flexWrap: "nowrap"
      }}
    >
      <input
        type="text"
        placeholder="Question Description"
        value={q.quesDescription}
        onChange={e => handleEditQuestionChange(idx, "quesDescription", e.target.value)}
        style={{
          display: "flex",
          padding: 8,
          minWidth: 0,
          flex: 1
        }}
      />
      <select
        value={q.quesTypeId}
        onChange={e => handleEditQuestionChange(idx, "quesTypeId", e.target.value)}
        style={{
          padding: 8,
          width: 180,
          minWidth: 140,
          maxWidth: 200,
          flex: "0 0 180px"
        }}
      >
        <option value="">Type</option>
        {constants.questionTypes?.map(type => (
          <option key={type.id} value={type.id}>
            {QuestionTypeEnum[type.type] || type.type}
          </option>
        ))}
      </select>
      <label style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        minWidth: 140,
        margin: 0
      }}>
        <input
          type="checkbox"
          checked={q.analyticsNeeded}
          onChange={e => handleEditAnalyticsNeededChange(idx, e.target.checked)}
          style={{ marginRight: 2 }}
        />
        Analytics
      </label>
      <button
        type="button"
        onClick={() => handleRemoveEditQuestion(idx)}
        style={{
          background: "transparent",
          color: "#e74c3c",
          border: "none",
          borderRadius: 4,
          padding: "2px 10px",
          cursor: "pointer",
          fontSize: 18,
          display: "flex",
          alignItems: "center"
        }}
        title="Remove"
      >
        &#128465;
      </button>
    </li>
  ))}
</ul>
{/* Render options blocks below the question list */}
{editQuestions.map((q, idx) =>
  ["2", "3"].includes(String(q.quesTypeId)) && (
    <div key={`options-${q.quesId || idx}`} style={{ width: "100%", marginBottom: 6 }}>
      {(q.options || []).map((opt, optIdx) => (
        <div key={optIdx} style={{ display: "flex", alignItems: "center", gap: 4, width: "100%" }}>
          <input
            type="text"
            placeholder={`Option ${optIdx + 1}`}
            value={opt}
            onChange={e => handleEditOptionChange(idx, optIdx, e.target.value)}
            style={{
              padding: 6,
              flex: 1,
              minWidth: 0,
              width: "100%",
              boxSizing: "border-box"
            }}
          />
          <button
            type="button"
            onClick={() => handleRemoveEditOption(idx, optIdx)}
            style={{
              background: "transparent",
              color: "#e74c3c",
              border: "none",
              borderRadius: 4,
              padding: "2px 8px",
              cursor: "pointer",
              fontSize: 16
            }}
            title="Remove Option"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => handleAddEditOption(idx)}
        style={{
          background: "#fff",
          color: "#003366",
          border: "1px solid #003366",
          borderRadius: 4,
          padding: "2px 8px",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: 13,
          marginTop: 2,
          alignSelf: "flex-start"
        }}
      >
        + Add Option
      </button>
    </div>
  )
)}
                    </div>
                  )}
                  <button
                    type="submit"
                    style={{
                      background: "#003366",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "10px 28px",
                      fontWeight: "bold",
                      fontSize: 16,
                      cursor: "pointer"
                    }}
                  >
                    Save Changes
                  </button>
                </>
              )}
            </form>
          )}
        </div>
        {showModal && modalFormData && (
          <FormModal
            mode="view"
            formData={modalFormData}
            setFormData={setModalFormData}
            constants={constants}
            onClose={handleCloseModal}
            isModal={true}
            loading={modalLoading}
            onSubmit={() => { }}
          />
        )}
      </div>
    </>
  );
};

export default AdminPage;