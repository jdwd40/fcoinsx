import React, { useState, useEffect } from 'react';
import { User, Mail, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { handleSupabaseError, type SupabaseError } from '../utils/supabase';
import { getAvatarUrl } from '../utils/avatar';
import Spinner from '../components/Spinner';
import FundsDisplay from '../components/FundsDisplay';

interface Profile {
  display_name: string;
  avatar_url: string;
  created_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<SupabaseError | null>(null);
  const [profile, setProfile] = useState<Profile>({
    display_name: '',
    avatar_url: '',
    created_at: '',
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single();

        if (error) {
          setError(handleSupabaseError(error));
          return;
        }

        if (data) {
          setProfile({
            display_name: data.display_name || '',
            avatar_url: getAvatarUrl(data.avatar_url),
            created_at: new Date(data.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError({
          message: 'Failed to load profile',
          details: 'Please try again later'
        });
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError(null);

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name,
        })
        .eq('id', user?.id);

      if (error) {
        setError(handleSupabaseError(error));
        return;
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError({
        message: 'Failed to update profile',
        details: 'Please try again later'
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">Manage your account information</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <p className="font-medium">{error.message}</p>
            {error.details && (
              <p className="text-sm mt-1">{error.details}</p>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <div className="relative">
            <img
              src={getAvatarUrl(profile.avatar_url)}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <button
              className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition-colors"
              aria-label="Change profile picture"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-grow">
            <h2 className="text-xl font-semibold text-gray-900">
              {profile.display_name || user?.email?.split('@')[0]}
            </h2>
            <p className="text-gray-500">Member since {profile.created_at}</p>
          </div>
        </div>

        <div className="mb-8">
          <FundsDisplay variant="compact" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                id="name"
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your display name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                id="email"
                value={user?.email || ''}
                disabled
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={updating}
            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;