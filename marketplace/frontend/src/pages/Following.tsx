import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFollowing, unfollow } from '../api/client';

const Following: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: following = [], isPending, error } = useQuery({
    queryKey: ['following'],
    queryFn: getFollowing,
  });

  const unfollowMutation = useMutation({
    mutationFn: unfollow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  if (isPending) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8">Error: {error.message}</div>;

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Following</h1>

      {following.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Not following any users yet</p>
      ) : (
        <div className="space-y-4">
          {following.map((user: any) => (
            <div key={user.id} className="p-4 border rounded-lg flex items-start space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="h-5 w-5">✓</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{user.username}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400">
                  <span className="h-3 w-3 mr-1">📍</span>
                  {user.city}, {user.country}
                </p>
              </div>
              <button
                onClick={() => unfollowMutation.mutate(user.id)}
                disabled={unfollowMutation.isPending}
                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {unfollowMutation.isPending ? 'Removing...' : 'Unfollow'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Following;
