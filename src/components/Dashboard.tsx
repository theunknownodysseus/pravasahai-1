import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { supabase } from "../config/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Users, TrendingUp, AlertTriangle } from "lucide-react";

interface DashboardStats {
  totalPatients: number;
  totalCases: number;
  migrantCases: number;
  severeCases: number;
  recentCases: number;
  districtsAffected: number;
}

interface ChartData {
  districtCases: Array<{ name: string; total: number; migrant: number; local: number }>;
  severityData: Array<{ name: string; value: number; color: string }>;
  trendData: Array<{ date: string; cases: number; migrant: number }>;
  diseaseData: Array<{ name: string; cases: number }>;
}

const Dashboard: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalCases: 0,
    migrantCases: 0,
    severeCases: 0,
    recentCases: 0,
    districtsAffected: 0,
  });
  const [chartData, setChartData] = useState<ChartData>({
    districtCases: [],
    severityData: [],
    trendData: [],
    diseaseData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [authLoading, profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // ✅ Patients count
      const { count: patientsCount, error: patientsError } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true });
      if (patientsError) throw patientsError;

      // ✅ Cases count
      const { count: casesCount, error: casesError } = await supabase
        .from("disease_cases")
        .select("*", { count: "exact", head: true });
      if (casesError) throw casesError;

      console.log("📊 Patients count:", patientsCount);
      console.log("📊 Cases count:", casesCount);

      // ✅ Get sample cases for charts
      let casesQuery = supabase
        .from("disease_cases")
        .select("id, disease_name, admission_date, is_migrant_patient, severity, district")
        .order("admission_date", { ascending: false })
        .limit(1000);

      if (profile?.role === "doctor" && profile.district) {
        casesQuery = casesQuery.eq("district", profile.district);
      }

      const { data: cases, error: casesDataError } = await casesQuery;
      if (casesDataError) throw casesDataError;

      console.log("📊 Sample cases fetched:", cases?.length);

      // ✅ Derive stats
      const migrantCases = cases?.filter((c) => c.is_migrant_patient).length || 0;
      const severeCases =
        cases?.filter((c) => ["Severe", "Critical"].includes(c.severity)).length || 0;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentCases =
        cases?.filter((c) => new Date(c.admission_date) >= weekAgo).length || 0;

      const affectedDistricts = new Set(cases?.map((c) => c.district)).size;

      setStats({
        totalPatients: patientsCount || 0,
        totalCases: casesCount || 0,
        migrantCases,
        severeCases,
        recentCases,
        districtsAffected: affectedDistricts,
      });

      prepareChartData(cases || []);
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (cases: any[]) => {
    // District Cases
    const districtMap = new Map();
    cases.forEach((c) => {
      const d = c.district;
      if (!districtMap.has(d)) {
        districtMap.set(d, { total: 0, migrant: 0, local: 0 });
      }
      const stats = districtMap.get(d);
      stats.total++;
      c.is_migrant_patient ? stats.migrant++ : stats.local++;
    });
    const districtCases = Array.from(districtMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Severity
    const severityMap = {
      Mild: { value: 0, color: "#16a34a" },
      Moderate: { value: 0, color: "#eab308" },
      Severe: { value: 0, color: "#ea580c" },
      Critical: { value: 0, color: "#dc2626" },
    };
    cases.forEach((c) => {
      if (severityMap[c.severity as keyof typeof severityMap]) {
        severityMap[c.severity as keyof typeof severityMap].value++;
      }
    });
    const severityData = Object.entries(severityMap).map(([name, data]) => ({
      name,
      ...data,
    }));

    // Trend (last 30 days)
    const trendMap = new Map();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    cases.forEach((c) => {
      const date = new Date(c.admission_date);
      if (date >= thirtyDaysAgo) {
        const dateStr = date.toISOString().split("T")[0];
        if (!trendMap.has(dateStr)) {
          trendMap.set(dateStr, { cases: 0, migrant: 0 });
        }
        const d = trendMap.get(dateStr);
        d.cases++;
        if (c.is_migrant_patient) d.migrant++;
      }
    });
    const trendData = Array.from(trendMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Disease Data
    const diseaseMap = new Map();
    cases.forEach((c) => {
      diseaseMap.set(c.disease_name, (diseaseMap.get(c.disease_name) || 0) + 1);
    });
    const diseaseData = Array.from(diseaseMap.entries())
      .map(([name, cases]) => ({ name, cases }))
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 10);

    setChartData({ districtCases, severityData, trendData, diseaseData });
  };

  if (authLoading || loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  // if (!stats.totalCases) {
  //   return (
  //     <div className="text-center py-10 text-gray-500">
  //       ⚠️ No case data available yet. Check console logs.
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600">
        {profile?.role === "doctor"
          ? `${profile.district} District Health Overview`
          : "Kerala Health System Overview"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 flex items-center">
          <Users className="w-8 h-8 text-blue-500 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Total Patients</p>
            <p className="text-xl font-bold">{stats.totalPatients}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 flex items-center">
          <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Total Cases</p>
            <p className="text-xl font-bold">{stats.totalCases}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 flex items-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Severe Cases</p>
            <p className="text-xl font-bold">{stats.severeCases}</p>
          </div>
        </div>
      </div>

      {/* Charts rendering (district bar, severity pie, trend line, disease bar) */}
      {/* Use chartData here */}
    </div>
  );
};

export default Dashboard;
