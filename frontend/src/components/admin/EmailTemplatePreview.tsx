import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';
import Modal from '../common/Modal';

interface EmailTemplatePreviewProps {
  content: string;
  subject: string;
  availableVariables?: string[]; // Variables disponibles pour ce template
  buttonClassName?: string;
}

const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({
  content,
  subject,
  availableVariables = [],
  buttonClassName = ''
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{[key: string]: string}>({});

  // Toutes les données de prévisualisation disponibles
  const allPreviewData: {[key: string]: string} = {
    '{{userName}}': 'Jean Dupont',
    '{{userEmail}}': 'jean.dupont@email.com',
    '{{formationTitle}}': 'Formation Taxi Initiale 140h',
    '{{sessionDate}}': '15/01/2025',
    '{{location}}': 'Centre de Formation MerelFormation',
    '{{price}}': '1 200€',
    '{{adminName}}': 'Marie Martin',
    '{{instructorName}}': 'Pierre Durand',
    '{{studentName}}': 'Jean Dupont',
    '{{reservationId}}': 'RES-2025-001',
    '{{vehicleModel}}': 'Peugeot 308',
    '{{vehiclePlate}}': 'AB-123-CD',
    '{{examCenter}}': 'Centre d\'examen de Paris',
    '{{dueDate}}': '30/01/2025',
    '{{amount}}': '350€',
    '{{documentTitle}}': 'Guide de formation',
    '{{contactName}}': 'Sophie Leroy',
    '{{contactSubject}}': 'Demande d\'information',
    '{{contactEmail}}': 'sophie.leroy@email.com',
    '{{contactPhone}}': '01 23 45 67 89',
    '{{contactMessage}}': 'Je souhaite obtenir des informations sur vos formations.',
    '{{reactivatedAt}}': '22/06/2025 14:30',
    '{{deactivatedAt}}': '15/06/2025 10:15',
    '{{deletedAt}}': '20/06/2025 09:00',
    '{{anonymizedAt}}': '27/06/2025 00:00',
    '{{temporaryPassword}}': 'TempPass123!',
    '{{changesDescription}}': 'Mise à jour du profil utilisateur',
    '{{reason}}': 'Non-respect du règlement intérieur',
    '{{startDate}}': '01/02/2025',
    '{{endDate}}': '28/02/2025',
    '{{invoiceNumber}}': 'INV-2025-001',
    '{{paymentDate}}': '25/01/2025',
    '{{paymentMethod}}': 'Carte bancaire',
    '{{rentalId}}': 'LOC-2025-001',
    '{{vehicleType}}': 'Voiture école',
    '{{maintenanceReason}}': 'Révision périodique',
    '{{alternativeVehicles}}': 'Peugeot 208, Renault Clio',
    '{{clientName}}': 'Jean Dupont',
    '{{reservationDate}}': '15/02/2025',
    '{{userRole}}': 'Étudiant',
    '{{documentType}}': 'Manuel de formation',
    '{{documentCount}}': '3',
    '{{documentListHtml}}': '<ul><li>Manuel théorique</li><li>Exercices pratiques</li><li>Guide d\'examen</li></ul>',
    '{{sessionTitle}}': 'Session intensive weekend',
    '{{addedAt}}': '22/06/2025 10:30',
    '{{addedByName}}': 'Marie Martin',
    '{{receivedAt}}': '22/06/2025 09:15',
    '{{responseMessage}}': 'Nous vous remercions pour votre intérêt.',
    '{{refundDate}}': '30/01/2025',
    '{{daysUntilDue}}': '8'
  };

  // Extraire les variables utilisées dans le contenu et le sujet
  const getUsedVariables = () => {
    const combinedText = `${content} ${subject}`;
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const usedVars = new Set<string>();
    
    let match;
    while ((match = variableRegex.exec(combinedText)) !== null) {
      usedVars.add(`{{${match[1]}}}`);
    }
    
    return Array.from(usedVars);
  };

  // Filtrer les données de prévisualisation pour ne garder que celles utilisées
  const getRelevantPreviewData = () => {
    const usedVariables = getUsedVariables();
    const relevantData: {[key: string]: string} = {};
    
    usedVariables.forEach(variable => {
      if (allPreviewData[variable]) {
        relevantData[variable] = allPreviewData[variable];
      }
    });
    
    return relevantData;
  };

  const relevantPreviewData = getRelevantPreviewData();

  const processContent = (htmlContent: string) => {
    let processedContent = htmlContent;
    
    // Remplacer les variables par les valeurs de prévisualisation
    Object.entries({ ...relevantPreviewData, ...previewData }).forEach(([variable, value]) => {
      const regex = new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g');
      processedContent = processedContent.replace(regex, value);
    });

    return processedContent;
  };

  const processSubject = (subjectText: string) => {
    let processedSubject = subjectText;
    
    // Remplacer les variables dans le sujet
    Object.entries({ ...relevantPreviewData, ...previewData }).forEach(([variable, value]) => {
      const regex = new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g');
      processedSubject = processedSubject.replace(regex, value);
    });

    return processedSubject;
  };

  const openPreview = () => {
    setShowPreview(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={openPreview}
        className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${buttonClassName}`}
      >
        <Eye className="h-4 w-4 mr-2" />
        Prévisualiser
      </button>

      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Prévisualisation du template"
        maxWidth="max-w-4xl"
        footer={
          <div className="flex justify-end">
            <button
              onClick={() => setShowPreview(false)}
              className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Fermer
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Informations du message */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sujet :
                </label>
                <p className="mt-1 text-sm text-gray-900 font-medium">
                  {processSubject(subject) || 'Aucun sujet défini'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  De :
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  MerelFormation &lt;noreply@merelformation.com&gt;
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  À :
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {allPreviewData['{{userName}}']} &lt;{allPreviewData['{{userEmail}}']}&gt;
                </p>
              </div>
            </div>
          </div>

          {/* Contenu de l'email */}
          <div className="border rounded-lg">
            <div className="bg-gray-100 px-4 py-2 border-b">
              <h4 className="text-sm font-medium text-gray-700">Contenu de l'email</h4>
            </div>
            <div className="p-4">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: processContent(content) || '<p><em>Aucun contenu défini</em></p>' 
                }}
              />
            </div>
          </div>

          {/* Aide sur les variables */}
          {Object.keys(relevantPreviewData).length > 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-blue-800 mb-2">
                🔍 Données de prévisualisation utilisées :
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {Object.entries(relevantPreviewData).map(([variable, value]) => (
                  <div key={variable} className="flex justify-between items-center bg-white p-2 rounded border">
                    <span className="text-blue-700 font-mono font-medium">{variable}</span>
                    <span className="text-blue-600 ml-2">→ {value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-blue-600 bg-blue-100 p-2 rounded">
                💡 <strong>Seules les variables détectées dans votre template sont affichées.</strong> Les vraies valeurs seront utilisées lors de l'envoi.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                🔍 Variables détectées :
              </h5>
              <p className="text-xs text-gray-600">
                Aucune variable détectée dans le contenu ou le sujet de ce template.
                Utilisez des variables comme <code className="bg-gray-200 px-1 rounded">{{userName}}</code> pour personnaliser vos emails.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default EmailTemplatePreview;