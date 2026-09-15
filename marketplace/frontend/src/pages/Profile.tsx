import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '../api/client';
import { getFollowers, getFollowing } from '../api/client';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const queryClient = useQueryClient();
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const { data: user, isPending, error } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['followers'],
    queryFn: getFollowers,
  });

  const { data: following = [] } = useQuery({
    queryKey: ['following'],
    queryFn: getFollowing,
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      alert('Profile updated successfully');
    },
    onError: (error: any) => {
      alert('Failed to update profile: ' + error.response?.data?.message || error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ bio: bio || undefined, avatarUrl: avatarUrl || undefined });
  };

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center space-x-4 mb-6 mb-6">
        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="h-10 w-10 text-gray-500">👤</span>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{user?.username}</h2>
          <p className="text-gray-600">{user?.email}</p>
          <p className="text-gray-500">{user?.role}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className="flex items-center space-x-1 text-sm">
              {/* Location placeholder */}
              <span>📍</span>
              {user?.city}, {user?.country}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Biography</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Avatar URL</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
        <button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Stats</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Followers</p>
            <Link
              to="/followers"
              className="block text-2xl font-bold text-blue-600 hover:underline"
            >
              {followers.length}
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-500">Following</p>
            <Link
              to="/following"
              className="block text-2xl font-bold text-blue-600 hover:underline"
            >
              {following.length}
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">My Listings</h3>
        {/* TODO: List user's products */}
        <p className="text-gray-500">No listings yet.</p>
      </div>
    </div>
  );
};

export default Profile;