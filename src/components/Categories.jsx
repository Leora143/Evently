import React from "react";
import '../evently.css';
import {
  Music,
  BriefcaseBusiness,
  Trophy,
  Palette,
  UtensilsCrossed,
  Cpu,
  ArrowRight,
} from "lucide-react";

function Categories() {
    return (
        <footer className="bg-lavender text-moon py-8 ">
            <div className=" pt-15">
                {/* top portion */}
                <div className="flex flex-row justify-between items-center px-8 text-md text-moon font-extralight font-serif mb-3">
                    <h3 className = " text-xl font-extralight font-serif text-moon"> Explore Top <span className =" text-amethyst">Categories</span> </h3>
                    <div className="flex items-center gap-2 cursor-pointer hover:text-orchid transition">
                        <p>view all Categories</p>
                        <ArrowRight size={16} />
                    </div>
                </div>
                {/* bottom category card */}
                <div className="flex flex-row justify-between items-center bg-moon px-27 py-5 gap-3 mx-14 rounded-md">
                     <div className="flex flex-col bg-moon gap-2.5 items-center border-3 border-orchid text-xl font-extralight text-orchid font-serif p-8 h-38 w-38 rounded-lg shadow-md shadow-orchid">
                    <Music className = " bg-orchid w-15 h-15 boarder rounded-lg p-3 text-moon"/>
                <div>
                    Music
                </div>
                </div>
                  <div className="flex flex-col bg-moon gap-2.5 items-center border-3 border-orchid text-xl font-extralight text-orchid font-serif p-8 h-38 w-38 rounded-lg shadow-md shadow-orchid">
                    <BriefcaseBusiness className = " bg-orchid w-15 h-15 boarder rounded-lg p-3 text-moon"/>
                <div>
                    Business
                </div>
                </div>
                  <div className="flex flex-col bg-moon gap-2.5 items-center border-3 border-orchid text-xl font-extralight text-orchid font-serif p-8 h-38 w-38 rounded-lg shadow-md shadow-orchid">
                    <Trophy className = " bg-orchid w-15 h-15 boarder rounded-lg p-3 text-moon"/>
                <div>
                    Sports
                </div>
                </div>
                <div className="flex flex-col bg-moon gap-2.5 items-center border-3 border-orchid text-xl font-extralight text-orchid font-serif p-8 h-38 w-38 rounded-lg shadow-md shadow-orchid">
                    <Palette className = " bg-orchid w-15 h-15 boarder rounded-lg p-3 text-moon"/>
                <div>
                    Arts
                </div>
                </div>
                 <div className="flex flex-col bg-moon gap-2.5 items-center border-3 border-orchid text-xl font-extralight text-orchid font-serif p-8 h-38 w-38 rounded-lg shadow-md shadow-orchid">
                    <UtensilsCrossed className = " bg-orchid w-15 h-15 boarder rounded-lg p-3 text-moon"/>
                <div>
                    Food
                </div>
                </div>
                 <div className="flex flex-col bg-moon gap-2.5 items-center border-3 border-orchid text-xl font-extralight text-orchid font-serif p-8 h-38 w-38 rounded-lg shadow-md shadow-orchid">
                    <Cpu className = " bg-orchid w-15 h-15 boarder rounded-lg p-3 text-moon"/>
                <div>
                    Technology
                </div>
                </div>
                
                
                </div>
            </div>
            </footer>
    );
}

export default Categories;