// frontend/src/components/admin/CreateAdminForm.js
import React, { useState } from 'react';
import { createAdmin } from '../../services/admin';

const CreateAdminForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyId: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAdmin(formData);
      // Handle success (e.g., show notification, reset form)
    } catch (error) {
      // Handle error
    }
  };

  // ... rest of the component
};

// frontend/src/components/admin/CreateCompanyForm.js
// Similar structure for company creation