"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"
import { Building, LogOut, Menu, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { hasRole } from "@/lib/auth"

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
      // The auth context already handles the fallback
    }
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <span className="font-bold">Hotel Management</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/hotels" className="text-sm font-medium transition-colors hover:text-primary">
              Hotels
            </Link>
            {isAuthenticated && hasRole("ADMIN") && (
              <Link href="/users" className="text-sm font-medium transition-colors hover:text-primary">
                Users
              </Link>
            )}
            {isAuthenticated && (
              <>
                <Link href="/reservations" className="text-sm font-medium transition-colors hover:text-primary">
                  Reservations
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="hidden md:inline text-sm text-muted-foreground">
                {user?.role && user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm">
                <User className="h-4 w-4 mr-2" />
                <span>Login</span>
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/hotels">Hotels</Link>
              </DropdownMenuItem>
              {isAuthenticated && hasRole("ADMIN") && (
                <DropdownMenuItem asChild>
                  <Link href="/users">Users</Link>
                </DropdownMenuItem>
              )}
              {isAuthenticated && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/reservations">Reservations</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              {isAuthenticated ? (
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/login">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
