import React from "react";
import "../styles/FormModal.css"; // Import your CSS file
import "../styles/Home.css"; // Import your CSS file for styling

const FormModal = ({
  mode, // "submit" | "view" | "approve"
  formData,
  setFormData,
  constants,
  onSubmit,
  onReset,
  onApprove,
  onClose,
  loading,
  error,
  isModal = false,
}) => {
  const readOnly = mode === "approve";
  const showApprove = mode === "approve";
  const showSubmit = mode === "submit";
  const showReset = mode === "submit";
  const showClose = mode === "view" || mode === "approve";
  const showSave = mode === "view";

  // Filter questions for the selected activity
  const activityQuestions = constants.questions?.filter(
    q => String(q.activityId) === String(formData.activityId)
  );

  // Handle click outside modal to close
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      onClose();
    }
  };

  return (
    <div className={isModal ? "modal-backdrop" : ""}
      onClick={isModal ? handleBackdropClick : undefined}>
      <div className={isModal ? "modal-content" : "submit-form-container"}
        style={isModal ? { maxHeight: "90vh", overflowY: "auto" } : {}}
        onClick={e => e.stopPropagation()}>
        {isModal && (
          <button
            className="modal-close"
            style={{
              position: "absolute",
              left: 16,
              top: 16,
              fontSize: 22,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            onClick={onClose}
            title="Close"
          >
            &#8592;
          </button>
        )}
        {/* <h2 style={{ marginTop: isModal ? 0 : undefined }}>
          {mode === "submit"
            ? "Submit a Form"
            : mode === "view"
            ? "View Form"
            : "Approve Form"}
        </h2> */}
        <form
          onSubmit={e => {
            e.preventDefault();
            if (mode === "submit") onSubmit();
            if (mode === "approve") onApprove();
            if (mode === "view" && showSave) onSubmit();
          }}
        >
          {/* Activity */}
          <div className="form-group">
            <label>Activity</label>
            <select
              value={formData.activityId || ""}
              onChange={e =>
                setFormData(f => ({ ...f, activityId: e.target.value }))
              }
              disabled={readOnly}
              required
            >
              <option value="">Select Activity</option>
              {constants.activities.map(a => (
                <option key={a.id} value={a.id}>
                  {a.activity}
                </option>
              ))}
            </select>
          </div>
          {/* Activity Date */}
          <div className="form-group">
            <label>Activity Date</label>
            <input
              type="date"
              value={formData.activityDate || ""}
              onChange={e =>
                setFormData(f => ({ ...f, activityDate: e.target.value }))
              }
              disabled={readOnly}
              required
            />
          </div>
          {/* Zone, Country, Region */}
          <div className="form-group">
            <label>Zone</label>
            <select
              value={formData.zone || ""}
              onChange={e =>
                setFormData(f => ({ ...f, zone: e.target.value }))
              }
              disabled={readOnly}
              required
            >
              <option value="">Select Zone</option>
              {constants.zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.zone}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Country</label>
            <select
              value={formData.country || ""}
              onChange={e =>
                setFormData(f => ({ ...f, country: e.target.value }))
              }
              disabled={readOnly}
              required
            >
              <option value="">Select Country</option>
              {constants.countries.map(c => (
                <option key={c.id} value={c.id}>
                  {c.country}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Region</label>
            <select
              value={formData.region || ""}
              onChange={e =>
                setFormData(f => ({ ...f, region: e.target.value }))
              }
              disabled={readOnly}
              required
            >
              <option value="">Select Region</option>
              {constants.regions.map(r => (
                <option key={r.id} value={r.id}>
                  {r.region}
                </option>
              ))}
            </select>
          </div>
          {/* Dynamic Questions */}
          <div className="form-section">
            <h3>Questions</h3>
            {(!formData.activityId || !activityQuestions || activityQuestions.length === 0) ? (
              <div style={{ color: "#b00020", marginBottom: 12 }}>
                There are no questions in this activity
              </div>
            ) : (
              activityQuestions.map(q => (
                <div className="form-group" key={q.id}>
                  <label>{q.description}</label>
                  {q.typeName === "NUMBER" ? (
                    <input
                      type="number"
                      value={formData.answers?.[q.id] || ""}
                      onChange={e =>
                        setFormData(f => ({
                          ...f,
                          answers: {
                            ...f.answers,
                            [q.id]: e.target.value.replace(/[^0-9]/g, "")
                          }
                        }))
                      }
                      disabled={readOnly}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  ) : q.typeName === "DATE" ? (
                    <input
                      type="date"
                      value={formData.answers?.[q.id] || ""}
                      onChange={e =>
                        setFormData(f => ({
                          ...f,
                          answers: { ...f.answers, [q.id]: e.target.value }
                        }))
                      }
                      disabled={readOnly}
                    />
                  ) : q.typeName === "MULTIPLE CHOICE" ? (
                    <select
                      value={formData.answers?.[q.id] || ""}
                      onChange={e =>
                        setFormData(f => ({
                          ...f,
                          answers: { ...f.answers, [q.id]: e.target.value }
                        }))
                      }
                      disabled={readOnly}
                      required
                    >
                      <option value="">Select an option</option>
                      {q.options.map(opt => (
                        <option key={opt.id} value={opt.description}>
                          {opt.description}
                        </option>
                      ))}
                    </select>
                  ) : q.typeName === "MULTI SELECT" ? (
                    <select
                      multiple
                      value={formData.answers?.[q.id] || []}
                      onChange={e => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setFormData(f => ({
                          ...f,
                          answers: { ...f.answers, [q.id]: selected }
                        }));
                      }}
                      disabled={readOnly}
                      required
                    >
                      {q.options.map(opt => (
                        <option key={opt.id} value={opt.description}>
                          {opt.description}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.answers?.[q.id] || ""}
                      onChange={e =>
                        setFormData(f => ({
                          ...f,
                          answers: {
                            ...f.answers,
                            [q.id]: e.target.value.replace(/[^a-zA-Z0-9 ]/g, "")
                          }
                        }))
                      }
                      disabled={readOnly}
                    />
                  )}
                </div>
              ))
            )}
          </div>
          {error && <div className="error">{error}</div>}
          {/* Buttons */}
          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            {showSubmit && (
              <button
                className="submit-btn"
                type="submit"
                disabled={loading}
              >
                Submit
              </button>
            )}
            {showReset && (
              <button
                className="submit-btn"
                type="button"
                style={{ background: "#888" }}
                onClick={onReset}
                disabled={loading}
              >
                Reset
              </button>
            )}
            {showClose && (
              <button
                className="submit-btn"
                type="button"
                onClick={onClose}
                style={{ marginLeft: "auto" }}
              >
                Close
              </button>
            )}
            {showApprove && (
              <button
                className="submit-btn"
                type="submit"
                disabled={loading || formData.status === "APPROVED"}
                style={{ marginLeft: "auto" }}
              >
                {formData.status === "APPROVED"
                  ? "Already Approved"
                  : "Approve"}
              </button>
            )}
            {showSave && (
              <button
                className="submit-btn"
                type="submit"
                disabled={loading}
                style={{ marginLeft: "auto" }}
              >
                Save
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;