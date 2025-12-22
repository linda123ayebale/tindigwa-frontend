import React, { useEffect, useState } from "react";
import { Search, Eye, Edit, Trash2, Plus } from "lucide-react";
import Sidebar from "../../components/Layout/Sidebar";
import api from "../../services/api";
import BranchFormModal from "./BranchFormModal";
import BranchDetailsModal from "./BranchDetailsModal";

import "./AllBranches.css";

const AllBranches = () => {
  const [branches, setBranches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const res = await api.get("/branches");
      setBranches(res);
      setFiltered(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    const results = branches.filter(b =>
      `${b.branchCode} ${b.branchName} ${b.location}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    setFiltered(results);
    setCurrentPage(1);
  }, [searchTerm, branches]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentList = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const openAddModal = () => {
    setSelectedBranch(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const openEditModal = (branch) => {
    setSelectedBranch(branch);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const openDetailsModal = (branch) => {
    setSelectedBranch(branch);
    setIsDetailsOpen(true);
  };

  const deleteBranch = async (branch) => {
    if (!window.confirm("Delete this branch?")) return;

    await api.delete(`/branches/${branch.id}`);
    loadBranches();
  };

  const handleSubmitForm = async (formValues) => {
    if (isEditing) {
      await api.put(`/branches/${selectedBranch.id}`, formValues);
    } else {
      await api.post("/branches", {
        branchName: formValues.branchName,
        location: formValues.location
      });
    }

    setIsFormOpen(false);
    loadBranches();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="page-container">

          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Branches</h1>
          </div>

          {/* Search + Add */}
          <div className="top-actions">
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input
                className="search-input"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="btn-primary add-btn" onClick={openAddModal}>
              <Plus size={16} />
              Add Branch
            </button>
          </div>

          {/* Table */}
          <div className="table-card">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Branch Code</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th className="actions-cell">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="empty-row" colSpan="5">Loading…</td>
                  </tr>
                ) : currentList.length === 0 ? (
                  <tr>
                    <td className="empty-row" colSpan="5">No branches found.</td>
                  </tr>
                ) : (
                  currentList.map((b, i) => (
                    <tr key={b.id}>
                      <td>{indexOfFirst + i + 1}</td>
                      <td>{b.branchCode}</td>
                      <td>{b.branchName}</td>
                      <td>{b.location}</td>

                      <td className="actions-cell">
                        <button className="action-btn action-view" onClick={() => openDetailsModal(b)}>
                          <Eye size={16} />
                        </button>

                        <button className="action-btn action-edit" onClick={() => openEditModal(b)}>
                          <Edit size={16} />
                        </button>

                        <button className="action-btn action-delete" onClick={() => deleteBranch(b)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              <button
                className="pg-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`pg-btn ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="pg-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        {isFormOpen && (
          <BranchFormModal
            isEditing={isEditing}
            initialData={selectedBranch}
            onSubmit={handleSubmitForm}
            onClose={() => setIsFormOpen(false)}
          />
        )}

        {isDetailsOpen && (
          <BranchDetailsModal
            branch={selectedBranch}
            onClose={() => setIsDetailsOpen(false)}
          />
        )}
      </main>
    </div>
  );
};

export default AllBranches;
