"use client";

import React, { useState } from "react";
import Image from "next/image";
import clsx from "clsx";

// Example images — replace with your own imports
import santhosh from "@/images/santhosh.png";
import teja from "@/images/teja.png";

export function TeamStackedCards() {
  const teamMembers = [
    {
      name: "Santhosh Kumar. E",
      role: "Founder",
      imageUrl: santhosh,
      summary: "I love coding",
      longDescription:
        "Santhosh brings over two decades of leadership in software development and security to CorpAI. As a former team member at industry giants such as Google, Amazon, and McAfee, he has a proven track record in building large-scale distributed platforms and developing cutting-edge security solutions. His extensive experience and innovative approach are instrumental in shaping CorpAI’s vision and driving product excellence.",
    },
    {
      name: "Sri Teja Kumar. S ",
      role: "Founding member - Technical",
      imageUrl: teja,
      summary: "Passionate about agile workflows.",
      longDescription:
        "Sri Teja Kumar brings extensive experience in software engineering, specializing in frontend technologies and cloud-based solutions. With expertise in Angular, React, Next.js, and AWS, Sri Teja Kumar has successfully delivered robust enterprise applications, leveraging advanced tools and frameworks. Passionate about user experience and product innovation.",
    }
  ];

  // Track which card is selected
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <section style={{ paddingTop: '8%' }} className="py-6 bg-slate-50" id="our-team">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl tracking-tight text-gray-900 sm:text-4xl mb-6 px-3">Team</h2>

        {/* Main layout: left side for details, right side for stacked cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT SIDE: Show details of the selected team member */}
          <div className="p-4">
            <h3 className="text-2xl mb-2 font-display tracking-tight ">
              {teamMembers[selectedIndex].name}
            </h3>
            <p className="text-gray-600 font-display tracking-tight ">{teamMembers[selectedIndex].role}</p>
            <p className="mt-4 text-gray-700  tracking-tight">
              {teamMembers[selectedIndex].longDescription}
            </p>
          </div>

          {/* RIGHT SIDE: Stacked cards */}
          <div className="relative w-full h-96 left-[30%] top-[-20%]">
            {teamMembers.map((member, index) => (
              <div
                key={member.name}
                className={clsx(
                  // Basic card styles
                  "absolute w-70 h-90 bg-white border border-gray-300 rounded-lg shadow-md",
                  "transition-transform hover:-translate-y-4 hover:scale-105 cursor-pointer",
                  // If selected, bring to front
                  selectedIndex === index && "z-50"
                )}
                style={{
                  // Stagger each card’s position (tweak these offsets as desired)
                  left: `${index * 4}rem`,
                  top: `${index * 2}rem`,
                  // Use a higher z-index if this card is selected
                  zIndex: selectedIndex === index ? 999 : index,
                }}
                onClick={() => setSelectedIndex(index)}
              >
                {/* Card image (top half) */}
                <div className="relative w-full h-[80%]">
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-t-lg"
                    unoptimized
                  />
                </div>

                {/* Card text (bottom half) */}
                <div className="p-2">
                  <h4 className="text-gray-800 font-display tracking-tight ">{member.name}</h4>
                  <p className="text-sm text-gray-500 tracking-tight">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
