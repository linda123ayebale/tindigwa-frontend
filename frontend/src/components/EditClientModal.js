import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import './EditClientModal.css';

const EditClientModal = ({ client, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    // Profile fields
    surname: '',
    givenName: '',
    age: '',
    nationalIdNumber: '',
    village: '',
    parish: '',
    district: '',
    lengthOfStay: '',
    sourceOfIncome: '',
    passportPhotoUrl: '',
    phoneNumber: '',
    
    // Spouse fields
    spouseName: '',
    spouseId: '',
    
    // Guarantor fields
    guarantorName: '',
    guarantorAge: '',
    guarantorContact: '',
    guarantorNationalId: '',
    guarantorVillage: '',
    guarantorParish: '',
    guarantorDistrict: '',
    guarantorSourceOfIncome: '',
    
    // Employment fields
    employerName: '',
    position: '',
    monthlyIncome: '',
    employmentLength: '',
    
    // Documents
    documents: [],
    agreementSigned: false,
    agreementNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form with client data when client changes
  useEffect(() => {
    if (client && isOpen) {
      setFormData({
        surname: client.surname || '',
        givenName: client.givenName || '',
        age: client.age || '',
        nationalIdNumber: client.nationalIdNumber || '',
        village: client.village || '',
        parish: client.parish || '',
        district: client.district || '',
        lengthOfStay: client.lengthOfStay || '',
        sourceOfIncome: client.sourceOfIncome || '',
        passportPhotoUrl: client.passportPhotoUrl || '',
        phoneNumber: client.phoneNumber || '',
        spouseName: client.spouseName || '',
        spouseId: client.spouseId || '',
        guarantorName: client.guarantorName || '',
        guarantorAge: client.guarantorAge || '',
        guarantorContact: client.guarantorContact || '',
        guarantorNationalId: client.guarantorNationalId || '',
        guarantorVillage: client.guarantorVillage || '',
        guarantorParish: client.guarantorParish || '',
        guarantorDistrict: client.guarantorDistrict || '',
        guarantorSourceOfIncome: client.guarantorSourceOfIncome || '',
        employerName: client.employerName || '',
        position: client.position || '',
        monthlyIncome: client.monthlyIncome || '',
        employmentLength: client.employmentLength || '',
        documents: client.documents || [],
        agreementSigned: client.agreementSigned || false,
        agreementNotes: client.agreementNotes || ''
      });
      setErrors({});
    }
  }, [client?.id, isOpen]); // Only depend on client.id and isOpen

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.surname.trim()) {
      newErrors.surname = 'Surname is required';
    }

    if (!formData.givenName.trim()) {
      newErrors.givenName = 'Given name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.guarantorName.trim()) {
      newErrors.guarantorName = 'Guarantor name is required';
    }

    if (!formData.guarantorContact.trim()) {
      newErrors.guarantorContact = 'Guarantor contact is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the data for submission
      const updatedClientData = {
        ...client, // Keep original client data (id, createdAt, etc.)
        ...formData,
        fullName: `${formData.givenName} ${formData.surname}`,
        updatedAt: new Date().toISOString(),
      };

      await onSave(updatedClientData);
      onClose();
    } catch (error) {
      console.error('Error updating client:', error);
      // You can add error handling here, like showing a toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        surname: '',
        givenName: '',
        age: '',
        nationalIdNumber: '',
        village: '',
        parish: '',
        district: '',
        lengthOfStay: '',
        sourceOfIncome: '',
        passportPhotoUrl: '',
        phoneNumber: '',
        spouseName: '',
        spouseId: '',
        guarantorName: '',
        guarantorAge: '',
        guarantorContact: '',
        guarantorNationalId: '',
        guarantorVillage: '',
        guarantorParish: '',
        guarantorDistrict: '',
        guarantorSourceOfIncome: '',
        employerName: '',
        position: '',
        monthlyIncome: '',
        employmentLength: '',
        documents: [],
        agreementSigned: false,
        agreementNotes: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Client - {client?.fullName}</h2>
          <button 
            className="modal-close-btn" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Personal Information Section */}
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Surname</label>
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    className={`form-input ${errors.surname ? 'error' : ''}`}
                    placeholder="Enter surname"
                    disabled={isSubmitting}
                  />
                  {errors.surname && <span className="error-text">{errors.surname}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Given Name</label>
                  <input
                    type="text"
                    name="givenName"
                    value={formData.givenName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.givenName ? 'error' : ''}`}
                    placeholder="Enter given name"
                    disabled={isSubmitting}
                  />
                  {errors.givenName && <span className="error-text">{errors.givenName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter age"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">National ID Number</label>
                  <input
                    type="text"
                    name="nationalIdNumber"
                    value={formData.nationalIdNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter national ID number"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                    placeholder="Enter phone number"
                    disabled={isSubmitting}
                  />
                  {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Source of Income</label>
                  <input
                    type="text"
                    name="sourceOfIncome"
                    value={formData.sourceOfIncome}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter source of income"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="form-section">
              <h3>Address Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Village</label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter village"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Parish</label>
                  <input
                    type="text"
                    name="parish"
                    value={formData.parish}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter parish"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter district"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Length of Stay</label>
                  <input
                    type="text"
                    name="lengthOfStay"
                    value={formData.lengthOfStay}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter length of stay"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Spouse Information Section */}
            <div className="form-section">
              <h3>Spouse Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Spouse Name</label>
                  <input
                    type="text"
                    name="spouseName"
                    value={formData.spouseName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter spouse name"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Spouse ID</label>
                  <input
                    type="text"
                    name="spouseId"
                    value={formData.spouseId}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter spouse ID"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Guarantor Information Section */}
            <div className="form-section">
              <h3>Guarantor Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Guarantor Name</label>
                  <input
                    type="text"
                    name="guarantorName"
                    value={formData.guarantorName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.guarantorName ? 'error' : ''}`}
                    placeholder="Enter guarantor name"
                    disabled={isSubmitting}
                  />
                  {errors.guarantorName && <span className="error-text">{errors.guarantorName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Guarantor Age</label>
                  <input
                    type="number"
                    name="guarantorAge"
                    value={formData.guarantorAge}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter guarantor age"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Guarantor Contact</label>
                  <input
                    type="text"
                    name="guarantorContact"
                    value={formData.guarantorContact}
                    onChange={handleInputChange}
                    className={`form-input ${errors.guarantorContact ? 'error' : ''}`}
                    placeholder="Enter guarantor contact"
                    disabled={isSubmitting}
                  />
                  {errors.guarantorContact && <span className="error-text">{errors.guarantorContact}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Guarantor National ID</label>
                  <input
                    type="text"
                    name="guarantorNationalId"
                    value={formData.guarantorNationalId}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter guarantor national ID"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Guarantor Village</label>
                  <input
                    type="text"
                    name="guarantorVillage"
                    value={formData.guarantorVillage}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter guarantor village"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Guarantor Source of Income</label>
                  <input
                    type="text"
                    name="guarantorSourceOfIncome"
                    value={formData.guarantorSourceOfIncome}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter guarantor source of income"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Employment Information Section */}
            <div className="form-section">
              <h3>Employment Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Employer Name</label>
                  <input
                    type="text"
                    name="employerName"
                    value={formData.employerName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter employer name"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter position"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Monthly Income</label>
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter monthly income"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Employment Length</label>
                  <input
                    type="text"
                    name="employmentLength"
                    value={formData.employmentLength}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter employment length"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Agreement Section */}
            <div className="form-section">
              <h3>Agreement & Documentation</h3>
              <div className="form-grid">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="agreementSigned"
                      checked={formData.agreementSigned}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <span className="checkbox-text">
                      Client has signed all required agreement forms
                    </span>
                  </label>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Additional Notes</label>
                  <textarea
                    name="agreementNotes"
                    value={formData.agreementNotes}
                    onChange={handleInputChange}
                    className="form-input"
                    rows="3"
                    placeholder="Enter any additional notes..."
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={isSubmitting}
            >
              <Save size={16} />
              {isSubmitting ? 'Updating...' : 'Update Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientModal;
