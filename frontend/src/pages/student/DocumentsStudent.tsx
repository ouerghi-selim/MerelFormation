import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Search, ChevronDown } from 'lucide-react';
import StudentHeader from '../../components/student/StudentHeader';
import { studentDocumentsApi } from '@/services/api.ts';

interface Document {
  id: number;
  title: string;
  type: string;
  source: string; // 'formation' | 'session' | 'direct'
  sourceTitle: string;
  sourceId: number | null;
  date: string; // Format d/m/Y
  uploadedAt: string; // Format Y-m-d H:i:s
  fileName: string;
  fileSize: string; // Formaté (ex: "1.2 MB")
  fileType: string;
  downloadUrl: string;
  senderRole?: string; // Pour les documents directs
}

const DocumentsStudent: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);

        // Remplaçons le mock par l'appel API réel
        const response = await studentDocumentsApi.getAll();
        setDocuments(response.data);
        setFilteredDocuments(response.data);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Erreur lors du chargement des documents');
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);


  useEffect(() => {
    let filtered = documents;

    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(document => document.source === sourceFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(document =>
          document.title.toLowerCase().includes(query) ||
          document.sourceTitle.toLowerCase().includes(query)
      );
    }

    setFilteredDocuments(filtered);
  }, [sourceFilter, searchQuery, documents]); // Changer typeFilter en sourceFilter

  const getTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return 'text-red-600';
      case 'doc':
      case 'docx':
        return 'text-blue-600';
      case 'xls':
      case 'xlsx':
        return 'text-green-600';
      case 'ppt':
      case 'pptx':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <StudentHeader />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            Mes documents
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un document..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-3 text-gray-400"/>
              <select
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white w-full"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="all">Toutes les sources</option>
                <option value="formation">Formations</option>
                <option value="session">Sessions</option>
                <option value="direct">Documents directs</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-400"/>
            </div>
          </div>
        </div>

        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
        )}

        {filteredDocuments.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Aucun document trouvé</h2>
            <p className="text-gray-600 mb-4">
              {documents.length > 0
                ? "Aucun document ne correspond à vos critères de recherche."
                : "Vous n'avez aucun document disponible pour le moment."}
            </p>
            {documents.length > 0 && (
                <button
                    onClick={() => {
                      setSourceFilter('all');
                      setSearchQuery('');
                    }}
                    className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
            )}
            </div>
        ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                  <th scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom du document
                  </th>
                  <th scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'ajout
                  </th>
                  <th scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taille
                  </th>
                  <th scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <FileText className={`h-5 w-5 ${getTypeIcon(document.fileType)}`}/>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{document.title}</div>
                            <div className="text-sm text-gray-500">{document.fileType.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{document.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        document.source === 'formation'
            ? 'bg-blue-100 text-blue-800'
            : document.source === 'session'
            ? 'bg-green-100 text-green-800'
            : document.source === 'direct'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-800'
    }`}>
      {document.source === 'formation' ? 'Formation' : 
       document.source === 'session' ? 'Session' : 
       document.source === 'direct' ? 'Direct' : 'Autre'}
    </span>
                          <span className="ml-2 text-sm text-gray-900">{document.sourceTitle}</span>
                          {document.source === 'direct' && document.senderRole && (
                            <span className="ml-1 text-xs text-gray-500">({document.senderRole})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{document.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{document.fileSize}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <a
                            href={`/api/student/documents/${document.id}/download`}
                            download
                            className="inline-flex items-center px-3 py-1 border border-blue-700 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-700 hover:text-white transition-colors"
                        >
                          <Download className="h-4 w-4 mr-1"/>
                          Télécharger
                        </a>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DocumentsStudent;
