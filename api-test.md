# Plan de test des endpoints API

Ce document détaille le plan de test pour vérifier le bon fonctionnement des endpoints API du projet MerelFormation.

## Endpoints à tester

Basé sur l'analyse de la structure du projet, nous allons tester les endpoints suivants :

### Admin API
- AdminDashboard
- AdminFormations
- AdminReservations

### Student API
- StudentDashboard
- StudentFormations
- StudentDocuments

## Méthode de test

Nous allons créer un script de test qui :
1. Vérifie que les endpoints sont accessibles
2. Vérifie que les réponses sont au format attendu
3. Teste les opérations CRUD lorsqu'applicable

Nous utiliserons des outils comme curl ou un script Python pour effectuer ces tests.
