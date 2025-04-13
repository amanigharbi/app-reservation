const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// Vérification des rappels et envoi des emails
exports.sendReminderEmails = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  const now = new Date();
  const tenMinutesBefore = new Date(now.getTime() + 10 * 60000); // 10 minutes avant

  const reservationsRef = db.collection("reservations");
  const snapshot = await reservationsRef.get();

  snapshot.forEach(doc => {
    const reservation = doc.data();
    reservation.rappels.forEach(async (rappelDate) => {
      const rappelTime = new Date(rappelDate);

      // Si le rappel est dans les 10 prochaines minutes
      if (rappelTime <= tenMinutesBefore && rappelTime > now) {
        // Envoi de l'email
        await sendEmailNotification(reservation.utilisateurId, reservation, rappelTime);
      }
    });
  });

  console.log('Vérification des rappels terminée.');
});

// Fonction pour envoyer un email
async function sendEmailNotification(userEmail, reservation, rappelTime) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "votre-email@gmail.com",
      pass: "votre-mot-de-passe", // ou mot de passe d'application si 2FA est activé
    },
  });

  const message = {
    from: "votre-email@gmail.com",
    to: userEmail,
    subject: "Rappel de réservation",
    text: `Bonjour,

    Ce message vous rappelle que vous avez une réservation avec le code ${reservation.code_reservation} prévue pour le ${new Date(reservation.date).toLocaleString()}.

    L'heure du rappel est le ${new Date(rappelTime).toLocaleString()}. Veuillez vérifier les détails de votre réservation sur notre site.

    Merci de votre confiance.

    Cordialement,
    L'équipe de ReserGo.`,
  };

  try {
    await transporter.sendMail(message);
    console.log('Rappel envoyé à:', userEmail);
  } catch (error) {
    console.log("Erreur lors de l'envoi de l'email:", error);
  }
}
