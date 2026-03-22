import Logo from "@/components/Logo";
import { DropdownMenuAvatar } from "./avatar-dropdown-menu";
import { ModeToggle } from "./mode-toggle";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:border-white/10">
      <div className="mx-auto flex h-full max-w-(--breakpoint-xl) items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo className="text-2xl" />
        <div className="flex items-center gap-3">
          <div className="hidden sm:block [&>button]:size-10 [&>button]:text-lg">
            <ModeToggle />
          </div>
          <div className="[&>button]:size-10 [&_span.relative]:size-9 [&_[data-radix-popper-content-wrapper]]:min-w-48 [&_[role=menuitem]]:text-sm [&_[role=menuitem]]:py-2.5 [&_[role=menuitem]]:px-3">
            <DropdownMenuAvatar />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;