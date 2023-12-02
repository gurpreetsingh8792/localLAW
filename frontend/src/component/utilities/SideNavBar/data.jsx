import { RxDashboard } from "react-icons/rx";
import { AiOutlineSearch } from "react-icons/ai";


export const sideNavLinks = [
    {
        name: "Dashboard",
        path: "/dashboard",
        icon: <RxDashboard/>    
    },
    {
        name: "Specific Search",
        path: "/explore",
        icon: <AiOutlineSearch/>   
    },
    
]

export const formLinks = [
    {
        name: "proxy",
        path: "/proxy",
        icon: <AiOutlineSearch/>   
    },
    
    // {
    //     name: "Appointment",
    //     path: "/AppointmentForm",
    //     icon: <AiOutlineSearch/>   
    // },

    // {
    //     name: "Bill",
    //     path: "/BillForm",
    //     icon: <AiOutlineSearch/>   
    // },

    // {
    //     name: "Crn",
    //     path: "/crnform",
    //     icon: <AiOutlineSearch/>   
    // },
    {
        name: "Group",
        path: "/groupform",
        icon: <AiOutlineSearch/>   
    },
    {
        name: "Party Name",
        path: "/partynameform",
        icon: <AiOutlineSearch/>   
    },
    {
        name: "DocDraft Express",
        path: "/documentgenrationform",
        icon: <AiOutlineSearch/>   
    },
];