import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Hesabınıza giriş yapın
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            YerelRadar'a hoş geldiniz
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
              footerActionLink: 'text-blue-600 hover:text-blue-700',
              formFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
              headerTitle: 'text-gray-900',
              headerSubtitle: 'text-gray-600'
            }
          }}
        />
      </div>
    </div>
  )
}