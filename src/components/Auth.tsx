import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const Auth: React.FC = () => {
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "doctor",
    district: "",
  });

  // 🚀 Redirect if user exists after auth is done
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const districts = [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
    "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad",
    "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.fullName,
          formData.role,
          formData.district || undefined
        );
        if (error) setError(error.message);
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) setError(error.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Show loader if auth context is still initializing
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">KH</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">പ്രവാസാശൈ</h2>
          <p className="mt-2 text-sm text-gray-600">Kerala Migrant Health Dashboard</p>
          <p className="text-xs text-gray-500 mt-1">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="government_official">Government Official</option>
                    <option value="migrant">Migrant Worker</option>
                  </select>
                </div>

                {(formData.role === "doctor" || formData.role === "government_official") && (
                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                      District
                    </label>
                    <select
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="">Select District</option>
                      {districts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full px-3 py-2 pr-10 border rounded-md text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-md text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-900 hover:text-blue-800 font-medium"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
