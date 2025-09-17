import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddClientForm from '../../components/AddClientForm';

const AddClient = () => {
  const navigate = useNavigate();

  const handleAddClient = async (clientData) => {
    try {
      // Here you would make an API call to save the client
      console.log('Adding client:', clientData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Client added successfully!');
      
      // Navigate back to clients list
      navigate('/clients');
      
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Failed to add client. Please try again.');
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/clients');
  };

  return (
    <AddClientForm
      isOpen={true}
      onSubmit={handleAddClient}
      onCancel={handleCancel}
    />
  );
};

export default AddClient;
