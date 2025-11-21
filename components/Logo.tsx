import Image from "next/image";
export default function Logo() {
  return (
    <div>
      <Image src="/whoami-logo.jpg" alt="Logo" width={75} height={75} />
    </div>
  );
}