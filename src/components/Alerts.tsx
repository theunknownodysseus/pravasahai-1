import React, { useEffect, useState } from 'react';
import { supabase, DiseaseCase, Patient } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  AlertTriangle, 
  Calendar, 
  User, 
  MapPin, 
  Bell,
  CheckCircle,
  XCircle,
  Info,
  Clock
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'vaccine_due' | 'medication_reminder' | 'follow_up' | 'tb_screening' | 'high_risk_area';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  patient_id?: string;
  patient_name?: string;
  district?: string;
  due_date?: string;
  created_at: string;
}

const Alerts: React.FC = () => {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    generateAlerts();
  }, [profile]);

  const generateAlerts = async () => {
    try {
      setLoading(true);
      const generatedAlerts: Alert[] = [];

      // Fetch patients and disease cases
      let patientsQuery = supabase.from('patients').select('*');
      let casesQuery = supabase.from('disease_cases').select('*');

      if (profile?.role === 'doctor' && profile.district) {
        patientsQuery = patientsQuery.eq('district', profile.district);
        casesQuery = casesQuery.eq('district', profile.district);
      }

      const [
        { data: patients, error: patientsError },
        { data: cases, error: casesError },
        { data: districts, error: districtsError }
      ] = await Promise.all([
        patientsQuery,
        casesQuery,
        supabase.from('districts').select('*')
      ]);

      if (patientsError) throw patientsError;
      if (casesError) throw casesError;

      // Generate vaccine due alerts
      patients?.forEach(patient => {
        if (patient.last_checkup) {
          const lastCheckup = new Date(patient.last_checkup);
          const daysSinceCheckup = Math.floor((Date.now() - lastCheckup.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceCheckup > 365) {
            generatedAlerts.push({
              id: `vaccine_${patient.id}`,
              type: 'vaccine_due',
              priority: 'high',
              title: 'Annual Vaccination Due',
              message: `Patient ${patient.name} is due for annual vaccination (last checkup: ${lastCheckup.toLocaleDateString()})`,
              patient_id: patient.patient_id,
              patient_name: patient.name,
              district: patient.district,
              due_date: new Date(lastCheckup.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString()
            });
          } else if (daysSinceCheckup > 300) {
            generatedAlerts.push({
              id: `checkup_${patient.id}`,
              type: 'follow_up',
              priority: 'medium',
              title: 'Annual Checkup Approaching',
              message: `Patient ${patient.name} should schedule annual checkup soon`,
              patient_id: patient.patient_id,
              patient_name: patient.name,
              district: patient.district,
              due_date: new Date(lastCheckup.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString()
            });
          }
        }
      });

      // Generate TB screening alerts for high-risk patients
      const migrantPatients = patients?.filter(p => p.migrant) || [];
      migrantPatients.forEach(patient => {
        if (!patient.last_checkup || 
            (Date.now() - new Date(patient.last_checkup).getTime()) > (180 * 24 * 60 * 60 * 1000)) {
          generatedAlerts.push({
            id: `tb_screening_${patient.id}`,
            type: 'tb_screening',
            priority: 'high',
            title: 'TB Screening Required',
            message: `Migrant worker ${patient.name} requires TB screening (high-risk category)`,
            patient_id: patient.patient_id,
            patient_name: patient.name,
            district: patient.district,
            due_date: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
        }
      });

      // Generate medication reminders for active cases
      const activeCases = cases?.filter(c => c.outcome === 'Under Treatment') || [];
      activeCases.forEach(case_item => {
        const admissionDate = new Date(case_item.admission_date);
        const daysSinceAdmission = Math.floor((Date.now() - admissionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceAdmission > 14) {
          generatedAlerts.push({
            id: `medication_${case_item.id}`,
            type: 'medication_reminder',
            priority: case_item.severity === 'Critical' ? 'urgent' : 'medium',
            title: 'Medication Follow-up Required',
            message: `Patient with ${case_item.disease_name} requires medication review (${daysSinceAdmission} days since admission)`,
            patient_id: case_item.patient_id,
            district: case_item.district,
            due_date: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
        }
      });

      // Generate high-risk area alerts
      const districtRisks = districts?.filter(d => d.risk_ratings?.overall_risk > 6) || [];
      districtRisks.forEach(district => {
        const recentCases = cases?.filter(c => 
          c.district === district.district_name && 
          (Date.now() - new Date(c.admission_date).getTime()) < (7 * 24 * 60 * 60 * 1000)
        ).length || 0;

        if (recentCases > 5) {
          generatedAlerts.push({
            id: `high_risk_${district.id}`,
            type: 'high_risk_area',
            priority: 'urgent',
            title: 'High Risk Area Alert',
            message: `${district.district_name} district showing increased disease activity (${recentCases} cases in last 7 days)`,
            district: district.district_name,
            due_date: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
        }
      });

      // Sort alerts by priority and date
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      generatedAlerts.sort((a, b) => {
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setAlerts(generatedAlerts);
    } catch (error) {
      console.error('Error generating alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'vaccine_due':
        return <Calendar className="w-5 h-5" />;
      case 'medication_reminder':
        return <Bell className="w-5 h-5" />;
      case 'follow_up':
        return <Clock className="w-5 h-5" />;
      case 'tb_screening':
        return <User className="w-5 h-5" />;
      case 'high_risk_area':
        return <MapPin className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getAlertColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.priority === filter
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Health Alerts</h1>
          <p className="text-gray-600">
            Monitor important health notifications and reminders
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={generateAlerts}
            className="inline-flex items-center px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
          >
            <Bell className="w-4 h-4 mr-2" />
            Refresh Alerts
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(['urgent', 'high', 'medium', 'low'] as const).map(priority => {
          const count = alerts.filter(a => a.priority === priority).length;
          return (
            <div key={priority} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">{priority} Priority</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <div className={`p-2 rounded-full ${
                  priority === 'urgent' ? 'bg-red-100' :
                  priority === 'high' ? 'bg-orange-100' :
                  priority === 'medium' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  <AlertTriangle className={`w-4 h-4 ${getIconColor(priority)}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'All health indicators are currently within normal ranges'
                : `No ${filter} priority alerts at this time`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="p-6">
                <div className={`border rounded-lg p-4 ${getAlertColor(alert.priority)}`}>
                  <div className="flex items-start space-x-4">
                    <div className={`mt-1 ${getIconColor(alert.priority)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{alert.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          alert.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          alert.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{alert.message}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs">
                        {alert.patient_name && (
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {alert.patient_name}
                          </div>
                        )}
                        {alert.district && (
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {alert.district}
                          </div>
                        )}
                        {alert.due_date && (
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Due: {new Date(alert.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;