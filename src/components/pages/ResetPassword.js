import React, { useState } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBInput } from 'mdb-react-ui-kit';
import { auth, db } from '../../firebase'; // Assure-toi que db est bien exporté de firebase.js
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Pour Firestore
import { Link } from 'react-router-dom';
import '../styles/Pages.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import logo from '../../images/logo.png';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Veuillez entrer une adresse email.');
      return;
    }

    setLoading(true);
    try {
      // Vérifier si l'utilisateur existe dans Firestore
      const usersRef = collection(db, 'users'); // Remplace 'users' si ta collection a un autre nom
      const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Aucun utilisateur trouvé avec cet email.");
        return;
      }

      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setMessage("Un lien de réinitialisation a été envoyé à votre adresse email.");
    } catch (err) {
      console.error(err);
      setError("Une erreur s'est produite. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MDBContainer fluid className="p-12 my-5 h-custom">
      <MDBRow>
        <MDBCol col='10' md='6'>
          <img 
            src="https://plus.unsplash.com/premium_photo-1663076518116-0f0637626edf?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            className="img-fluid" 
            alt="Illustration de réservation" 
          />
        </MDBCol>
      
        <MDBCol col='4' md='6'>
          <div className="d-flex flex-row align-items-center justify-content-center">
            <img src={logo} alt="ReserGo Logo" className="img-fluid" style={{ maxWidth: '200px', maxHeight: '150px', marginTop: '-10%' }} />
          </div>

          <h3 className="text-center mb-4">Réinitialiser le mot de passe</h3>

          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}

          <MDBInput
            wrapperClass='mb-4'
            label='Adresse e-mail'
            id='formControlLg'
            type='email'
            size="lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className='text-center text-md-center mt-4 pt-2'>
            <MDBBtn
              className="mb-0 px-5"
              size='lg'
              onClick={handleSubmit}
              disabled={loading}
              style={{ textTransform: 'none' }}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </MDBBtn>
          </div>

          <div className="text-center mt-3">
            <p>Retour à la page de <Link to="/login" className="link-danger">connexion</Link></p>
          </div>
        </MDBCol>
      </MDBRow>

      <footer className="footer">
        <div className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
          <div className="text-white mb-3 mb-md-0">
            Copyright © 2025. Tous droits réservés.
          </div>
        </div>
      </footer>
    </MDBContainer>
  );
}

export default ResetPassword;
