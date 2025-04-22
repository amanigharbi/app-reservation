const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();

// Configurer le transporteur de Nodemailer (exemple avec un SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou ton propre service
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password' // Ne pas laisser en clair en prod
  }
});

// Fonction de rappel pour envoyer les emails
exports.envoyerRappels = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const db = admin.firestore();
  const now = new Date();
  
  // Rechercher toutes les réservations avec un rappel pour aujourd'hui
  const snapshot = await db.collection('reservations').get();

  snapshot.forEach(async (doc) => {
    const reservation = doc.data();
    const rappels = reservation.rappels || [];
    
    rappels.forEach(async (rappel) => {
      const rappelDate = new Date(rappel.date);
      
      // Si le rappel est pour aujourd'hui, envoyer l'email
      if (rappelDate.toDateString() === now.toDateString()) {
        const mailOptions = {
          from: 'your-email@gmail.com',
          to: reservation.email, // Assurez-vous que l'email est stocké dans la réservation
          subject: 'Rappel de réservation',
          text: rappel.message
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Rappel envoyé à ${reservation.email}`);
        } catch (error) {
          console.error("Erreur lors de l'envoi du rappel :", error);
        }
      }
    });
  });
});
