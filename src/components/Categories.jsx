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
        <footer className="bg-lavender text-moon py-8">
            <div className=" pt-15">
                {/* top portion */}
                <div className="flex flex-row justify-between items-center px-8 text-md text-moon font-extralight font-serif">
                    <h3 className = " text-xl font-extralight font-serif text-moon"> Explore Top <span className =" text-amethyst">Categories</span> </h3>
                    <div className="flex items-center gap-2 cursor-pointer hover:text-orchid transition">
                        <p>view all Categories</p>
                        <ArrowRight size={16} />
                    </div>
                </div>
                {/* bottom category card */}
                <div>
                     <div className="flex flex-col gap-2.5 items-center">
                    <Music/>
                <div>
                    Music
                </div>
                </div>
                </div>
            </div>
            </footer>
    );
}

export default Categories;