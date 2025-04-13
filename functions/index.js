const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "votre-email@gmail.com",
    pass: "votre-mot-de-passe",
  },
});

const sendEmail = (email, subject, text) => {
  const mailOptions = {
    from: "votre-email@gmail.com",
    to: email,
    subject: subject,
    text: text,
  };

  return transporter.sendMail(mailOptions);
};

exports.sendRappels = functions.pubsub
    .schedule("every 24 hours")
    .onRun(async (context) => {
      console.log("Vérification des rappels...");

      const reservationsRef = admin.firestore().collection("reservations");
      const snapshot = await reservationsRef.get();

      snapshot.forEach(async (doc) => {
        const reservation = doc.data();
        const userEmail = reservation.utilisateurEmail;
        const userRappels = reservation.rappels;

        userRappels.forEach((rappel) => {
          const rappelDate = new Date(rappel);
          const currentDate = new Date();

          if (rappelDate.toDateString() === currentDate.toDateString()) {
            const subject = "Rappel de réservation";
            const text = `Bonjour, ceci est un rappel pour votre réservation ${reservation.code_reservation} prévue le ${reservation.date}.`;

            sendEmail(userEmail, subject, text)
                .then(() => {
                  console.log(`Rappel envoyé à ${userEmail}`);
                })
                .catch((error) => {
                  console.error("Erreur envoi email:", error);
                });
          }
        });
      });
    });
