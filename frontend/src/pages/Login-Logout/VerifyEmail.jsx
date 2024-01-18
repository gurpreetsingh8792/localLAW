import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`http://localhost:8052/verify/${token}`);
        setVerificationStatus(response.data.message);
        // Redirect to login page after a short delay
        setTimeout(() => navigate('/login'), 3000); // 3 seconds delay
      } catch (error) {
        setVerificationStatus(error.response?.data?.error || 'An error occurred during verification.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div>
      <h2>Email Verification</h2>
      <p>{verificationStatus}</p>
    </div>
  );
};

export default VerifyEmail;
