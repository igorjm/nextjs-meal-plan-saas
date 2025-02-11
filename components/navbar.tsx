import Image from "next/image";
import Link from "next/link";
import React from "react";

function Navbar() {
  return (
    <nav>
      {""}
      <div>
        <Link href="/">
          <Image src="/logo.png" width={60} height={60} alt="Logo" />
        </Link>
      </div>
      <div></div>
    </nav>
  );
}

export default Navbar;
