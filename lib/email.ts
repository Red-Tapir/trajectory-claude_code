import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_for_build')

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@trajectory.fr'

export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  clientName,
  total,
  currency,
  pdfUrl,
}: {
  to: string
  invoiceNumber: string
  clientName: string
  total: number
  currency: string
  pdfUrl?: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Nouvelle facture ${invoiceNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #00876c;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background-color: #f9f9f9;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
                border-radius: 0 0 8px 8px;
              }
              .invoice-details {
                background-color: white;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
                border-left: 4px solid #00876c;
              }
              .total {
                font-size: 24px;
                font-weight: bold;
                color: #00876c;
              }
              .button {
                display: inline-block;
                background-color: #00876c;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Trajectory</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${clientName},</h2>
              <p>Vous avez reçu une nouvelle facture.</p>

              <div class="invoice-details">
                <p><strong>Numéro de facture :</strong> ${invoiceNumber}</p>
                <p><strong>Montant total :</strong> <span class="total">${total.toFixed(2)} ${currency}</span></p>
              </div>

              ${pdfUrl ? `<a href="${pdfUrl}" class="button">Télécharger la facture PDF</a>` : ''}

              <p>Merci pour votre confiance.</p>
              <p>Cordialement,<br>L'équipe Trajectory</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string
  name: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Bienvenue sur Trajectory !',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #00876c;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background-color: #f9f9f9;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
                border-radius: 0 0 8px 8px;
              }
              .features {
                background-color: white;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
              }
              .feature {
                margin: 15px 0;
                padding-left: 30px;
                position: relative;
              }
              .feature:before {
                content: "✓";
                position: absolute;
                left: 0;
                color: #00876c;
                font-weight: bold;
                font-size: 20px;
              }
              .button {
                display: inline-block;
                background-color: #00876c;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Trajectory</h1>
              <p>Bienvenue à bord !</p>
            </div>
            <div class="content">
              <h2>Bonjour ${name},</h2>
              <p>Nous sommes ravis de vous accueillir sur Trajectory, votre plateforme tout-en-un pour gérer votre entreprise.</p>

              <div class="features">
                <h3>Voici ce que vous pouvez faire dès maintenant :</h3>
                <div class="feature">Gérer vos clients et prospects (CRM)</div>
                <div class="feature">Créer et envoyer des factures professionnelles</div>
                <div class="feature">Planifier votre budget et vos finances</div>
                <div class="feature">Analyser vos performances avec des rapports détaillés</div>
              </div>

              <p>Votre essai gratuit de 14 jours commence maintenant - aucune carte bancaire requise.</p>

              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Accéder à mon tableau de bord</a>

              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>

              <p>Bonne journée,<br>L'équipe Trajectory</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmail({
  to,
  resetToken,
}: {
  to: string
  resetToken: string
}) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Réinitialisation de votre mot de passe Trajectory',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #00876c;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background-color: #f9f9f9;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
                border-radius: 0 0 8px 8px;
              }
              .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .button {
                display: inline-block;
                background-color: #00876c;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Trajectory</h1>
            </div>
            <div class="content">
              <h2>Réinitialisation de mot de passe</h2>
              <p>Vous avez demandé à réinitialiser votre mot de passe.</p>

              <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>

              <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>

              <div class="warning">
                <strong>⚠️ Important :</strong> Ce lien est valable pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
              </div>

              <p>Cordialement,<br>L'équipe Trajectory</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending password reset email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error }
  }
}

/**
 * Send organization invitation email
 */
export async function sendInvitationEmail(params: {
  to: string
  organizationName: string
  invitedByName: string
  invitationUrl: string
  roleName: string
}) {
  const { to, organizationName, invitedByName, invitationUrl, roleName } = params

  if (!resend) {
    console.warn('Resend API not configured, skipping invitation email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@trajectory.fr',
      to,
      subject: `Invitation à rejoindre ${organizationName} sur Trajectory`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                background: white;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
                border-radius: 0 0 10px 10px;
              }
              .invitation-box {
                background: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .invitation-box h3 {
                margin-top: 0;
                color: #667eea;
              }
              .invitation-detail {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e0e0e0;
              }
              .invitation-detail:last-child {
                border-bottom: none;
              }
              .invitation-detail strong {
                color: #333;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white !important;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 8px;
                margin: 25px 0;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
              }
              .button:hover {
                box-shadow: 0 6px 8px rgba(102, 126, 234, 0.4);
              }
              .info-box {
                background: #e8f4fd;
                border: 1px solid #bee5eb;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
                font-size: 14px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #666;
                font-size: 12px;
              }
              .expiry {
                color: #dc3545;
                font-weight: 600;
                margin-top: 15px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎉 Vous êtes invité !</h1>
            </div>
            <div class="content">
              <p>Bonjour,</p>

              <p><strong>${invitedByName}</strong> vous invite à rejoindre <strong>${organizationName}</strong> sur Trajectory, la plateforme de gestion financière pour les PME et freelances.</p>

              <div class="invitation-box">
                <h3>📋 Détails de l'invitation</h3>
                <div class="invitation-detail">
                  <span>Organisation :</span>
                  <strong>${organizationName}</strong>
                </div>
                <div class="invitation-detail">
                  <span>Rôle attribué :</span>
                  <strong>${roleName}</strong>
                </div>
                <div class="invitation-detail">
                  <span>Invité par :</span>
                  <strong>${invitedByName}</strong>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="${invitationUrl}" class="button">
                  ✨ Accepter l'invitation
                </a>
              </div>

              <div class="info-box">
                <strong>💡 Que se passe-t-il ensuite ?</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Cliquez sur le bouton ci-dessus</li>
                  <li>Si vous avez déjà un compte, connectez-vous</li>
                  <li>Sinon, créez rapidement un compte</li>
                  <li>Vous rejoindrez automatiquement l'organisation</li>
                </ul>
              </div>

              <p class="expiry">
                ⏰ Cette invitation expire dans 7 jours.
              </p>

              <p style="margin-top: 30px;">
                Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email en toute sécurité.
              </p>

              <p>Cordialement,<br>L'équipe Trajectory</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              <p>Si le bouton ne fonctionne pas, copiez ce lien : <a href="${invitationUrl}">${invitationUrl}</a></p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending invitation email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending invitation email:', error)
    return { success: false, error }
  }
}
