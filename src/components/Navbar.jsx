import React from "react";
import '../evently.css'
import logo from "../assets/logo.png";

const navlink= [
    "Home",
    "Events",
    "Categorys",
    "About",
    "Contact"   
];

function Navbar() {
    return ( 
        <section>
            {/* main div */}
            <div className="bg-transparent">
                 <nav className =" flex flex-row justify-between bg-transparent text-lavender text-lg font-serif font-light py-5 px-5 shadow-md">
                    {/* logo div */}
                <div className="flex flex-row items-center"> 
                    <img src={logo}
                    alt="logo"
                    className="w-20 h-10 object-cover"/>

                    Evently
                </div>
                {/* middle section */}
                <div className="flex item-center gap-8">
                    {navlink.map((link) => (
                        <p key={link}
                        className = " cursor-pointer  hover:text-orchid  transition"
                        >
                            {link}
                        </p>
                   ) )}

                   
                </div>
                {/* end section */}
                <div className = " cursor-pointer  hover:text-orchid  transition">
                    Login
                    <button className="bg-amethyst border border-orchid text-orchid font-extralight font-serif text-sm py-2 px-2 rounded-xl ml-4 shadow-md  hover:text-moon hover:shadow-amethys transition duration-300 ease-in-out">
                        Get Started
                    </button>

                </div>
            </nav>

            </div>
           
        </section>

    );
}
export default Navbar;