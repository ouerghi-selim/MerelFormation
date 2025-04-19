#!/usr/bin/env python3
"""
Script de test des endpoints API pour MerelFormation

Ce script permet de tester les endpoints API définis dans les classes ApiResource
du projet MerelFormation. Il utilise la bibliothèque requests pour effectuer des
appels HTTP et vérifier les réponses.

Usage:
    python3 api_test.py [--base-url BASE_URL] [--token TOKEN]

Options:
    --base-url BASE_URL    URL de base de l'API (par défaut: http://localhost:8000)
    --token TOKEN          Token JWT pour l'authentification
"""

import argparse
import json
import requests
import sys
from typing import Dict, List, Any, Optional


class ApiTester:
    """Classe pour tester les endpoints API de MerelFormation"""

    def __init__(self, base_url: str, token: Optional[str] = None):
        """
        Initialise le testeur d'API
        
        Args:
            base_url: URL de base de l'API
            token: Token JWT pour l'authentification (optionnel)
        """
        self.base_url = base_url.rstrip('/')
        self.headers = {}
        if token:
            self.headers['Authorization'] = f'Bearer {token}'
        self.headers['Content-Type'] = 'application/json'
        self.results = {
            'success': [],
            'failure': []
        }

    def test_endpoint(self, method: str, endpoint: str, data: Dict = None, 
                      expected_status: int = 200, description: str = "") -> bool:
        """
        Teste un endpoint API
        
        Args:
            method: Méthode HTTP (GET, POST, PUT, DELETE)
            endpoint: Chemin de l'endpoint (sans l'URL de base)
            data: Données à envoyer pour les requêtes POST/PUT
            expected_status: Code de statut HTTP attendu
            description: Description du test
            
        Returns:
            bool: True si le test a réussi, False sinon
        """
        url = f"{self.base_url}{endpoint}"
        print(f"\n{'=' * 80}")
        print(f"Test: {description or endpoint}")
        print(f"URL: {url}")
        print(f"Méthode: {method}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=self.headers)
            elif method == 'POST':
                response = requests.post(url, headers=self.headers, json=data)
            elif method == 'PUT':
                response = requests.put(url, headers=self.headers, json=data)
            elif method == 'DELETE':
                response = requests.delete(url, headers=self.headers)
            else:
                print(f"Méthode non supportée: {method}")
                return False
            
            print(f"Statut: {response.status_code}")
            
            # Afficher le contenu de la réponse si c'est du JSON
            try:
                json_response = response.json()
                print("Réponse:")
                print(json.dumps(json_response, indent=2, ensure_ascii=False))
            except:
                print(f"Réponse (non-JSON): {response.text[:200]}...")
            
            success = response.status_code == expected_status
            
            if success:
                self.results['success'].append({
                    'endpoint': endpoint,
                    'method': method,
                    'description': description
                })
                print("✅ Test réussi")
            else:
                self.results['failure'].append({
                    'endpoint': endpoint,
                    'method': method,
                    'description': description,
                    'expected_status': expected_status,
                    'actual_status': response.status_code
                })
                print(f"❌ Test échoué (statut attendu: {expected_status}, obtenu: {response.status_code})")
            
            return success
            
        except Exception as e:
            print(f"❌ Erreur lors du test: {str(e)}")
            self.results['failure'].append({
                'endpoint': endpoint,
                'method': method,
                'description': description,
                'error': str(e)
            })
            return False

    def print_summary(self):
        """Affiche un résumé des tests effectués"""
        total = len(self.results['success']) + len(self.results['failure'])
        success_rate = (len(self.results['success']) / total) * 100 if total > 0 else 0
        
        print("\n" + "=" * 80)
        print(f"RÉSUMÉ DES TESTS")
        print(f"Total des tests: {total}")
        print(f"Réussis: {len(self.results['success'])} ({success_rate:.1f}%)")
        print(f"Échoués: {len(self.results['failure'])}")
        
        if self.results['failure']:
            print("\nTests échoués:")
            for i, failure in enumerate(self.results['failure'], 1):
                print(f"{i}. {failure['method']} {failure['endpoint']} - {failure.get('description', '')}")
                if 'expected_status' in failure:
                    print(f"   Statut attendu: {failure['expected_status']}, obtenu: {failure['actual_status']}")
                if 'error' in failure:
                    print(f"   Erreur: {failure['error']}")

    def run_all_tests(self):
        """Exécute tous les tests d'API"""
        print("Démarrage des tests d'API pour MerelFormation...")
        
        # Test d'authentification (à adapter selon votre système)
        self.test_endpoint(
            'POST', 
            '/api/login_check', 
            data={'username': 'admin@example.com', 'password': 'password'},
            description="Authentification"
        )
        
        # Tests Admin Dashboard
        self.test_endpoint('GET', '/admin/dashboard/stats', description="Admin Dashboard - Statistiques")
        self.test_endpoint('GET', '/admin/dashboard/recent-inscriptions', description="Admin Dashboard - Inscriptions récentes")
        self.test_endpoint('GET', '/admin/dashboard/recent-reservations', description="Admin Dashboard - Réservations récentes")
        
        # Tests Admin Formations
        self.test_endpoint('GET', '/admin/formations', description="Admin Formations - Liste")
        self.test_endpoint('GET', '/admin/formations/1', description="Admin Formations - Détail")
        self.test_endpoint('POST', '/admin/formations', 
                          data={'title': 'Nouvelle formation', 'description': 'Description', 'price': 100},
                          description="Admin Formations - Création")
        self.test_endpoint('PUT', '/admin/formations/1', 
                          data={'title': 'Formation mise à jour', 'description': 'Nouvelle description', 'price': 150},
                          description="Admin Formations - Mise à jour")
        self.test_endpoint('DELETE', '/admin/formations/1', description="Admin Formations - Suppression")
        self.test_endpoint('GET', '/admin/formations/sessions', description="Admin Formations - Sessions")
        
        # Tests Admin Reservations
        self.test_endpoint('GET', '/admin/reservations', description="Admin Reservations - Liste")
        self.test_endpoint('GET', '/admin/reservations/1', description="Admin Reservations - Détail")
        self.test_endpoint('PUT', '/admin/reservations/1/status', 
                          data={'status': 'confirmed'},
                          description="Admin Reservations - Mise à jour statut")
        self.test_endpoint('PUT', '/admin/reservations/1/assign-vehicle', 
                          data={'vehicleId': 1},
                          description="Admin Reservations - Assignation véhicule")
        self.test_endpoint('GET', '/admin/vehicles/available', description="Admin Reservations - Véhicules disponibles")
        
        # Tests Student Dashboard
        self.test_endpoint('GET', '/student/dashboard', description="Student Dashboard - Index")
        self.test_endpoint('GET', '/student/profile', description="Student Dashboard - Profil")
        
        # Tests Student Formations
        self.test_endpoint('GET', '/student/formations', description="Student Formations - Liste")
        self.test_endpoint('GET', '/student/formations/1', description="Student Formations - Détail")
        
        # Tests Student Documents
        self.test_endpoint('GET', '/student/documents', description="Student Documents - Liste")
        self.test_endpoint('GET', '/student/documents/1', description="Student Documents - Détail")
        self.test_endpoint('GET', '/student/documents/1/download', description="Student Documents - Téléchargement")
        
        # Afficher le résumé
        self.print_summary()


def main():
    """Fonction principale"""
    parser = argparse.ArgumentParser(description='Test des endpoints API pour MerelFormation')
    parser.add_argument('--base-url', default='http://localhost:8000', help='URL de base de l\'API')
    parser.add_argument('--token', help='Token JWT pour l\'authentification')
    
    args = parser.parse_args()
    
    tester = ApiTester(args.base_url, args.token)
    tester.run_all_tests()


if __name__ == '__main__':
    main()
