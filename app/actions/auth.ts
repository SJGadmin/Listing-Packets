'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_PASSWORD = 'WhoisJane!59'
const COOKIE_NAME = 'admin_session'

export async function login(prevState: any, formData: FormData) {
    const password = formData.get('password') as string

    if (password === ADMIN_PASSWORD) {
        const cookieStore = await cookies()
        cookieStore.set(COOKIE_NAME, 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        })
        redirect('/admin')
    } else {
        return { error: 'Incorrect password' }
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
    redirect('/')
}
