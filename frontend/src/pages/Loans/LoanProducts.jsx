import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Package
} from 'lucide-react';
import LoanProductService from './LoanProductService';
import useLoanProductWebSocket from '../../hooks/useLoanProductWebSocket';
import AuthService from '../../services/authService';
import NotificationModal from '../../components/NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import DeleteLoanProductModal from './DeleteLoanProductModal';
import Sidebar from '../../components/Layout/Sidebar';
import '../../styles/table-common.css';
import './LoanProducts.css';

const LoanProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // WebSocket for realtime updates
  useLoanProductWebSocket((message) => {
    console.log('Loan Product WebSocket event:', message);
    fetchProducts(); // Refresh list on any event
  });

  // Fetch loan products from API
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Fetching loan products from API...');
      
      const response = await LoanProductService.getAll();
      console.log('✅ Loan products fetched:', response);
      
      setProducts(Array.isArray(response) ? response : []);
      
    } catch (error) {
      console.error('❌ Error fetching loan products:', error);
      setError(error.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    navigate('/loans/products/add');
  };

  const handleViewProduct = (product) => {
    navigate(`/loans/products/view/${product.id}`, { state: { product } });
  };

  const handleEditProduct = (product) => {
    navigate(`/loans/products/edit/${product.id}`, { state: { product } });
  };

  const handleDeleteProduct = (product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    
    try {
      await LoanProductService.delete(deletingProduct.id);
      showSuccess(`Loan Product "${deletingProduct.productName}" deleted successfully`);
      setShowDeleteModal(false);
      setDeletingProduct(null);
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting loan product:', error);
      showError('Failed to delete loan product. Please try again.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingProduct(null);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.interestMethod?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Pagination logic (5 per page to match Loans table)
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    return buttons;
  };

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-content">
            <h1>Loan Products</h1>
            <p className="page-description">Manage loan product offerings and configurations</p>
          </div>
          <button 
            className="add-client-btn"
            onClick={handleAddProduct}
          >
            <Plus size={16} />
            Add Loan Product
          </button>
        </div>

        <div className="clients-content">
          {/* Search Bar */}
          <div className="clients-controls">
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search by product name, code, or interest method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="results-info">
              <p>Showing {filteredProducts.length} loan product{filteredProducts.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Products Table */}
          <div className="clients-table-container">
            {isLoading ? (
              <div className="empty-state">
                <div className="loading">Loading loan products...</div>
              </div>
            ) : error ? (
              <div className="empty-state">
                <Package size={48} />
                <h3>Error Loading Products</h3>
                <p>{error}</p>
                <button className="retry-btn" onClick={fetchProducts}>
                  Retry
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <Package size={48} />
                <h3>No Loan Products Found</h3>
                <p>
                  {searchTerm 
                    ? 'Try adjusting your search criteria.'
                    : 'Get started by creating your first loan product.'
                  }
                </p>
                {!searchTerm && (
                  <button 
                    className="add-client-btn"
                    onClick={handleAddProduct}
                  >
                    <Plus size={16} />
                    Add First Loan Product
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="clients-table">
                  <div className="table-row header-row">
                    <div className="table-cell">Product Name</div>
                    <div className="table-cell">Code</div>
                    <div className="table-cell">Interest Method</div>
                    <div className="table-cell">Rate (%)</div>
                    <div className="table-cell">Default Frequency</div>
                    <div className="table-cell">Processing Fee</div>
                    <div className="table-cell">Penalty Rate</div>
                    <div className="table-cell">Created By</div>
                    <div className="table-cell">Actions</div>
                  </div>
                  
                  {currentProducts.map((product) => (
                    <div key={product.id} className="table-row">
                      <div className="table-cell">
                        <div className="product-name">{product.productName}</div>
                      </div>
                      <div className="table-cell">
                        <span className="product-code">{product.productCode}</span>
                      </div>
                      <div className="table-cell">
                        <span className="interest-method">{product.interestMethod}</span>
                      </div>
                      <div className="table-cell">
                        <span className="rate-value">{product.defaultInterestRate}% {product.ratePer ? `per ${product.ratePer}` : ''}</span>
                      </div>
                      <div className="table-cell">
                        <span className="frequency">{product.defaultRepaymentFrequency || 'N/A'}</span>
                      </div>
                      <div className="table-cell">
                        <span className="fee-value">{product.processingFeeValue || 0}%</span>
                      </div>
                      <div className="table-cell">
                        <span className="fee-value">
                          {product.penaltyRate ? `${product.penaltyRate}% /day` : 'N/A'}
                        </span>
                      </div>
                      <div className="table-cell">
                        <span className="created-by">
                          {product.createdByUserId 
                            ? AuthService.getUserFullNameById(product.createdByUserId)
                            : '-'}
                        </span>
                      </div>
                      <div className="table-cell">
                        <div className="action-buttons">
                          <button 
                            className="action-btn view"
                            onClick={() => handleViewProduct(product)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="action-btn edit"
                            onClick={() => handleEditProduct(product)}
                            title="Edit Product"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleDeleteProduct(product)}
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      <p>Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products</p>
                    </div>
                    <div className="pagination">
                      <button 
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      {renderPaginationButtons()}
                      <button 
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteLoanProductModal
          product={deletingProduct}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {/* Notification Modal */}
      {notification && (
        <NotificationModal
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </div>
  );
};

export default LoanProducts;
