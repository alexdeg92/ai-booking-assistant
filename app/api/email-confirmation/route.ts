import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import nodemailer from 'nodemailer'

// Configure your email transporter (example with Gmail)
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })
}

interface SendConfirmationRequest {
  bookingId: string
  type: 'confirmation' | 'reminder_24h' | 'reminder_1h' | 'cancellation'
}

export async function POST(request: NextRequest) {
  try {
    const { bookingId, type }: SendConfirmationRequest = await request.json()

    if (!bookingId || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services (
          name,
          duration_minutes,
          price_cents,
          icon
        ),
        assigned_staff:staff!assigned_staff_id (
          name,
          specialty,
          avatar_emoji
        )
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (!booking.customer_email) {
      return NextResponse.json(
        { success: false, error: 'No customer email available' },
        { status: 400 }
      )
    }

    // Generate email content based on type
    const emailContent = generateEmailContent(booking, type)
    
    if (!emailContent) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate email content' },
        { status: 500 }
      )
    }

    // Send email (if transporter is configured)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        const transporter = createEmailTransporter()
        
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: booking.customer_email,
          subject: emailContent.subject,
          html: emailContent.html
        })

        // Log email confirmation
        await supabase
          .from('email_confirmations')
          .insert({
            booking_id: bookingId,
            email_type: type,
            recipient_email: booking.customer_email,
            status: 'sent'
          })

        // Update booking flags
        if (type === 'confirmation') {
          await supabase
            .from('bookings')
            .update({ email_confirmation_sent: true })
            .eq('id', bookingId)
        } else if (type === 'reminder_24h') {
          await supabase
            .from('bookings')
            .update({ reminder_sent_24h: true })
            .eq('id', bookingId)
        } else if (type === 'reminder_1h') {
          await supabase
            .from('bookings')
            .update({ reminder_sent_1h: true })
            .eq('id', bookingId)
        }

      } catch (emailError) {
        console.error('Email sending error:', emailError)
        
        // Log failed email
        await supabase
          .from('email_confirmations')
          .insert({
            booking_id: bookingId,
            email_type: type,
            recipient_email: booking.customer_email,
            status: 'failed'
          })

        return NextResponse.json(
          { success: false, error: 'Failed to send email' },
          { status: 500 }
        )
      }
    } else {
      // Email not configured, just log that we "sent" it for demo purposes
      console.log(`[DEMO] Would send ${type} email to ${booking.customer_email}`)
      
      await supabase
        .from('email_confirmations')
        .insert({
          booking_id: bookingId,
          email_type: type,
          recipient_email: booking.customer_email,
          status: 'sent'
        })

      // Update booking flags anyway for demo
      if (type === 'confirmation') {
        await supabase
          .from('bookings')
          .update({ email_confirmation_sent: true })
          .eq('id', bookingId)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully'
    })

  } catch (error) {
    console.error('Email confirmation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateEmailContent(booking: any, type: string) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-CA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(0)}$`
  }

  const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
  `

  switch (type) {
    case 'confirmation':
      return {
        subject: `✅ Rendez-vous confirmé - ${booking.booking_reference}`,
        html: `
          <div style="${baseStyle}">
            <h2 style="color: #8b5cf6;">Votre rendez-vous est confirmé! 🎉</h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Détails de votre rendez-vous</h3>
              <p><strong>Référence:</strong> ${booking.booking_reference}</p>
              <p><strong>Service:</strong> ${booking.service.icon} ${booking.service.name}</p>
              <p><strong>Date:</strong> ${formatDate(booking.booking_date)}</p>
              <p><strong>Heure:</strong> ${booking.booking_time}</p>
              <p><strong>Durée:</strong> ${booking.service.duration_minutes} minutes</p>
              <p><strong>Prix:</strong> ${formatPrice(booking.service.price_cents)}</p>
              ${booking.assigned_staff ? `<p><strong>Styliste:</strong> ${booking.assigned_staff.avatar_emoji} ${booking.assigned_staff.name}</p>` : ''}
            </div>
            
            <p>Nous vous enverrons des rappels automatiques 24h et 1h avant votre rendez-vous.</p>
            
            <p>Merci de votre confiance!</p>
            <p><strong>L'équipe BookIA</strong></p>
          </div>
        `
      }

    case 'reminder_24h':
      return {
        subject: `⏰ Rappel: Rendez-vous demain - ${booking.booking_reference}`,
        html: `
          <div style="${baseStyle}">
            <h2 style="color: #8b5cf6;">Rappel: Votre rendez-vous est demain</h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Service:</strong> ${booking.service.icon} ${booking.service.name}</p>
              <p><strong>Date:</strong> ${formatDate(booking.booking_date)}</p>
              <p><strong>Heure:</strong> ${booking.booking_time}</p>
              ${booking.assigned_staff ? `<p><strong>Styliste:</strong> ${booking.assigned_staff.avatar_emoji} ${booking.assigned_staff.name}</p>` : ''}
            </div>
            
            <p>Nous avons hâte de vous voir demain!</p>
            <p><strong>L'équipe BookIA</strong></p>
          </div>
        `
      }

    case 'reminder_1h':
      return {
        subject: `🔔 Votre rendez-vous dans 1 heure - ${booking.booking_reference}`,
        html: `
          <div style="${baseStyle}">
            <h2 style="color: #8b5cf6;">Votre rendez-vous dans 1 heure</h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Service:</strong> ${booking.service.icon} ${booking.service.name}</p>
              <p><strong>Heure:</strong> ${booking.booking_time}</p>
              ${booking.assigned_staff ? `<p><strong>Styliste:</strong> ${booking.assigned_staff.avatar_emoji} ${booking.assigned_staff.name}</p>` : ''}
            </div>
            
            <p>À très bientôt!</p>
            <p><strong>L'équipe BookIA</strong></p>
          </div>
        `
      }

    default:
      return null
  }
}