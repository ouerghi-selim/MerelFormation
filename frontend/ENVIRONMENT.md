# 🌍 Configuration des Environnements

## Variables d'environnement disponibles

### Variables principales
- `VITE_API_URL` : URL de l'API backend
- `VITE_APP_NAME` : Nom de l'application  
- `VITE_APP_VERSION` : Version de l'application
- `VITE_DEBUG` : Mode debug (true/false)

## Fichiers de configuration

### 📁 Hiérarchie des fichiers (par ordre de priorité)
1. **`.env.local`** *(le plus prioritaire - ignoré par git)*
2. **`.env.production`** *(en mode production uniquement)*
3. **`.env`** *(base - commité dans git)*

### 🔧 Configuration par environnement

#### Développement local (recommandé)
```bash
# .env.local
VITE_API_URL=/api
VITE_DEBUG=true
```
> Utilise le proxy Vite configuré dans `vite.config.ts`

#### Développement direct (sans proxy)
```bash
# .env.local  
VITE_API_URL=http://merelformation.localhost/api
VITE_DEBUG=true
```

#### Production
```bash
# .env.production
VITE_API_URL=https://votre-domaine.com/api
VITE_DEBUG=false
```

## 🚀 Setup rapide

1. **Copiez le fichier exemple :**
   ```bash
   cp .env.example .env.local
   ```

2. **Modifiez `.env.local` selon votre environnement**

3. **Redémarrez le serveur de développement :**
   ```bash
   npm run dev
   ```

4. **Vérifiez dans la console du navigateur :**
   - Ouvrez les DevTools (F12)
   - Cherchez les logs `🌍 API Configuration`
   - Vérifiez que l'URL est correcte

## 🔍 Debug

### Vérifier les variables chargées
Les variables sont affichées dans la console au démarrage :
```
🌍 API Configuration:
- Environment: development
- API URL: /api
- All env vars: {...}
```

### Problèmes courants

1. **Variables non reconnues**
   - ✅ Les variables doivent commencer par `VITE_`
   - ❌ `REACT_APP_` ne fonctionne pas avec Vite

2. **Changements non pris en compte**
   - Redémarrez le serveur de développement
   - Videz le cache navigateur (Ctrl+F5)

3. **Proxy ne fonctionne pas**
   - Vérifiez que Docker est démarré
   - Vérifiez `vite.config.ts` proxy configuration

## 📚 Documentation Vite
- [Variables d'environnement](https://vitejs.dev/guide/env-and-mode.html)
- [Configuration proxy](https://vitejs.dev/config/server-options.html#server-proxy)