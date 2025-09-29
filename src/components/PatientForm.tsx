import React, { useState, useEffect } from 'react';
import { supabase, Patient, Hospital } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, Save, User } from 'lucide-react';

interface PatientFormProps {
  patient?: Patient | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ patient, onSuccess, onCancel }) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    migrant: false,
    hospital_id: '',
    district: profile?.district || '',
    contact_number: '',
    address: '',
    last_checkup: ''
  });

  const districts = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
    'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
    'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
  ];

  useEffect(() => {
    fetchHospitals();
    if (patient) {
      setFormData({
        name: patient.name,
        age: patient.age.toString(),
        gender: patient.gender,
        migrant: patient.migrant,
        hospital_id: patient.hospital_id,
        district: patient.district,
        contact_number: patient.contact_number || '',
        address: patient.address || '',
        last_checkup: patient.last_checkup ? patient.last_checkup.split('T')[0] : ''
      });
    }
  }, [patient]);

  useEffect(() => {
    if (formData.district) {
      fetchHospitals(formData.district);
    }
  }, [formData.district]);

  const fetchHospitals = async (district?: string) => {
    try {
      let query = supabase.from('hospitals').select('*');
      
      if (district) {
        query = query.eq('district', district);
      } else if (profile?.district) {
        query = query.eq('district', profile.district);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const generatePatientId = () => {
    const prefix = 'KL';
    const timestamp = Date.now().toString().slice(-8);
    return `${prefix}${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const patientData = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender as 'Male' | 'Female' | 'Other',
        migrant: formData.migrant,
        hospital_id: formData.hospital_id,
        district: formData.district,
        contact_number: formData.contact_number.trim() || null,
        address: formData.address.trim() || null,
        last_checkup: formData.last_checkup ? new Date(formData.last_checkup).toISOString() : null
      };

      if (patient) {
        // Update existing patient
        const { error } = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', patient.id);

        if (error) throw error;
      } else {
        // Create new patient
        const { error } = await supabase
          .from('patients')
          .insert({
            ...patientData,
            patient_id: generatePatientId(),
            created_by: profile?.id
          });

        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving patient:', error);
      alert(error.message || 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {patient ? 'Edit Patient' : 'Add New Patient'}
              </h2>
              <p className="text-sm text-gray-600">
                {patient ? 'Update patient information' : 'Enter patient details'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Age *
                </label>
                <input
                  type="number"
                  id="age"
                  required
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                  placeholder="Age"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender *
                </label>
                <select
                  id="gender"
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="migrant"
                  checked={formData.migrant}
                  onChange={(e) => setFormData({ ...formData, migrant: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="migrant" className="ml-2 block text-sm text-gray-900">
                  Migrant Worker
                </label>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Location Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                  District *
                </label>
                <select
                  id="district"
                  required
                  value={formData.district}
                  onChange={(e) => {
                    setFormData({ ...formData, district: e.target.value, hospital_id: '' });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                  disabled={profile?.role === 'doctor' && profile.district}
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="hospital_id" className="block text-sm font-medium text-gray-700">
                  Hospital *
                </label>
                <select
                  id="hospital_id"
                  required
                  value={formData.hospital_id}
                  onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                  disabled={!formData.district}
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.hospital_id} value={hospital.hospital_id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label htmlFor="last_checkup" className="block text-sm font-medium text-gray-700">
                  Last Checkup Date
                </label>
                <input
                  type="date"
                  id="last_checkup"
                  value={formData.last_checkup}
                  onChange={(e) => setFormData({ ...formData, last_checkup: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="address"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                placeholder="Full address"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-900 border border-transparent rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {patient ? 'Update Patient' : 'Add Patient'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;