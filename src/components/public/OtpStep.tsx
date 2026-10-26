import { useState, type FormEvent } from "react"
import { SimulatedNote } from "@/components/common/bits"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/** Simulated OTP verification. Demo code is 1234; production uses an SMS gateway / WhatsApp auth template. */
export function OtpStep({
  destination,
  onVerified,
  onBack,
  cta = "Verify",
}: {
  destination: string
  onVerified: () => void
  onBack?: () => void
  cta?: string
}) {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [resent, setResent] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (otp !== "1234") {
      setError("Incorrect code. Use 1234 in this demo.")
      return
    }
    onVerified()
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div>
        <h3 className="text-lg font-semibold">Enter verification code</h3>
        <p className="text-sm text-muted-foreground">We sent a 4-digit code to {destination}.</p>
      </div>
      <Input
        autoFocus
        inputMode="numeric"
        maxLength={4}
        value={otp}
        onChange={(e) => {
          setOtp(e.target.value.replace(/\D/g, ""))
          setError("")
        }}
        className="h-12 text-center text-2xl tracking-[0.6em]"
        aria-invalid={!!error}
        aria-label="One-time password"
      />
      {error && <p className="-mt-2 text-xs text-destructive">{error}</p>}
      <Button type="submit" size="lg" disabled={otp.length !== 4}>
        {cta}
      </Button>
      <div className="flex items-center justify-between text-xs">
        {onBack ? (
          <button type="button" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            ← Change details
          </button>
        ) : (
          <span />
        )}
        <button type="button" onClick={() => setResent(true)} className="font-medium text-primary hover:underline" disabled={resent}>
          {resent ? "Code resent" : "Resend code"}
        </button>
      </div>
      <SimulatedNote>Demo OTP is 1234. Production delivers OTP via SMS gateway and WhatsApp authentication template.</SimulatedNote>
    </form>
  )
}
