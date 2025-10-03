'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UploadIcon, CameraIcon } from 'lucide-react';
import { toast } from 'sonner';


export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState<string | undefined>('');
  const [avatar, setAvatar] = useState<string | undefined>('');
  const [isLoading, setIsLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      setBio((session.user as any).bio || '');
      setAvatar((session.user as any).avatar || '');
      setIsLoading(false);
    }
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview URL for the image
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, bio }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update session with new data
        await update({
          ...session?.user,
          name: data.user.name,
          bio: data.user.bio,
        });
        
        toast.success('Profile updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update session with new avatar
        await update({
          ...session?.user,
          avatar: data.user.avatar,
        });
        
        toast.success('Avatar updated successfully');
        setPreviewUrl(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your account information and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={previewUrl || avatar || undefined} 
                alt={name || "User avatar"} 
              />
              <AvatarFallback>{name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            
            <div className="flex items-center gap-2">
              <label htmlFor="avatar-upload" className="relative cursor-pointer bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md flex items-center">
                <UploadIcon className="w-4 h-4 mr-2" />
                Change Avatar
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
              
              {previewUrl && (
                <Button type="button" onClick={handleUploadAvatar} variant="outline" size="sm">
                  <CameraIcon className="w-4 h-4 mr-2" />
                  Save Avatar
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled />
            </div>
            
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <Button onClick={handleSaveProfile} className="w-full">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}