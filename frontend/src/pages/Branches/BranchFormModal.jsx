import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./BranchFormModal.css";

const BranchFormModal = ({ isEditing, initialData, onSubmit, onClose }) => {
  const [form, setForm] = useState({
    branchName: "",
    location: "",
    branchCode: "",
  });

  useEffect(() => {
    if (isEditing && initialData) {
      setForm(initialData);
    }
  }, [isEditing, initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <div className="branch-modal-overlay">
      <div className="branch-modal-card branch-form-card">

        {/* Header */}
        <div className="branch-modal-header">
          <h2>{isEditing ? "Edit Branch" : "Add New Branch"}</h2>
          <X size={22} className="close-icon" onClick={onClose} />
        </div>

        {/* Body */}
        <div className="branch-modal-body">

          {/* Section */}
          <div className="detail-section">
            <h3 className="section-title">
              {isEditing ? "Edit Information" : "Branch Information"}
            </h3>

            <div className="detail-grid">

              {/* Branch Code */}
              <div className="detail-box">
                <label>BRANCH CODE</label>

                {!isEditing ? (
                  <input value="Auto-generated" disabled />
                ) : (
                  <input value={form.branchCode} disabled />
                )}
              </div>

              {/* Branch Name */}
              <div className="detail-box">
                <label>BRANCH NAME</label>
                <input
                  name="branchName"
                  value={form.branchName}
                  onChange={handleChange}
                  placeholder="Enter branch name"
                />
              </div>

              {/* Location */}
              <div className="detail-box">
                <label>LOCATION</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Enter branch location"
                />
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="branch-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Add Branch"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BranchFormModal;
