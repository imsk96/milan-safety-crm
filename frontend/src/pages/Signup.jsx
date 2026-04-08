import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Building2, User, Lock, AtSign } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    adminName: '',
    loginId: '',
    password: '',
    tagName: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({ name: formData.companyName })
        .select('id')
        .single();
      if (companyError) throw companyError;

      // 2. Sign up the user (internal email mapping)
      const email = `${formData.loginId}@milan-safety.internal`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: formData.password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Signup failed');

      // 3. Insert user profile with company_id
      const tag = formData.tagName.startsWith('@') ? formData.tagName : `@${formData.tagName}`;
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: formData.adminName,
          login_id: formData.loginId,
          role: 'admin',
          tag_name: tag,
          company_id: company.id,
        });
      if (profileError) throw profileError;

      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Create Company Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 glass bg-white/10 rounded-lg"
                  placeholder="Milan Safety"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 glass bg-white/10 rounded-lg"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Login ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.loginId}
                  onChange={(e) => setFormData({ ...formData, loginId: e.target.value.toLowerCase() })}
                  className="w-full pl-10 pr-4 py-2 glass bg-white/10 rounded-lg"
                  placeholder="admin"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Tag Name</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.tagName}
                  onChange={(e) => setFormData({ ...formData, tagName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 glass bg-white/10 rounded-lg"
                  placeholder="@admin"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Password (min 6 characters)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 glass bg-white/10 rounded-lg"
                  placeholder="••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
          </form>
          <p className="text-center text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}