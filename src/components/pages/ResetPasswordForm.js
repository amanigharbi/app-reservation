import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { confirmPasswordReset } from 'firebase/auth';
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBInput } from 'mdb-react-ui-kit';
import logo from '../../images/logo.png'; // Importer le logo
import { Link } from 'react-router-dom';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Récupérer le code de réinitialisation dans l'URL
  const urlParams = new URLSearchParams(location.search);
  const oobCode = urlParams.get('oobCode'); // 'oobCode' est le code de réinitialisation dans l'URL

  useEffect(() => {
    // Vérifier si le code est valide (peut être ajouté si nécessaire)
    if (!oobCode) {
      setError('Code de réinitialisation invalide.');
    }
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newPassword || !confirmPassword) {
      setError('Veuillez entrer les deux mots de passe.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      // Confirmer le code et réinitialiser le mot de passe
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage('Le mot de passe a été réinitialisé avec succès.');
      
      // Redirection vers la page de connexion après réinitialisation
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError('Une erreur s\'est produite. Veuillez vérifier le code de réinitialisation.');
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
          {/* Logo en haut de la page */}
          <div className="d-flex flex-row align-items-center justify-content-center">
            <img src={logo} alt="ReserGo Logo" className="img-fluid" style={{ maxWidth: '200px', maxHeight: '150px', marginTop: '-10%' }} />
          </div>

          <h3 className="text-center mb-4">Réinitialiser votre mot de passe</h3>

          {/* Affichage du message d'erreur ou de confirmation */}
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}

          <MDBInput
            wrapperClass='mb-4'
            label='Nouveau mot de passe'
            id='formControlLg'
            type='password'
            size="lg"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <MDBInput
            wrapperClass='mb-4'
            label='Confirmer le mot de passe'
            id='formControlLg'
            type='password'
            size="lg"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className='text-center text-md-center mt-4 pt-2'>
            <MDBBtn 
              className="mb-0 px-5 " 
              size='lg' 
              onClick={handleSubmit} 
              style={{ textTransform: 'none' }}
              disabled={loading}  // Désactiver le bouton pendant l'envoi
            >
              {loading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
            </MDBBtn>
          </div>

          <div className="text-center mt-3">
            <p>Retour à la page de <Link to="/login" className="link-danger">connexion</Link></p>
          </div>
        </MDBCol>
      </MDBRow>

      {/* Copyright section at the bottom */}
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

export default ResetPasswordForm;
