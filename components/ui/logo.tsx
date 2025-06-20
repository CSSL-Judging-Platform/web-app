import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Logo({ size = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-lg">
        <span className="font-bold text-sm">CS</span>
      </div>
      <div className="flex flex-col">
        <span className={cn("font-bold text-primary", sizeClasses[size])}>CSSL Portal</span>
        <span className="text-xs text-muted-foreground -mt-1">Computer Society of Sri Lanka</span>
      </div>
    </div>
  )
}
