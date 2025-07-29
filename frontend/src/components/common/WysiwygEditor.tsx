import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface WysiwygEditorProps {
  value: string;
  onChange: (content: string) => void;
  eventType?: string; // Type d'événement pour déterminer les variables automatiquement
  availableVariables?: string[]; // Variables disponibles pour ce template (depuis l'entité)
  targetRole?: string; // Rôle cible pour affiner les variables
  placeholder?: string;
  height?: number;
  disabled?: boolean;
  className?: string;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  value,
  onChange,
  eventType,
  availableVariables,
  targetRole,
  placeholder = 'Commencez à saisir votre contenu...',
  height = 400,
  disabled = false,
  className = ''
}) => {
  // Mapping complet des variables avec leurs descriptions
  const variableMapping: { [key: string]: string } = {
    'userName': 'Nom de l\'utilisateur',
    'userEmail': 'Email de l\'utilisateur',
    'formationTitle': 'Titre de la formation',
    'sessionDate': 'Date de la session',
    'location': 'Lieu',
    'price': 'Prix',
    'adminName': 'Nom de l\'administrateur',
    'instructorName': 'Nom de l\'instructeur',
    'studentName': 'Nom de l\'étudiant',
    'reservationId': 'ID de réservation',
    'vehicleModel': 'Modèle de véhicule',
    'vehiclePlate': 'Plaque d\'immatriculation',
    'examCenter': 'Centre d\'examen',
    'examDate': 'Date d\'examen',
    'examTime': 'Heure d\'examen',
    'pickupLocation': 'Lieu de prise en charge',
    'returnLocation': 'Lieu de retour',
    'rentalId': 'Numéro de réservation véhicule',
    'oldStatus': 'Ancien statut',
    'newStatus': 'Nouveau statut',
    'statusChangeDate': 'Date de changement de statut',
    'studentPortalUrl': 'URL de l\'espace étudiant',
    'trackingUrl': 'URL de suivi',
    'loginUrl': 'URL de connexion',
    'customMessage': 'Message personnalisé',
    'rentalDates': 'Dates de location',
    'submissionDate': 'Date de soumission',
    'documentUploadUrl': 'URL de téléchargement des documents',
    'documentsReceivedDate': 'Date de réception des documents',
    'rejectionReason': 'Raison du refus',
    'basePrice': 'Prix de base',
    'optionsPrice': 'Prix des options',
    'totalPrice': 'Prix total',
    'paymentUrl': 'URL de paiement',
    'paidAmount': 'Montant payé',
    'paymentReference': 'Référence de paiement',
    'emergencyPhone': 'Téléphone d\'urgence',
    'contactEmail': 'Email de contact',
    'pickupDate': 'Date de prise en charge',
    'returnDate': 'Date de retour',
    'rentalPeriod': 'Période de location',
    'feedbackUrl': 'URL d\'évaluation',
    'cancellationDate': 'Date d\'annulation',
    'cancellationReason': 'Raison d\'annulation',
    'cancelledBy': 'Annulé par',
    'alternativeVehicles': 'Véhicules alternatifs',
    'refundAmount': 'Montant remboursé',
    'refundDate': 'Date de remboursement',
    'refundMethod': 'Méthode de remboursement',
    'refundReference': 'Référence de remboursement',
    'newReservationUrl': 'URL pour nouvelle réservation',
    'dueDate': 'Date d\'échéance',
    'amount': 'Montant',
    'documentTitle': 'Titre du document',
    'contactName': 'Nom du contact',
    'contactSubject': 'Sujet du contact',
    'reactivatedAt': 'Date de réactivation',
    'deactivatedAt': 'Date de désactivation',
    'deletedAt': 'Date de suppression',
    'anonymizedAt': 'Date d\'anonymisation',
    'temporaryPassword': 'Mot de passe temporaire',
    'changesDescription': 'Description des modifications',
    'reason': 'Raison',
    'startDate': 'Date de début',
    'endDate': 'Date de fin',
    'invoiceNumber': 'Numéro de facture',
    'paymentDate': 'Date de paiement',
    'paymentMethod': 'Méthode de paiement',
    'senderName': 'Nom de l\'expéditeur',
    'senderRole': 'Rôle de l\'expéditeur',
    'sentAt': 'Date d\'envoi',
    'message': 'Message joint',
    'downloadUrl': 'URL de téléchargement',
    // Variables CMS
    'siteName': 'Nom du site (MerelFormation)',
    'pageTitle': 'Titre de la page',
    'sectionTitle': 'Titre de la section',
    'companyName': 'Nom de l\'entreprise',
    'contactEmail': 'Email de contact',
    'contactPhone': 'Téléphone de contact',
    'siteUrl': 'URL du site web'
  };

  // Mapping des variables par type d'événement (défini par le développeur)
  const eventTypeVariables: { [key: string]: string[] } = {
    // Événements de formation
    'formation_created': ['formationTitle', 'createdBy', 'createdAt', 'duration', 'category', 'adminName', 'instructorName'],
    'formation_updated': ['formationTitle', 'changesDescription', 'updatedAt', 'studentName'],
    'formation_deleted': ['formationTitle', 'deletedAt', 'reason', 'alternativeFormations', 'studentName'],
    
    // Événements de session
    'session_created': ['formationTitle', 'sessionDate', 'location', 'availableSeats', 'price', 'studentName'],
    'session_updated': ['formationTitle', 'newSessionDate', 'newLocation', 'changesDescription', 'studentName'],
    'session_cancelled': ['formationTitle', 'originalSessionDate', 'reason', 'rescheduleInfo', 'studentName'],
    
    // Événements d'inscription/réservation
    'registration_confirmation': ['studentName', 'formationTitle', 'sessionDate', 'location', 'price', 'reservationId', 'adminName', 'instructorName'],
    'reservation_updated': ['studentName', 'formationTitle', 'sessionDate', 'changesDescription'],
    'reservation_cancelled': ['studentName', 'formationTitle', 'sessionDate', 'reason'],
    
    // Événements de véhicule
    'vehicle_rental': ['studentName', 'vehicleModel', 'vehiclePlate', 'examCenter', 'startDate', 'endDate', 'rentalId', 'adminName'],
    'vehicle_rental_status_updated': [
      'studentName', 'vehicleModel', 'vehiclePlate', 'examCenter', 'examDate', 'examTime', 
      'pickupLocation', 'returnLocation', 'rentalId', 'oldStatus', 'newStatus', 'statusChangeDate', 
      'studentPortalUrl', 'trackingUrl', 'loginUrl', 'customMessage', 'message', 'rentalDates', 
      'submissionDate', 'documentUploadUrl', 'documentsReceivedDate', 'rejectionReason',
      'basePrice', 'optionsPrice', 'totalPrice', 'paymentUrl', 'paidAmount', 'paymentMethod',
      'paymentDate', 'paymentReference', 'emergencyPhone', 'contactEmail', 'pickupDate',
      'returnDate', 'rentalPeriod', 'feedbackUrl', 'cancellationDate', 'cancellationReason',
      'cancelledBy', 'alternativeVehicles', 'refundAmount', 'refundDate', 'refundMethod',
      'refundReference', 'newReservationUrl'
    ],
    'vehicle_added': ['vehicleModel', 'vehiclePlate', 'vehicleType', 'addedBy', 'addedAt', 'adminName'],
    'vehicle_maintenance': ['vehicleModel', 'maintenanceReason', 'alternativeVehicles', 'clientName', 'reservationDate'],
    
    // Événements utilisateur
    'user_welcome': ['userName', 'userEmail', 'temporaryPassword', 'userRole'],
    'user_updated': ['userName', 'changesDescription', 'updatedAt', 'updatedBy'],
    'user_deactivated': ['userName', 'deactivatedAt', 'reason'],
    'user_reactivated': ['userName', 'reactivatedAt', 'userEmail'],
    
    // Événements de document
    'document_added': ['documentTitle', 'formationTitle', 'documentType', 'addedAt', 'studentName'],
    'documents_added': ['documentCount', 'documentListHtml', 'formationTitle', 'sessionTitle', 'addedAt', 'addedByName', 'studentName'],
    'documents_added_by_instructor': ['documentCount', 'documentListHtml', 'formationTitle', 'sessionTitle', 'addedAt', 'instructorName', 'adminName'],
    'direct_document_sent': ['studentName', 'documentTitle', 'documentType', 'senderName', 'senderRole', 'sentAt', 'message', 'downloadUrl'],
    
    // Événements de contact
    'contact_request': ['contactName', 'contactEmail', 'contactPhone', 'contactSubject', 'contactMessage', 'receivedAt', 'adminName'],
    'contact_response': ['contactName', 'contactSubject', 'responseMessage', 'adminName'],
    
    // Événements de paiement
    'payment_received': ['clientName', 'amount', 'invoiceNumber', 'paymentDate', 'paymentMethod'],
    'payment_due': ['clientName', 'amount', 'invoiceNumber', 'dueDate', 'formationTitle', 'daysUntilDue'],
    'payment_refunded': ['clientName', 'amount', 'refundDate', 'reason'],
    
    // Événements par défaut
    'notification': ['userName', 'userEmail', 'adminName'],
    'reminder': ['userName', 'userEmail', 'adminName', 'dueDate'],
    'welcome': ['userName', 'userEmail', 'temporaryPassword'],
    'invoice': ['clientName', 'amount', 'invoiceNumber', 'dueDate', 'formationTitle'],
    
    // Événements CMS
    'content_management': ['siteName', 'pageTitle', 'sectionTitle', 'adminName', 'userName', 'companyName', 'contactEmail', 'contactPhone', 'siteUrl']
  };

  // Variables communes à tous les rôles
  const commonVariables = ['userName', 'userEmail', 'adminName'];

  // Construire la liste des variables disponibles pour ce template
  const getAvailableVariables = () => {
    // Priorité 1: Variables spécifiques fournies depuis l'entité
    if (availableVariables && availableVariables.length > 0) {
      return availableVariables.map(varName => ({
        value: `{{${varName}}}`,
        title: variableMapping[varName] || varName
      }));
    }
    
    // Priorité 2: Variables par type d'événement (mapping statique)
    if (eventType && eventTypeVariables[eventType]) {
      return eventTypeVariables[eventType].map(varName => ({
        value: `{{${varName}}}`,
        title: variableMapping[varName] || varName
      }));
    }
    
    // Priorité 3: Variables par défaut
    return commonVariables.map(varName => ({
      value: `{{${varName}}}`,
      title: variableMapping[varName]
    }));
  };

  const allVariables = getAvailableVariables();

  const editorConfig = {
    height,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | variablesButton | link | code preview fullscreen | help',
    content_style: `
      body { 
        font-family: Helvetica, Arial, sans-serif; 
        font-size: 14px;
        line-height: 1.6;
        color: #333;
      }
      .variable-tag {
        background-color: #e3f2fd;
        border: 1px solid #1976d2;
        border-radius: 3px;
        padding: 2px 4px;
        color: #1976d2;
        font-weight: 600;
        font-family: monospace;
      }
    `,
    placeholder,
    branding: false,
    promotion: false,
    readonly: disabled,
    resize: true,
    statusbar: true,
    elementpath: false,
    // Configuration pour les emails
    valid_elements: 'p,br,strong,b,i,em,u,h1,h2,h3,h4,h5,h6,ul,ol,li,a[href|title],img[src|alt|width|height],table,thead,tbody,tr,th,td,div[style],span[style|class]',
    valid_styles: 'color,background-color,text-align,font-size,font-weight,font-style,text-decoration,margin,padding,border',
    // Éviter les styles inline complexes
    formats: {
      alignleft: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', styles: { textAlign: 'left' } },
      aligncenter: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', styles: { textAlign: 'center' } },
      alignright: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', styles: { textAlign: 'right' } },
      alignjustify: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', styles: { textAlign: 'justify' } }
    },
    // Configuration du bouton personnalisé pour les variables
    setup: (editor: any) => {
      // Ajouter le bouton Variables
      editor.ui.registry.addMenuButton('variablesButton', {
        text: 'Variables',
        icon: 'template',
        fetch: (callback: any) => {
          const items = allVariables.map(variable => ({
            type: 'menuitem',
            text: variable.title,
            onAction: () => {
              editor.insertContent(`<span class="variable-tag">${variable.value}</span>&nbsp;`);
            }
          }));
          callback(items);
        }
      });

      // Ajouter un style pour les variables existantes lors du chargement initial seulement
      editor.on('init', () => {
        const applyInitialVariableStyle = () => {
          const content = editor.getContent();
          // Éviter de remplacer les variables déjà dans des spans
          if (!content.includes('variable-tag')) {
            const updatedContent = content.replace(
              /\{\{([^}]+)\}\}/g, 
              '<span class="variable-tag">{{$1}}</span>'
            );
            if (content !== updatedContent) {
              editor.setContent(updatedContent);
            }
          }
        };

        // Appliquer le style une seule fois au chargement, avec un délai
        setTimeout(applyInitialVariableStyle, 100);
      });
    }
  };

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className={className}>
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        value={value}
        onEditorChange={handleEditorChange}
        init={editorConfig}
      />
      
      {/* Aide pour les variables */}
      <div className="mt-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="flex items-center mb-3">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-semibold text-blue-800">Guide d'utilisation</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">✨ Comment insérer des variables :</h4>
            <ul className="text-blue-700 space-y-1">
              <li>• Cliquez sur le bouton <span className="font-mono bg-blue-100 px-1 rounded">Variables</span> dans la barre d'outils</li>
              <li>• Ou tapez directement : <span className="font-mono bg-blue-100 px-1 rounded">{'{{nomVariable}}'}</span></li>
              <li>• Les variables s'affichent en <span className="bg-blue-200 text-blue-800 px-1 rounded">surbrillance bleue</span></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-800 mb-2">🎯 Variables disponibles :</h4>
            <ul className="text-blue-700 space-y-1 max-h-32 overflow-y-auto">
              {allVariables.slice(0, 6).map((variable, index) => (
                <li key={index}>
                  <span className="font-mono bg-blue-100 px-1 rounded text-xs">{variable.value}</span>
                  <span className="ml-1 text-xs">- {variable.title}</span>
                </li>
              ))}
              {allVariables.length > 6 && (
                <li className="text-xs italic">...et {allVariables.length - 6} autres dans le bouton Variables</li>
              )}
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              {availableVariables && availableVariables.length > 0 
                ? "🔒 Variables définies pour ce template"
                : eventType 
                  ? `🎯 Variables pour l'événement: ${eventType}`
                  : "🔓 Variables par défaut"}
            </p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-blue-600">
            💡 <strong>Astuce :</strong> Utilisez le bouton "Prévisualiser" en bas de page pour voir le rendu final avec des données d'exemple.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WysiwygEditor;