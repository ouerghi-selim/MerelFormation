# Annexe — Bugfixes & Corrections détaillées (2025)

> Liste structurée des corrections majeures avec contexte, impact et zones modifiées.

## Août 2025

### SoftDelete — Nom de filtre incohérent
- **Problème** : `soft-deleteable` vs `softdeleteable` ⇒ liste vides, restauration cascade KO.
- **Solution** : Unification du nom de filtre dans toute la stack + tests end‑to‑end.
- **Impact** : Restauration et vues admin 100% opérationnelles.

### Emails & Statuts — Locations de véhicules
- **Finalisation** : Architecture unifiée, 12 templates véhicules, progression 6 phases.
- **Fix** : `ReservationAdminController` appelle la bonne méthode de notification véhicules.
- **Migrations/Fixtures** : Ajout variable `message`, migration des templates existants.

### Documents d’inscription — Vue centrale admin
- **Nouveautés + fixes** : Endpoint dédié, filtres statut, SoftDelete-safe, stats temps réel.
- **Front** : DataTable + modales de validation/rejet, messages d’erreurs précis.

---

## Juillet 2025

### Inscription par étapes (+Entreprise)
- **Tokens** : 64 chars, expiration 7 jours, validation multi‑niveaux, suppression après usage.
- **Entreprise (Company)** : Validation SIRET, réutilisation par SIRET, relation ManyToOne.
- **APIs** : `validate-setup-token`, `complete-registration`, `users/students` (enrichi).

### Documents d’inscription — Affichage côté étudiant & admin
- **Fix** : Documents uploadés pendant l’inscription désormais visibles/téléchargeables.
- **Sécurité** : Vérification ownership stricte, URLs directes contrôlées.
- **Front** : Filtres “source=inscription”, modales admin, endpoints consolidés.

### Statuts de réservation (formations) — 19 statuts / 6 phases
- **Ajouts** : Endpoints statuts/transitions + MAJ statut session‑reservation.
- **Front** : Dropdowns admin, couleurs par phase, Dashboard admin mis à jour.
- **Migration** : `pending` → `submitted` (automatique).

---

## Juin 2025 — “Bugs critiques résolus” (extraits)
1. Réservations — confirmations maintenant **persistées en base**.  
2. Upload documents — API formations **complètement fonctionnelle**.  
3. Suppression documents — plus d’**erreurs de validation** après suppression.  
4. Affichage documents — plus d’**erreurs JavaScript** après upload.  
5. Routes backend — endpoints documentaires **opérationnels**.  
6. **Architecture stateless** — upload temporaire (TempDocument) compatible API Platform.  
7. **Validation précoce** — plus d’erreurs “stat failed” à l’upload.  
8. **Migration automatique** — DB mise à jour pour `TempDocument`.  
9. **RGPD 3 niveaux** — interface admin des **utilisateurs supprimés**.  
10. **Fichiers volumineux (100MB)** — limites système harmonisées.  
11. Interface admin suppression — **deadlines** + **restauration**.  
12. **Routes API corrigées** — fini les 404 sur endpoints critiques.  
13. **Notifications complètes** — services d’email implémentés.  
14. **Suppression FK Sessions** — résolution contraintes séquentielles.  
15. **Spécialisations instructeurs** — champ + migration + front.  
16. **Retour API** — plus de lignes vides après création instructeur.  
17. Messages d’erreur précis — utilitaire `errorUtils.ts`.  
18. Affichage documents inscription — **visualisation + téléchargement** cohérents.  
19. Système Entreprise/Employeur — section optionnelle complète.  
20. (… et autres ajustements cosmétiques/UX).

---

## Notes d’implémentation
- Chaque correction doit référencer une **PR** et un **scope** (backend/front/migrations).  
- Préférer des **tests** (unitaires/HTTP/e2e) pour éviter les régressions.  
- En cas de modification SoftDelete, valider : *filtre Doctrine actif*, *restauration cascade*, *index `deletedAt`*.