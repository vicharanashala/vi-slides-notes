import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOutIcon } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { ModeToggle } from "./mode-toggle"
import { useNavigate } from "react-router-dom"
import { PencilIcon } from "lucide-react";

export function DropdownMenuAvatar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const initials =
    user?.fullname
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "NA"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar>
            <AvatarFallback className="bg-gradient-to-br from-gray-300 to-gray-500 text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">

        {/* ModeToggle only visible on mobile inside dropdown */}
        <div className="flex items-center justify-between px-2 py-1 sm:hidden">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ModeToggle />
        </div>
        <DropdownMenuSeparator className="sm:hidden" />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(e) => {
            e.preventDefault()
            navigate("/edit-profile")
          }}
        >
          <PencilIcon className="h-4 w-4" />
          Edit Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
          onSelect={(e) => {
            e.preventDefault()
            logout()
          }}
        >
          <LogOutIcon />
          Sign Out
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}