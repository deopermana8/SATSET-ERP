"use client"

import { FormEvent, useState } from "react"

interface LoginFormValues {
  email: string
  password: string
  remember: boolean
}

interface FormErrors {
  email?: string
  password?: string
}

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  function validate(values: LoginFormValues) {
    const result: FormErrors = {}

    if (!values.email.trim()) {
      result.email = "Email is required"
    } else if (!validateEmail(values.email)) {
      result.email = "Enter a valid email"
    }

    if (!values.password) {
      result.password = "Password is required"
    } else if (values.password.length < 6) {
      result.password = "Password must be at least 6 characters"
    }

    return result
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const values: LoginFormValues = { email, password, remember }
    const validationErrors = validate(values)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 600))

    setIsLoading(false)
    console.log("Login payload:", values)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Welcome back</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900">Sign in to your account</h1>
          </div>

          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
              {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email}</p> : null}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <a href="/forgot-password" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  Forgot password?
                </a>
              </div>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-3 inline-flex items-center rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5.05 0-9.28-3.11-11-7.43" />
                      <path d="M1 1l22 22" />
                      <path d="M10.59 10.59a3 3 0 0 0 4.24 4.24" />
                      <path d="M9.88 5.12a10.94 10.94 0 0 1 6.24 2.18" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password ? <p className="mt-2 text-sm text-rose-600">{errors.password}</p> : null}
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.currentTarget.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-400"
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
