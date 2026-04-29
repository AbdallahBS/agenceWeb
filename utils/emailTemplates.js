exports.welcomeEmail = ({ prenom, nom, email }) => {
  const fullName = `${prenom} ${nom}`.trim();

  const subject = 'Bienvenue chez Agence Voyage !';

  const text = `Bonjour ${fullName},

Merci de vous être inscrit(e) sur Agence Voyage !
Votre compte (${email}) a bien été créé.

Vous pouvez dès maintenant :
- Parcourir nos voyages
- Réserver votre prochaine aventure
- Laisser des avis sur vos séjours

À très bientôt,
L'équipe Agence Voyage
`;

  const html = `<!DOCTYPE html>
<html lang="fr">
  <body style="font-family: Arial, sans-serif; background:#f6f8fb; margin:0; padding:32px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <tr>
        <td style="background:#1e40af; color:#fff; padding:24px 32px;">
          <h1 style="margin:0; font-size:22px;">Agence Voyage</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h2 style="margin-top:0; color:#111827;">Bienvenue ${fullName} !</h2>
          <p style="color:#374151; line-height:1.6;">
            Merci de vous être inscrit(e). Votre compte associé à l'adresse
            <strong>${email}</strong> a bien été créé.
          </p>
          <p style="color:#374151; line-height:1.6;">
            Vous pouvez dès maintenant parcourir nos voyages, réserver votre
            prochaine aventure et laisser vos avis sur vos séjours.
          </p>
          <p style="margin-top:32px; color:#6b7280; font-size:13px;">
            À très bientôt,<br/>L'équipe Agence Voyage
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
};

exports.resetPasswordEmail = ({ prenom, nom, resetUrl }) => {
  const fullName = `${prenom} ${nom}`.trim();
  const subject = 'Reinitialisation de votre mot de passe';

  const text = `Bonjour ${fullName},

Nous avons recu une demande de reinitialisation de votre mot de passe.
Cliquez sur le lien suivant pour definir un nouveau mot de passe :
${resetUrl}

Ce lien expire dans 15 minutes.
Si vous n'etes pas a l'origine de cette demande, ignorez cet email.

L'equipe Agence Voyage
`;

  const html = `<!DOCTYPE html>
<html lang="fr">
  <body style="font-family: Arial, sans-serif; background:#f6f8fb; margin:0; padding:32px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <tr>
        <td style="background:#1e40af; color:#fff; padding:24px 32px;">
          <h1 style="margin:0; font-size:22px;">Agence Voyage</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h2 style="margin-top:0; color:#111827;">Reinitialisation du mot de passe</h2>
          <p style="color:#374151; line-height:1.6;">
            Bonjour <strong>${fullName}</strong>, nous avons recu une demande de reinitialisation.
          </p>
          <p style="color:#374151; line-height:1.6;">
            Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
          </p>
          <p style="margin:24px 0;">
            <a href="${resetUrl}" style="display:inline-block; background:#1e40af; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:8px;">
              Reinitialiser mon mot de passe
            </a>
          </p>
          <p style="color:#6b7280; line-height:1.6; font-size:13px;">
            Ce lien expire dans 15 minutes. Si vous n'etes pas a l'origine de cette demande, ignorez cet email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
};

exports.reservationStatusEmail = ({
  prenom,
  nom,
  voyageTitre,
  status,
  montantTotal,
  paymentUrl,
  paymentExpiresAt,
}) => {
  const fullName = `${prenom || ''} ${nom || ''}`.trim() || 'Client';
  const voyage = voyageTitre || 'votre voyage';
  const montant = typeof montantTotal === 'number' ? `${montantTotal} TND` : 'non défini';
  const isConfirmed = status === 'confirmee';
  const statusLabel = isConfirmed ? 'acceptée' : 'annulée';

  const expiryText = paymentExpiresAt
    ? new Date(paymentExpiresAt).toLocaleString('fr-FR')
    : null;
  const subject = `Votre réservation a été ${statusLabel}`;
  const text = `Bonjour ${fullName},

Votre réservation pour "${voyage}" a été ${statusLabel}.
Montant: ${montant}
${isConfirmed && paymentUrl ? `Lien de paiement Konnect: ${paymentUrl}` : ''}
${isConfirmed && expiryText ? `Ce lien expire le: ${expiryText}` : ''}

Merci,
L'équipe Agence Voyage
`;

  const html = `<!DOCTYPE html>
<html lang="fr">
  <body style="font-family: Arial, sans-serif; background:#f6f8fb; margin:0; padding:32px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <tr>
        <td style="background:${isConfirmed ? '#047857' : '#b91c1c'}; color:#fff; padding:24px 32px;">
          <h1 style="margin:0; font-size:22px;">Agence Voyage</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h2 style="margin-top:0; color:#111827;">Réservation ${statusLabel}</h2>
          <p style="color:#374151; line-height:1.6;">
            Bonjour <strong>${fullName}</strong>,
          </p>
          <p style="color:#374151; line-height:1.6;">
            Votre réservation pour <strong>${voyage}</strong> a été <strong>${statusLabel}</strong>.
          </p>
          <p style="color:#374151; line-height:1.6;">
            Montant: <strong>${montant}</strong>
          </p>
          ${
            isConfirmed && paymentUrl
              ? `<p style="color:#374151; line-height:1.6;">
            Lien de paiement Konnect:
            <a href="${paymentUrl}" style="color:#1e40af; word-break:break-all;">${paymentUrl}</a>
          </p>`
              : ''
          }
          ${
            isConfirmed && expiryText
              ? `<p style="color:#b91c1c; line-height:1.6;">
            Ce lien expire le <strong>${expiryText}</strong>. Après expiration, la réservation sera annulée automatiquement.
          </p>`
              : ''
          }
          <p style="margin-top:24px; color:#6b7280; font-size:13px;">
            Merci,<br/>L'équipe Agence Voyage
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
};
