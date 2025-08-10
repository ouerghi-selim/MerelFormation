import React from 'react';
import StudentHeader from '../student/StudentHeader';
import PageContainer from './PageContainer';

interface StudentLayoutProps {
  children: React.ReactNode;
  title?: string;
  containerVariant?: 'default' | 'narrow' | 'wide' | 'full';
  className?: string;
}

/**
 * Layout uniforme pour les pages étudiants
 * Utilise StudentHeader + PageContainer pour cohérence
 */
const StudentLayout: React.FC<StudentLayoutProps> = ({ 
  children, 
  title,
  containerVariant = 'default',
  className = ''
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      <main className={`py-8 ${className}`}>
        <PageContainer variant={containerVariant}>
          {title && (
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            </div>
          )}
          {children}
        </PageContainer>
      </main>
    </div>
  );
};

export default StudentLayout;