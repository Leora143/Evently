import React from "react";
import '../evently.css'
import herobg from "../assets/herobg.png";
import Navbar from "./Navbar";


function Hero() {
    return (
        <section  className=" min-h-screen bg-imperial bg-cover bg-center">
          <Navbar/>
            <div className= "flex flex-row justify-between min-h-screen bg-imperial">
            {/* right container */}
            <div className="w-[50%] mt-10 ml-15">
            {/* //heading div */}
             <div className="text-moon text-7xl font-light font-serif leading-tight  ml-20">
              <h1 >Create. Manage. 
                <br/>
                <span className="text-orchid">Celebrate </span> Events
                <br/>
                That Matter.
              </h1>
             </div>
             {/* //2nd paragraph div */}
             <div className="text-moon text-2xl font-extralight font-serif ml-20 mt-5">
                <p>
                    Evently is the all in all platform to discover, <br/>create and manage amazing events <br/>effortlessly.
                </p>

             </div>
             {/* button div */}
             <div> 
                <button
                className="bg-amethyst border border-orchid text-orchid font-extralight font-serif text-lg py-3 px-6 rounded-xl ml-20 mt-10 shadow-md hover:bg-orchid hover:text-amethyst hover:shadow-amethyst transition duration-300 ease-in-out"
                > 
                Explore Events </button>
                <button
                className="border border-orchid text-orchid font-light font-serif text-lg py-3 px-6 rounded-xl ml-10 mt-10 shadow-md  hover:text-moon hover:shadow-amethyst transition duration-300 ease-in-out"
                >
                How it works</button>
             </div>
            </div>
            {/* left container */}
            <div className=" relative w-[60%] ">  
                <div> 
                    <img src={herobg} 
                    alt="hero image" 
                    className="w-full h-screen object-cover"
        style={{
    WebkitMaskImage: `
      radial-gradient(
        ellipse at center,
        black 50%,
        rgba(0,0,0,0.9) 65%,
        rgba(0,0,0,0.4) 80%,
        transparent 100%
      )
    `,
    maskImage: `
      radial-gradient(
        ellipse at center,
        black 50%,
        rgba(0,0,0,0.9) 65%,
        rgba(0,0,0,0.4) 80%,
        transparent 100%
      )
    `,
  }}
                    />
                    {/* <div className=" absolute inset-0 bg-gradient-to-1 from-transparent via-transparent to-imperial">

                    </div> */}

                    
                </div>

            </div>
            </div>
            </section>
    );
}
export default Hero;
