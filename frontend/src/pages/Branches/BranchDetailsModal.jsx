import React from "react";
import "./BranchDetailsModal.css";
import { X } from "lucide-react";

const BranchDetailsModal = ({ branch, onClose }) => {
  if (!branch) return null;

  return (
    <div className="branch-modal-overlay">
      <div className="branch-modal-card">

        {/* Header */}
        <div className="branch-modal-header">
          <h2>Branch Details</h2>
          <X size={22} className="close-icon" onClick={onClose} />
        </div>

        {/* Body */}
        <div className="branch-modal-body">

          <div className="detail-section">
            <h3 className="section-title">Basic Information</h3>

            <div className="detail-grid">

              <div className="detail-box">
                <label>BRANCH CODE</label>
                <p>{branch.branchCode}</p>
              </div>

              <div className="detail-box">
                <label>BRANCH NAME</label>
                <p>{branch.branchName}</p>
              </div>

              <div className="detail-box">
                <label>LOCATION</label>
                <p>{branch.location}</p>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="branch-modal-footer">
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>

      </div>
    </div>
  );
};

export default BranchDetailsModal;
