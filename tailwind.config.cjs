/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        Montserrat: "Montserrat",
      },
      colors: {
        loginBackground : "#f8fafd",
        yaskawaBlue: "#0857ba",
        yaskawaBlueHoverFirst: "#0e4f9a",
        yaskawaBlueHoverSecond: "#0e315d",
        pageBackground: "#17202e",
        pageSideMenu: "#2b394a",
        pageSideMenuTextHover: "#222f3e",
        calendarNotifiBackground: "#1c2533",
        lightBlueLetter: "#7898b8",
        lightGrayLetter: "#d0dbe7",
        lightWhiteLetter: "#eef2f6",
        contentCards: "#212c3a",
        progressBarsBackground: "#d0dbe725",
        notifiGrayLetter: "#e7edf3",
        shadowBlueColor: "#0f151f",
      },
    },
  },
  variants: {},
  plugins: [require("tailwind-scrollbar")],
};
