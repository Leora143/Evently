import React from "react";
import '../evently.css'
import {
  CalendarDays,
  Users,
  Ticket,
  Star,
} from "lucide-react";

function Stats() {
    return (
        <section className="bg-transparent w-3xl h-2.5 rounded-lg ">
            <div className="flex flex-row  bg-lavender rounded-lg py-5 px-0.5 gap-20 justify-center items-center font-serif font-extralight shadow-md">
                <div className="flex flex-row gap-2.5 items-center">
                    <CalendarDays />
                
                <div>
                    2,500+
                    <p>Events</p>
                </div>
                </div>
                <div className="flex flex-row gap-2.5 items-center">
                    <Users />
                
                <div>
                    850K
                    <p>Happy user</p>
                </div>
                </div>
                <div className="flex flex-row gap-2.5 items-center">
                    <Ticket />
                
                <div>
                    120K
                    <p>Tickets sold</p>
                    </div>
                </div>
                
                <div className="flex flex-row gap-2.5 items-center">
                    <Star />
                
                <div>
                    4.9
                    <p>Rating</p>
                </div>
                </div>
            </div>

        </section>

    );
}



export default Stats;