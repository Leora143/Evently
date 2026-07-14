import React from "react";
import '../evently.css';
import {
  CalendarCheck,
  WalletCards,
  BellDot,
  Headset,
} from "lucide-react";

function WhyChoose() {
    return (
        <section className="bg-lavender text-moon py-2 ">
            <h1 className=" text-2xl font-extralight font-serif mb-2 ml-15"> Why <span className="text-2xl font-extralight font-serif text-amethyst">Choose</span> Us</h1>
            <div className="flex flex-row justify-between items-center border border-amethyst py-4 px-12  gap-3 mx-8 rounded-md bg-moon">
                  <div className="flex flex-row bg-moon gap-2.5 items-center border text- fmdont-extralight text-orchid font-serif p-8  h-32 rounded-lg shadow-md shadow-amethyst">
                    <CalendarCheck className = " bg-orchid w-15 h-15 boarder rounded-lg p-3 text-moon"/>
                <div>
                    <h2 className="text-xl">Easy Booking </h2>
                    Book your tickets in just a  <br></br> few clicks
                </div>
                </div>
                 <div className="flex flex-row bg-moon gap-2.5 items-center border text- fmdont-extralight text-orchid font-serif p-8  rounded-lg shadow-md shadow-amethyst">
                    <WalletCards className = " bg-orchid w-15 h-15 boarder rounded-lg p-3 text-moon"/>
                <div>
                    <h2 className="text-xl">Secure Payments </h2>
                    your payments are safe 
                </div>
                </div>
                 <div className="flex flex-row bg-moon gap-2.5 items-center border  text- fmdont-extralight text-orchid font-serif p-8  rounded-lg shadow-md shadow-amethyst">
                    <BellDot className = " bg-orchid w-15 h-15 boarder rounded-lg p-3 text-moon"/>
                <div>
                    <h2 className="text-xl">Real-time Updates </h2>
                    Get Instant Updates
                </div>
                </div>
                 <div className="flex flex-row bg-moon gap-2.5 items-center border  text- fmdont-extralight text-orchid font-serif p-8  rounded-lg shadow-md shadow-amethyst">
                    <Headset className = " bg-orchid w-15 h-15 boarder rounded-lg p-3 text-moon"/>
                <div>
                    <h2 className="text-xl">24/7 Support </h2>
                    Here to help anytime 
                </div>
                </div>
                </div>

            </section>
    );
}

export default WhyChoose;
