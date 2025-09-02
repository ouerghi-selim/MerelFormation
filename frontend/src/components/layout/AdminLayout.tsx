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
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden" >
      <AdminSidebar />
      <div className="flex-1 min-w-0"> {/* min-w-0 permet au flex-item de rétrécir */}
        <AdminHeader title={title} breadcrumbItems={breadcrumbItems} />
        <main className="admin-content">
          <div className="admin-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;