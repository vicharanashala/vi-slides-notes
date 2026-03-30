import { cn } from "@/lib/utils";
 
interface LogoProps {
  className?: string;
}
 
const Logo = ({ className }: LogoProps) => (
  <span
    className={cn(
      "text-gradient font-semibold tracking-tight select-none",
      className
    )}
    style={{ fontFamily: "Inter, Poppins, sans-serif" }}
  >
    Vi-slideS
  </span>
);
 
export default Logo;