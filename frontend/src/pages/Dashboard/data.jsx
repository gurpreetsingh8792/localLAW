import { FaCrown, FaFileInvoiceDollar } from "react-icons/fa";
import { BsFillBriefcaseFill, BsFillBellFill } from "react-icons/bs";
import { MdEmojiPeople } from "react-icons/md";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { IoMdDocument, IoIosPeople } from "react-icons/io";

export const data = [
  
  {
    id: 1,
    caseNo:"16",
    icon: <BsFillBriefcaseFill />,
    plusIcon: <AiOutlinePlusCircle />,
    title: "case",
    info: "View Cases ",
    pathAdd: "/dashboard/Importcase",
    pathView: "/dashboard/caseformdata",
    details: "Click to add a Case manually or import a Case",
  },

  {
    id: 2,
    caseNo:"22",
    icon: <MdEmojiPeople />,
    plusIcon: <AiOutlinePlusCircle />,
    title: "Clients",
    info: "View Clients ",
    pathAdd:"/dashboard/clientform",
    pathView:"/dashboard/clientformdata",
    details: "Click to add a Client",
  },
  {
    id: 3,
    caseNo:"12",
    icon: <IoMdDocument />,
    plusIcon: <AiOutlinePlusCircle />,
    title: "Documents",
    info: "View Documents ",
    pathAdd:"/documentform",
    pathView:"/documentformdata",
    details: "Click to generate a Document or to see Ready Document Templates",
  },
  {
    id: 4,
    caseNo:"11",
    icon: <IoIosPeople />,
    plusIcon: <AiOutlinePlusCircle />,
    title: "Team Members",
    info: "View Team Members ",
    pathAdd:"/dashboard/teammemberform",
    pathView:"/dashboard/teammemberdata",
    details: "Click to add a Member in your Team",
  },
  {
    id: 5,
    caseNo:"5",
    icon: <BsFillBellFill />,
    plusIcon: <AiOutlinePlusCircle />,
    title: "Tasks to do",
    info: "View Alerts ",
    pathAdd:"/dashboard/alertsform",
    pathView:"/dashboard/alertsformdata",
    details: "Click to add a Task",
  },

  {
    id: 6,
    caseNo:"2",
    icon: <FaFileInvoiceDollar />,
    plusIcon: <AiOutlinePlusCircle />,
    title: "Finances",
    info: "View Finances ",
    pathAdd:"/dashboard/finances",
    pathView:"/dashboard/financesview",
    details: "Click to add a Bill or an Invoice",
  },
];
