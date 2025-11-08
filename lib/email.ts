import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
