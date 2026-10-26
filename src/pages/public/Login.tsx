import { Loader2, Mail, Smartphone } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Field } from "@/components/market/EnquiryDialog"
import { AuthShell, RoleToggle } from "@/components/public/AuthShell"
import { OtpStep } from "@/components/public/OtpStep"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from "@/store/app"

type AccountType = "buyer" | "supplier"

export default function Login() {
  const setRole = useApp((s) => s.setRole)
  const navigate = useNavigate()
  const [type, setType] = useState<AccountType>("buyer")
  const [method, setMethod] = useState<"mobile" | "email">("mobile")
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [otp, setOtp] = useState(false)

  const valid = method === "mobile" ? /^[+\d\s-]{10,}$/.test(value) : /^\S+@\S+\.\S+$/.test(value)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) {
      setError(method === "mobile" ? "Enter a valid 10-digit mobile number" : "Enter a valid email address")
      return
    }
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      setOtp(true)
    }, 600)
  }

  const done = () => {
    setRole(type)
    toast.success(type === "buyer" ? "Welcome back, Rohan" : "Welcome back, Volta Electronics")
    navigate(type === "buyer" ? "/buyer" : "/supplier")
  }

  return (
    <AuthShell title="Sign in to TradeSetu" subtitle="Use your registered mobile number or email — we'll send a one-time code.">
      {otp ? (
        <OtpStep destination={value} onVerified={done} onBack={() => setOtp(false)} cta="Verify & sign in" />
      ) : (
        <form onSubmit={submit} noValidate className="grid gap-5">
          <RoleToggle
            value={type}
            onChange={setType}
            options={[
              { value: "buyer", label: "I'm a buyer", sub: "Source products" },
              { value: "supplier", label: "I'm a supplier", sub: "Manage leads & catalogue" },
            ]}
          />
          <Tabs value={method} onValueChange={(v) => { setMethod(v as typeof method); setValue(""); setError("") }}>
            <TabsList className="w-full">
              <TabsTrigger value="mobile">
                <Smartphone /> Mobile OTP
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail /> Email
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Field label={method === "mobile" ? "Mobile number" : "Email address"} error={error}>
            <Input
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError("")
              }}
              type={method === "email" ? "email" : "tel"}
              placeholder={method === "mobile" ? "+91 98XXX XXXXX" : "you@company.in"}
              className="h-11"
              aria-invalid={!!error}
            />
          </Field>
          <Button type="submit" size="lg" className="h-11" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Send OTP
          </Button>
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
            onClick={() => {
              setMethod("mobile")
              setValue(type === "buyer" ? "+91 98220 41234" : "+91 98100 22345")
            }}
          >
            Use demo {type} account
          </button>
          <p className="text-center text-sm text-muted-foreground">
            New to TradeSetu?{" "}
            <Link to={`/register${type === "supplier" ? "?type=supplier" : ""}`} className="font-medium text-primary hover:underline">
              Create a free account
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}
