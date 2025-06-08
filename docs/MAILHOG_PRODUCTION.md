# Configuration MailHog pour Production

## 🎯 Objectif
Permettre le test des emails en production sans domaine ni gestionnaire de mail configuré.

## 📧 Configuration MailHog Production

### Services Ajoutés
```yaml
mailhog:
  image: mailhog/mailhog
  container_name: merel_mailhog_prod
  ports:
    - "1025:1025"   # Port SMTP
    - "8025:8025"   # Interface web MailHog
  networks:
    - merel_network
  restart: always
```

### Configuration PHP
La variable d'environnement suivante a été ajoutée au service PHP :
```yaml
- MAILER_DSN=smtp://mailhog:1025
```

## 🚀 Déploiement

### 1. Mettre à jour la production
```bash
git pull origin feature/mailhog-production
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Accéder à MailHog
- **Interface Web :** http://VOTRE-IP-SERVEUR:8025
- **Port SMTP :** 1025 (utilisé automatiquement par Symfony)

## 🧪 Test des Emails

### Envoyer un email de test depuis Symfony
Vous pouvez maintenant utiliser le service de mail Symfony normalement. Tous les emails seront interceptés par MailHog.

### Vérifier la réception
1. Ouvrez http://VOTRE-IP-SERVEUR:8025 dans votre navigateur
2. Tous les emails envoyés par l'application apparaîtront dans l'interface MailHog
3. Vous pouvez voir le contenu HTML/texte, les headers, etc.

## 🔧 Utilisation Temporaire
Cette configuration est idéale pour :
- ✅ Tests de fonctionnalités email en production
- ✅ Validation des templates email
- ✅ Debug des envois automatiques
- ✅ Tests avant mise en place du vrai serveur mail

## 🚨 Important
- Cette configuration est pour les TESTS uniquement
- Ne pas utiliser en production finale avec de vrais utilisateurs
- Remplacer par un vrai serveur SMTP quand prêt

## 🔄 Retour en arrière
Pour désactiver MailHog :
1. Supprimer le service `mailhog` du docker-compose.prod.yml
2. Modifier `MAILER_DSN` dans la section `php.environment`
3. Redémarrer : `docker-compose -f docker-compose.prod.yml up -d`
