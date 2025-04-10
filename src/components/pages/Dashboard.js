import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase'; // Assure-toi que ton fichier firebase.js contient les bonnes configurations Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { MDBContainer } from 'mdb-react-ui-kit';  // Ou ton propre design

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const savedUser = localStorage.getItem('user');  // Vérifier si l'utilisateur est dans le localStorage

      if (savedUser) {
        // Si l'utilisateur est dans le localStorage, on l'affiche
        setUser(savedUser);
      } else {
        // Si l'utilisateur n'est pas connecté, on redirige vers la page de login
        navigate('/login');
      }
    };

    checkUser();

    // Vérification de l'état d'authentification Firebase (en temps réel)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Utilisateur connecté
        setUser(currentUser.email); // Tu peux aussi stocker d'autres informations si nécessaire
      } else {
        // Utilisateur déconnecté
        setUser(null);
      }
    });

    return () => unsubscribe();  // Clean-up de l'abonnement
  }, [navigate]);

  return (
    <MDBContainer>
      <h1>Bienvenue sur votre dashboard</h1>
      {user ? (
        <div>
          <p>Utilisateur connecté : {user}</p>
          {/* Tu peux ajouter plus de contenu et de fonctionnalités pour l'utilisateur ici */}
        </div>
      ) : (
        <p>Chargement...</p>  // Cela se produira si la vérification de l'authentification prend un peu de temps
      )}
    </MDBContainer>
  );
}

export default Dashboard;
