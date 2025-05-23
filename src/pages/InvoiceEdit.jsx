
import React from 'react';
import { useParams } from 'react-router-dom';
import InvoiceForm from './InvoiceForm';

const InvoiceEdit = () => {
  const { id } = useParams();

  return <InvoiceForm id={id} />;
};

export default InvoiceEdit;
