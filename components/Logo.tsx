import Image from "next/image";
export default function Logo() {
  return (
    <div>
      <Image src="/whoami-logo.jpg" alt="Logo" width={100} height={100} />
    </div>
  );
}