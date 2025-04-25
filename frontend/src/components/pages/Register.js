import React, { useState } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBIcon, MDBInput } from 'mdb-react-ui-kit';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db, setDoc, doc } from '../../firebase'; // Importer Firestore pour ajouter les données
import '../styles/Pages.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { useNavigate } from 'react-router-dom';
import logo from '../../images/logo.png';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [successMessage, setSuccessMessage] = useState(''); // Message de succès
  const navigate = useNavigate();

  // Fonction de validation du mot de passe
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  // Fonction pour gérer la vérification en temps réel
  const handleInputChange = (e) => {
    const { id, value } = e.target;

    // Mettre à jour la valeur du champ
    switch (id) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'username':
        setUsername(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      default:
        break;
    }

    // Validation en temps réel des champs
    let errors = { ...formErrors };

    switch (id) {
      case 'firstName':
        errors.firstName = value ? '' : "Le prénom est requis.";
        break;
      case 'lastName':
        errors.lastName = value ? '' : "Le nom est requis.";
        break;
      case 'username':
        errors.username = value ? '' : "Le nom d'utilisateur est requis.";
        break;
      case 'email':
        errors.email = value
          ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ? ''
            : "Veuillez entrer un email valide."
          : "L'adresse e-mail est requise.";
        break;
      case 'password':
        errors.password = value
          ? validatePassword(value)
            ? ''
            : "Le mot de passe doit contenir au moins 8 caractères, une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial."
          : "Le mot de passe est requis.";
        break;
      case 'confirmPassword':
        errors.confirmPassword = value
          ? value === password
            ? ''
            : "Les mots de passe ne correspondent pas."
          : "La confirmation du mot de passe est requise.";
        break;
      default:
        break;
    }

    setFormErrors(errors);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage(''); 
  
    // Vérification des erreurs avant l'envoi
    if (Object.values(formErrors).some((error) => error !== '')) {
      setError("Veuillez corriger les erreurs avant de soumettre le formulaire.");
      return;
    }
  
    try {
      // Créer l'utilisateur avec Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Sauvegarder les informations supplémentaires dans Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        username,
        email,
        createdAt: new Date()
      });
  
      // Afficher le message de succès
      setSuccessMessage("Utilisateur inscrit avec succès ! Vous allez être redirigé vers la page de connexion.");
  
      // Redirection après 5 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirige après 3 secondes
  
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      setError("Erreur lors de la création du compte. L'email est peut-être déjà utilisé.");
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Sauvegarder les informations de l'utilisateur dans Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: user.displayName.split(' ')[0],
        lastName: user.displayName.split(' ')[1],
        username: user.displayName,
        email: user.email,
        createdAt: new Date()
      });

      // Afficher le message de succès
      setSuccessMessage("Connexion réussie avec Google ! Vous allez être redirigé vers la page d'accueil.");

      // Redirection après 3 secondes
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      console.error("Erreur lors de l'inscription Google", err);
      setError("Erreur lors de la connexion avec Google");
    }
  };

  return (
    <MDBContainer fluid className="p-12 my-5 h-custom">
      <MDBRow>
        <MDBCol col='10' md='6'>
          <img
            src="https://plus.unsplash.com/premium_photo-1663076518116-0f0637626edf?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="img-fluid"
            alt="Illustration d'inscription"
          />
        </MDBCol>

        <MDBCol col='4' md='6'>
          <div className="d-flex flex-row align-items-center justify-content-center">
            <img src={logo} alt="ReserGo Logo" className="img-fluid" style={{ maxWidth: '200px', maxHeight: '150px', marginTop: '-15%' }} />
          </div>

          <div className="d-flex flex-row align-items-center justify-content-center">
            <p className="lead fw-normal mb-0 me-3">S'inscrire avec</p>
            <MDBBtn floating size='md' tag='a' className='me-2' onClick={handleGoogleLogin}>
              <MDBIcon fab icon='google' />
            </MDBBtn>
             <MDBBtn floating size='md' tag='a' className='me-2'>
                                   <MDBIcon fab icon='facebook-f' />
                                 </MDBBtn>
                                 <MDBBtn floating size='md' tag='a' className='me-2'>
                                   <MDBIcon fab icon='twitter' />
                                 </MDBBtn>
          </div>

          <div className="divider d-flex align-items-center my-4">
            <p className="text-center fw-bold mx-3 mb-0">Ou</p>
          </div>

          {/* Affichage des erreurs globales */}
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

          {/* Affichage du message de succès */}
          {successMessage && <p style={{ color: 'green', textAlign: 'center' }}>{successMessage}</p>}

          {/* Prénom & Nom */}
          <MDBRow className="mb-4">
            <MDBCol md="6">
              <MDBInput
                label='Prénom'
                id='firstName'
                type='text'
                size="lg"
                value={firstName}
                onChange={handleInputChange}
              />
              {formErrors.firstName && <p style={{ color: 'red' }}>{formErrors.firstName}</p>}
            </MDBCol>
            <MDBCol md="6">
              <MDBInput
                label='Nom'
                id='lastName'
                type='text'
                size="lg"
                value={lastName}
                onChange={handleInputChange}
              />
              {formErrors.lastName && <p style={{ color: 'red' }}>{formErrors.lastName}</p>}
            </MDBCol>
          </MDBRow>

          {/* Nom d'utilisateur */}
          <MDBInput
            wrapperClass='mb-4'
            label="Nom d'utilisateur"
            id='username'
            type='text'
            size="lg"
            value={username}
            onChange={handleInputChange}
          />
          {formErrors.username && <p style={{ color: 'red' }}>{formErrors.username}</p>}

          {/* Email */}
          <MDBInput
            wrapperClass='mb-4'
            label='Adresse e-mail'
            id='email'
            type='email'
            size="lg"
            value={email}
            onChange={handleInputChange}
          />
          {formErrors.email && <p style={{ color: 'red' }}>{formErrors.email}</p>}

          {/* Mot de passe & Confirmation */}
          <MDBRow className="mb-4">
            <MDBCol md="6">
              <MDBInput
                label='Mot de passe'
                id='password'
                type='password'
                size="lg"
                value={password}
                onChange={handleInputChange}
              />
              {formErrors.password && <p style={{ color: 'red' }}>{formErrors.password}</p>}
            </MDBCol>
            <MDBCol md="6">
              <MDBInput
                label='Confirmer le mot de passe'
                id='confirmPassword'
                type='password'
                size="lg"
                value={confirmPassword}
                onChange={handleInputChange}
              />
              {formErrors.confirmPassword && <p style={{ color: 'red' }}>{formErrors.confirmPassword}</p>}
            </MDBCol>
          </MDBRow>

          <div className='text-center text-md-center mt-4 pt-2'>
            <MDBBtn className="mb-0 px-5" size='lg' onClick={handleRegister} style={{ textTransform: 'none' }}>S'inscrire</MDBBtn>
            <p className="small fw-bold mt-2 pt-1 mb-2">
              Vous avez déjà un compte ? <a href="/login" className="link-danger">Se connecter</a>
            </p>
          </div>
        </MDBCol>
      </MDBRow>

    <footer className="footer-log">
          <div className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
            <div className="text-white mb-3 mb-md-0">
            © 2025 ReserGo. Tous droits réservés.
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

export default Register;
