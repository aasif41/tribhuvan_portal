import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EditPasswordSection } from '../../components/ui/EditPasswordSection';
import api from '../../services/api';

export function AdminProfile() {
  const { user, setUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  // Password fields for edit mode
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Handle password change if any password field is filled
      if (newPassword || currentPassword || confirmPassword) {
        if (!currentPassword) {
          alert('Please enter your current password to authorize password change');
          setLoading(false);
          return;
        }
        if (newPassword.length < 6) {
          alert('New password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          alert('New passwords do not match');
          setLoading(false);
          return;
        }

        await api.put('/users/change-password', {
          currentPassword,
          newPassword,
          confirmPassword,
        });
      }

      // Update profile info
      const res = await api.put('/users/profile', {
        name: formData.name,
        phone: formData.phone,
      });

      if (user) {
        setUser({
          ...user,
          ...res.data.data
        });
      }

      // Clear password fields & exit edit mode
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditing(false);

      alert(newPassword ? 'Profile and Password updated successfully!' : 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile', error);
      alert(error.response?.data?.message || 'Failed to update profile or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Admin Profile" subtitle="Manage your administrator account" />
        <Button 
          variant={isEditing ? 'outline' : 'gold'} 
          onClick={() => {
            if (isEditing) {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setIsEditing(false);
            } else {
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 text-center">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.name} referrerPolicy="no-referrer" className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-gold/20" />
          ) : (
            <div className="w-24 h-24 bg-navy rounded-full flex items-center justify-center mx-auto">
              <span className="text-gold text-3xl font-bold">{user?.name?.charAt(0)}</span>
            </div>
          )}
          
          {isEditing ? (
            <div className="mt-4 space-y-2">
              <input name="name" value={formData.name} onChange={handleChange} className="input-field text-center font-bold" placeholder="Full Name" />
              <input name="phone" value={formData.phone} onChange={handleChange} className="input-field text-center text-sm" placeholder="Phone Number" />
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-brand-text mt-4">{user?.name}</h2>
              <p className="text-sm text-brand-muted">{user?.email}</p>
              <p className="text-sm text-brand-muted">{user?.phone || 'No phone added'}</p>
            </>
          )}
          
          <Badge variant="success" className="mt-4">Super Admin</Badge>
        </Card>
        
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-brand-text">Account Information</h3>
            {isEditing && (
              <Button variant="gold" size="sm" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Read-only field */}
            <div className="p-3 bg-brand-bg rounded-lg opacity-70">
              <p className="text-xs text-brand-muted">Email (Read-only)</p>
              <p className="text-sm font-medium text-brand-text mt-0.5">{user?.email}</p>
            </div>
            
            <div className="p-3 bg-brand-bg rounded-lg opacity-70">
              <p className="text-xs text-brand-muted">Role</p>
              <p className="text-sm font-medium text-brand-text mt-0.5">Administrator</p>
            </div>
            
            <div className="p-3 bg-brand-bg rounded-lg opacity-70 font-sans">
              <p className="text-xs text-brand-muted">System Access</p>
              <p className="text-sm font-medium text-brand-text mt-0.5">Full Privileges</p>
            </div>
          </div>

          {/* Change Password fields — only visible when editing */}
          {isEditing && (
            <EditPasswordSection
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
