"use client";

import { useState } from "react";
import { auth } from "@/app/lib/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from 'next/image';


export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/home"); // Redirect after registration
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient text-white">
        <Image 
            src="/images/appIcon.png" 
            alt="Logo" 
            width={50} 
            height={50} 
        />
      <h2>Register</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 m-2" />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 m-2" />
      <button onClick={handleRegister} className="bg-green-500 text-white px-4 py-2 rounded">Register</button>
      <p className="mt-2">
        Already have an account? <a href="/login" className="text-blue-300">Login here</a>
      </p>
    </div>
  );
}
