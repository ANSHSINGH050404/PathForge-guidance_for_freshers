'use client'

import Navbar from "@/components/navbar";
import Hero from "./screen/Hero";
import CarrerGuid from "./screen/Carrer_Guide";

export default function Home() {
  return (
   <div>
     <Navbar/>
     <Hero/>
     <CarrerGuid/>
   </div>
  );
}     
