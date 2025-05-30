import React from 'react';
import AdminSidebar from '../admin/AdminSidebar';
import AdminHeader from '../admin/AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbItems?: Array<{ label: string; path?: string }>;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title = "Administration",
  breadcrumbItems = []
}) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title={title} breadcrumbItems={breadcrumbItems} />
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;