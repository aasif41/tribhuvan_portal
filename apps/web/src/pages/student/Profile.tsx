import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { COLLEGE, PROGRAM_NAMES } from '@tribhuvan/shared';
import { EditPasswordSection } from '../../components/ui/EditPasswordSection';
import api from '../../services/api';

export function Profile() {
  const { user, setUser } = useAuth();
  const student = user?.student;
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    program: student?.program || '',
    year: student?.year || '',
    semester: student?.semester || '',
    section: student?.section || '',
    hostel: student?.hostel || '',
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
        student: {
          program: formData.program,
          year: Number(formData.year),
          semester: Number(formData.semester),
          section: formData.section,
          hostel: formData.hostel,
        }
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
        <PageHeader title="My Profile" subtitle="Your personal information" />
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
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-gold/20"
              />
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
            
            <Badge variant="success" className="mt-4">
              {user?.status}
            </Badge>
          </div>
        </Card>

        {/* Details */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-brand-text">Academic Information</h3>
            {isEditing && (
              <Button variant="gold" size="sm" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Read-only field */}
            <div className="p-3 bg-brand-bg rounded-lg opacity-70">
              <p className="text-xs text-brand-muted">Roll Number (Read-only)</p>
              <p className="text-sm font-medium text-brand-text mt-0.5">{student?.rollNo}</p>
            </div>
            
            {/* Read-only field */}
            <div className="p-3 bg-brand-bg rounded-lg opacity-70">
              <p className="text-xs text-brand-muted">College</p>
              <p className="text-sm font-medium text-brand-text mt-0.5">{COLLEGE.name}</p>
            </div>

            {/* Editable fields */}
            <div className="p-3 bg-brand-bg rounded-lg">
              <p className="text-xs text-brand-muted">Program</p>
              {isEditing ? (
                <select name="program" value={formData.program} onChange={handleChange as any} className="input-field mt-1 w-full p-1 text-sm">
                  {PROGRAM_NAMES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              ) : (
                <p className="text-sm font-medium text-brand-text mt-0.5">{student?.program}</p>
              )}
            </div>

            <div className="p-3 bg-brand-bg rounded-lg">
              <p className="text-xs text-brand-muted">Year</p>
              {isEditing ? (
                <input type="number" name="year" value={formData.year} onChange={handleChange} className="input-field mt-1 w-full p-1 text-sm" />
              ) : (
                <p className="text-sm font-medium text-brand-text mt-0.5">{student?.year}</p>
              )}
            </div>

            <div className="p-3 bg-brand-bg rounded-lg">
              <p className="text-xs text-brand-muted">Semester</p>
              {isEditing ? (
                <input type="number" name="semester" value={formData.semester} onChange={handleChange} className="input-field mt-1 w-full p-1 text-sm" />
              ) : (
                <p className="text-sm font-medium text-brand-text mt-0.5">{student?.semester}</p>
              )}
            </div>

            <div className="p-3 bg-brand-bg rounded-lg">
              <p className="text-xs text-brand-muted">Section</p>
              {isEditing ? (
                <input name="section" value={formData.section} onChange={handleChange} className="input-field mt-1 w-full p-1 text-sm" />
              ) : (
                <p className="text-sm font-medium text-brand-text mt-0.5">{student?.section || 'N/A'}</p>
              )}
            </div>

            <div className="p-3 bg-brand-bg rounded-lg">
              <p className="text-xs text-brand-muted">Hostel</p>
              {isEditing ? (
                <input name="hostel" value={formData.hostel} onChange={handleChange} className="input-field mt-1 w-full p-1 text-sm" />
              ) : (
                <p className="text-sm font-medium text-brand-text mt-0.5">{student?.hostel || 'N/A'}</p>
              )}
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
