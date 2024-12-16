'use client'  
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CollectionItem, UserProfile } from '@/lib/types';
import Link from 'next/link';
import { useClient } from '@/lib/helper';
import { addFollower, removeFollower } from '@/lib/api';

type ProfileProps = {
  userData: UserProfile;
  exploreItems: CollectionItem[];
};
const ProfilePage: React.FC<ProfileProps> = ({ userData, exploreItems }) => {
  const [isFollowing, setIsFollowing] = React.useState(userData.is_following);
  const [followers, setFollowers] = React.useState(userData.follower_count);
  const handleFollow = async () => {
    try {
      await addFollower(userData.username);
      setIsFollowing(true);
      setFollowers(followers + 1);
    } catch (error) {
      console.error(error);
    }
  }
  const handleUnfollow = async () => {
    try {
      await removeFollower(userData.username);
      setIsFollowing(false);
      setFollowers(followers - 1);
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="w-full max-w-[2000px] mx-auto">
      {/* Profile Header */}
      <div className="w-full text-center py-6">
        <Avatar className="w-32 h-32 mx-auto mb-4">
          <AvatarImage src={useClient(userData.avatar)} alt={`${userData.name}'s avatar`} />
          <AvatarFallback>
            {userData.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <h2 className="text-2xl font-bold mb-1">{userData.name}</h2>

        <p className="text-muted-foreground mb-2">
          @{userData.username} • {followers} Followers
        </p>

        <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
          {userData.bio || 'No bio provided'}
        </p>

        {userData.is_owner ? (
          <Button variant="outline" size="sm" className="mt-2">
            Edit Profile
          </Button>
        ) : (isFollowing ? (
          <Button variant="default" size="sm" className="mt-2" onClick={handleUnfollow}>
            Unfollow
          </Button>
          ) : (
            <Button variant="default" size="sm" className="mt-2" onClick={handleFollow}>
              Follow
            </Button>
          )
        )}
      </div>

      {/* Explore Items Grid */}
      <div className="w-full mt-4 px-4 md:px-8 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {exploreItems.map((item) => (
            <Card
              key={item.id}
              style={{ border: 'none', boxShadow: 'none' }}
              className="w-full cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-0">
                <Link href={`/c/${item.title}`}>
                  <img
                    src={useClient(item.thumbnail)}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="p-3 text-center">
                    <h3 className="font-bold text-sm mb-1 line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.image_count || null} images</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {exploreItems.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            No explore items found
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;