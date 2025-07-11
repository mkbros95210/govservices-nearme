
import React, { useState, useContext, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { findServiceById, getBreadcrumbs } from './serviceHelper';
import Breadcrumb from './components/Breadcrumb';
import DocumentUploader, { UploadedFileRecord } from './components/DocumentUploader';
import { ServiceContext } from './context/ServiceContext';
import { useAuth } from './context/AuthContext';
import { supabase } from './supabaseClient';
import { FormField } from './types';

const { useParams, Link, useNavigate } = ReactRouterDOM as any;

// Dynamic Form Component, now lives inside BookingPage
const DynamicUserDetailsForm: React.FC<{
  fields: FormField[];
  onDetailsSubmit: (details: Record<string, any>) => void;
}> = ({ fields, onDetailsSubmit }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDetailsSubmit(formData);
  };
  
  const isFormValid = fields.every(field => !field.required || (formData[field.id] && formData[field.id] !== ''));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="p-8 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/50 rounded-2xl">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">Applicant Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map(field => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={field.type}
                id={field.id}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                required={field.required}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="text-center pt-4">
        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full sm:w-auto px-12 py-3 text-base font-bold text-white bg-cyan-500 rounded-xl shadow-lg hover:shadow-xl hover:bg-cyan-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1 disabled:transform-none"
        >
          Save & Proceed to Upload
        </button>
      </div>
    </form>
  );
};


const BookingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userDetails, setUserDetails] = useState<Record<string, any> | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileRecord>({});
  
  const params = useParams();
  const navigate = useNavigate();
  const { allServices, loading: servicesLoading } = useContext(ServiceContext);
  const { user } = useAuth();
  
  const serviceId = Number(params.serviceId);

  const { service, breadcrumbs } = useMemo(() => {
    if (servicesLoading || !serviceId) return { service: null, breadcrumbs: [] };
    const foundService = findServiceById(allServices, serviceId);
    const crumbs = getBreadcrumbs(allServices, serviceId);
    return { service: foundService, breadcrumbs: crumbs };
  }, [allServices, serviceId, servicesLoading]);


  const handleDetailsSubmit = (details: Record<string, any>) => {
    setUserDetails(details);
    setCurrentStep(2);
  };

  const handleDocumentsSubmit = async (files: UploadedFileRecord) => {
    if (!user || !service || !userDetails) return;
    
    setUploadedFiles(files);
    
    try {
        const { data, error } = await supabase.from('bookings').insert({
            user_id: user.id,
            service_id: service.id,
            status: 'Pending',
            user_details: userDetails,
            uploaded_files: files,
        }).select().single();

        if (error) throw error;

        navigate('/payment', { state: { serviceName: service.name, bookingId: data.id, price: service.price } });

    } catch(err) {
        console.error("Failed to create booking:", err);
        alert("There was an error creating your booking. Please try again.");
    }
  };


  if (servicesLoading) {
    return <div className="text-center p-10">Loading...</div>;
  }
  
  if (!service || !service.is_bookable || !service.booking_config) {
    return (
      <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold">Booking Not Available</h2>
        <p className="text-slate-500 mt-2">This service does not have a booking process defined.</p>
        <Link to="/" className="mt-6 inline-block px-6 py-2 text-white bg-cyan-500 rounded-lg hover:bg-cyan-600">Go to Homepage</Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb crumbs={breadcrumbs} />
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/50">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
            Complete Your Booking for {service.name}
          </h2>
           {service.price != null && (
            <div className="inline-block bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-bold text-lg px-4 py-1 rounded-full my-4">
                {service.price === 0 ? 'Total: FREE' : `Total: ₹${service.price}`}
            </div>
           )}
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
             {currentStep === 2
              ? `Step 2: Please upload the required documents.`
              : `Step 1: Please fill in the applicant's details below.`}
          </p>
        </div>
        
        {currentStep === 1 && (
          <DynamicUserDetailsForm 
            fields={service.booking_config.form_fields} 
            onDetailsSubmit={handleDetailsSubmit} 
          />
        )}

        {currentStep === 2 && (
          <DocumentUploader 
            documentRequirements={service.booking_config.document_requirements} 
            serviceId={service.id}
            onDocumentsSubmit={handleDocumentsSubmit} 
          />
        )}
      </div>
    </div>
  );
};

export default BookingPage;