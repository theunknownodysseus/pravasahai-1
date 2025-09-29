import React, { useEffect, useState } from 'react';
import { supabase, Patient } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Filter, CreditCard as Edit3, Trash2, User, Calendar, MapPin, Phone } from 'lucide-react';
import PatientForm from './PatientForm';

const PatientList: React.FC = () => {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMigrant, setFilterMigrant] = useState<'all' | 'migrant' | 'local'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  useEffect(() => {
    fetchPatients();
  }, [profile]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      let query = supabase.from('patients').select('*');

      // Filter by district if doctor
      if (profile?.role === 'doctor' && profile.district) {
        query = query.eq('district', profile.district);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) throw error;
      
      setPatients(patients.filter(p => p.id !== patientId));
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Failed to delete patient');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPatient(null);
    fetchPatients();
  };

  // Filter patients based on search and filter criteria
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contact_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterMigrant === 'all' ||
      (filterMigrant === 'migrant' && patient.migrant) ||
      (filterMigrant === 'local' && !patient.migrant);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600">
            {profile?.role === 'doctor' && profile.district
              ? `Managing patients in ${profile.district} district`
              : 'Manage patient records'
            }
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, ID, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="w-4 h-4 text-gray-400 mr-2" />
              <select
                value={filterMigrant}
                onChange={(e) => setFilterMigrant(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Patients</option>
                <option value="migrant">Migrant Workers</option>
                <option value="local">Local Residents</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredPatients.length} of {patients.length} patients
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterMigrant !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'Get started by adding your first patient'
              }
            </p>
            {!searchTerm && filterMigrant === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Patient
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        patient.migrant ? 'bg-orange-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {patient.name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            ID: {patient.patient_id}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            patient.migrant 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {patient.migrant ? 'Migrant' : 'Local'}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {patient.age} years, {patient.gender}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {patient.district}
                          </div>
                          {patient.contact_number && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {patient.contact_number}
                            </div>
                          )}
                          {patient.last_checkup && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Last checkup: {new Date(patient.last_checkup).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingPatient(patient);
                        setShowForm(true);
                      }}
                      className="inline-flex items-center p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(patient.id)}
                      className="inline-flex items-center p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patient Form Modal */}
      {showForm && (
        <PatientForm
          patient={editingPatient}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default PatientList;