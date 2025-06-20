import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const THEMES = { light: "", dark: ".dark" } as const;

export function LoginLogo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3 text-center",
      "max-w-xs mx-auto",
      className
    )}>
      {/* Logo Container with dark mode white background */}
      <div className={cn(
        "relative w-24 h-24",
        "rounded-xl bg-gradient-to-br from-primary/10 to-primary/5",
        "dark:bg-white dark:p-1", // White background in dark mode with slight padding
        "p-2 shadow-sm",
        "flex items-center justify-center",
        "transition-all hover:scale-105 hover:shadow-md"
      )}>
        <Image
          src="https://res.cloudinary.com/dgraeprjb/image/upload/v1750435938/New-CSSL-Logo-1024x398_qoqajz.png"
          alt="CSSL Logo"
          width={150}
          height={50}
          priority
          className="object-contain w-full h-full"
        />
      </div>

      <div className="space-y-1">
        <h1 className={cn(
          "font-bold text-primary text-balance",
          "text-2xl sm:text-3xl",
          "bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80",
          sizeClasses[size]
        )}>
          CSSL Portal
        </h1>
        <p className={cn(
          "text-muted-foreground text-sm sm:text-base",
          "max-w-prose mx-auto"
        )}>
          Computer Society of Sri Lanka
        </p>
      </div>
    </div>
  );
}