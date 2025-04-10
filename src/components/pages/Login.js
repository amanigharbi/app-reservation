import React, { useState } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBIcon, MDBInput, MDBCheckbox } from 'mdb-react-ui-kit';
import { auth } from '../../firebase'; // Importer auth de firebase.js
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importer la fonction pour la connexion
import '../styles/Pages.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css'; // Importation du CSS de MDB React UI Kit
import { Link } from 'react-router-dom';
import logo from '../../images/logo.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Réinitialiser les erreurs à chaque soumission

    try {
      await signInWithEmailAndPassword(auth, email, password);  // Connexion avec Firebase
      console.log('Utilisateur connecté avec succès');
      // Tu peux ajouter une redirection ici avec React Router ou autre
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <MDBContainer fluid className="p-12 my-5 h-custom">
    <MDBRow>
      <MDBCol col='10' md='6'>
        <img src="https://plus.unsplash.com/premium_photo-1663076518116-0f0637626edf?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
          className="img-fluid" 
          alt="Illustration de réservation" />
      </MDBCol>
      
      <MDBCol col='4' md='6'>
        {/* Logo en haut de la section "Se connecter" */}
        <div className="d-flex flex-row align-items-center justify-content-center">
            <img src={logo} alt="ReserGo Logo" className="img-fluid" style={{ maxWidth: '200px' , maxHeight :'150px' ,marginTop:'-10%'}} />
          </div>
        <div className="d-flex flex-row align-items-center justify-content-center">
          <p className="lead fw-normal mb-0 me-3">Se connecter avec</p>
 
          <MDBBtn floating size='md' tag='a' className='me-2'>
            <MDBIcon fab icon='facebook-f' />
          </MDBBtn>
 
          <MDBBtn floating size='md' tag='a' className='me-2'>
            <MDBIcon fab icon='twitter' />
          </MDBBtn>
 
          <MDBBtn floating size='md' tag='a' className='me-2'>
            <MDBIcon fab icon='linkedin-in' />
          </MDBBtn>
        </div>
 
        <div className="divider d-flex align-items-center my-4">
          <p className="text-center fw-bold mx-3 mb-0">Ou</p>
        </div>
 
        {/* Affichage de l'erreur */}
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
 
        <MDBInput
          wrapperClass='mb-4'
          label='Adresse e-mail'
          id='formControlLg'
          type='email'
          size="lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}  // Mettre à jour l'email
        />
        <MDBInput
          wrapperClass='mb-4'
          label='Mot de passe'
          id='formControlLg'
          type='password'
          size="lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}  // Mettre à jour le mot de passe
        />
 
        <div className="d-flex justify-content-between mb-4">
          <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Se souvenir de moi' />
          <Link to="/reset-password">Mot de passe oublié ?</Link>

        </div>
 
        <div className='text-center text-md-center mt-4 pt-2'>
        <MDBBtn className="mb-0 px-5" size="lg" onClick={handleSubmit} style={{ textTransform: 'none' }}>
  Se connecter
</MDBBtn>          <p className="small fw-bold mt-2 pt-1 mb-2">Vous n'avez pas de compte ? 
            <Link to="/register" className="link-danger">S'inscrire</Link>
          </p>
        </div>
      </MDBCol>
    </MDBRow>
 
    {/* Copyright section at the bottom */}
    <footer className="footer">
      <div className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
        <div className="text-white mb-3 mb-md-0">
          Copyright © 2025. Tous droits réservés.
        </div>
 
        <div>
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
            <MDBIcon fab icon='facebook-f' size="md" />
          </MDBBtn>
 
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
            <MDBIcon fab icon='twitter' size="md" />
          </MDBBtn>
 
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
            <MDBIcon fab icon='google' size="md" />
          </MDBBtn>
 
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
            <MDBIcon fab icon='linkedin-in' size="md" />
          </MDBBtn>
        </div>
      </div>
    </footer>
  </MDBContainer>
 
  );
}

export default Login;
