# Architecture des composants communs

Ce dossier contient des composants réutilisables qui sont utilisés dans tout le dashboard administratif. Ces composants sont conçus pour être hautement réutilisables et maintenir une cohérence visuelle dans toute l'application.

## Composants disponibles

### Alert

Un composant pour afficher des messages d'information, d'erreur, d'avertissement ou de succès.

```jsx
<Alert 
  type="success | error | warning | info" 
  message="Message à afficher" 
  onClose={() => console.log('Alert fermée')} 
/> 
```

Button
Un composant de bouton stylisé et réutilisable avec support pour différentes variantes, états et icônes.
```jsx
<Button 
  variant="primary | secondary | danger | success | outline"
  size="sm | md | lg"
  disabled={false}
  loading={false}
  icon={<Icon />}
  onClick={() => console.log('Button clicked')}
>
  Texte du bouton
</Button>
```

DataTable
Un composant de tableau avancé avec support pour le tri, la recherche et les actions personnalisées.
```jsx
<DataTable
  data={myData}
  columns={[
    { title: 'Nom', field: 'name', sortable: true },
    { title: 'Email', field: 'email', sortable: true },
    { title: 'État', field: (row) => <StatusBadge status={row.status} /> }
  ]}
  keyField="id"
  loading={false}
  actions={(row) => <ActionButtons row={row} />}
  searchFields={['name', 'email']}
  emptyMessage="Aucun élément trouvé"
/>
```

Modal
Un composant de fenêtre modale pour afficher du contenu superposé.
```jsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Titre de la modal"
  footer={<ModalFooterButtons />}
  maxWidth="max-w-md"
>
  Contenu de la modal
</Modal>
```

Toast
Un composant de notification toast pour afficher des messages temporaires.
Utilisé par le contexte NotificationContext.
```jsx
// Utilisé via le hook useNotification
const { addToast } = useNotification();
addToast('Message de succès', 'success');
```

Utilisation du contexte de notification
Pour utiliser les notifications toast dans votre application, assurez-vous que votre composant est enveloppé par le NotificationProvider. Ensuite, utilisez le hook useNotification :
```jsx
import { useNotification } from '../../contexts/NotificationContext';

const MyComponent = () => {
  const { addToast } = useNotification();
  
  const handleAction = () => {
    // Faire quelque chose...
    addToast('Action réussie !', 'success');
  };
  
  return (
    <button onClick={handleAction}>
      Effectuer une action
    </button>
  );
};
```

Hooks personnalisés
useDataFetching
Un hook pour gérer le chargement de données à partir d'une API, avec gestion des états de chargement et d'erreur.
```jsx
const { data, loading, error, refetch, setData } = useDataFetching({
  fetchFn: () => api.getData(),
  dependencies: [someId] // Optionnel, pour recharger lors des changements
});
```