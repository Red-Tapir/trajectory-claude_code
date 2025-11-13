import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    // Vérifier que les variables d'environnement sont configurées
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY is not configured' },
        { status: 500 }
      )
    }

    if (!process.env.FROM_EMAIL) {
      return NextResponse.json(
        { error: 'FROM_EMAIL is not configured' },
        { status: 500 }
      )
    }

    // Envoyer un email de test
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: ['delivered@resend.dev'], // Email de test Resend
      subject: 'Test Email - Trajectory',
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
                border-radius: 8px;
              }
              .content {
                background-color: #f9f9f9;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎉 Test Email - Trajectory</h1>
            </div>
            <div class="content">
              <h2>Félicitations !</h2>
              <p>Votre configuration Resend fonctionne parfaitement !</p>
              <p><strong>Configuration :</strong></p>
              <ul>
                <li>FROM_EMAIL: ${process.env.FROM_EMAIL}</li>
                <li>Domaine: trajectory-app.com</li>
                <li>Service: Resend via Amazon SES (EU West 1)</li>
              </ul>
              <p>Vous êtes prêt à envoyer des emails de production ! ✅</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully!',
      emailId: data?.id,
      from: process.env.FROM_EMAIL,
      to: 'delivered@resend.dev',
    })
  } catch (error: any) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
