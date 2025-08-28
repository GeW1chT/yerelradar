import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'CLERK_WEBHOOK_SECRET is not configured' },
      { status: 500 }
    )
  }

  const payload = await request.text()
  const headers = {
    'svix-id': request.headers.get('svix-id') || '',
    'svix-timestamp': request.headers.get('svix-timestamp') || '',
    'svix-signature': request.headers.get('svix-signature') || '',
  }

  let event
  
  try {
    const wh = new Webhook(webhookSecret)
    event = wh.verify(payload, headers)
  } catch (error) {
    console.error('Webhook verification failed:', error)
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event.data)
        break
      case 'user.updated':
        await handleUserUpdated(event.data)
        break
      case 'user.deleted':
        await handleUserDeleted(event.data)
        break
      default:
        console.log('Unhandled webhook event:', event.type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleUserCreated(userData: any) {
  try {
    await prisma.user.create({
      data: {
        clerkId: userData.id,
        email: userData.email_addresses[0]?.email_address || '',
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        avatar: userData.image_url || '',
        level: 'BEGINNER',
        experiencePoints: 0,
        totalReviews: 0,
        helpfulVotes: 0,
      }
    })
    console.log('User created in database:', userData.id)
  } catch (error) {
    console.error('Error creating user:', error)
  }
}

async function handleUserUpdated(userData: any) {
  try {
    await prisma.user.update({
      where: { clerkId: userData.id },
      data: {
        email: userData.email_addresses[0]?.email_address || '',
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        avatar: userData.image_url || '',
      }
    })
    console.log('User updated in database:', userData.id)
  } catch (error) {
    console.error('Error updating user:', error)
  }
}

async function handleUserDeleted(userData: any) {
  try {
    await prisma.user.delete({
      where: { clerkId: userData.id }
    })
    console.log('User deleted from database:', userData.id)
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}