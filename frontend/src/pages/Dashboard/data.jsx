import { FaCrown, FaFileInvoiceDollar } from "react-icons/fa";
import { BsFillBriefcaseFill, BsFillBellFill } from "react-icons/bs";
import { MdEmojiPeople } from "react-icons/md";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { IoMdDocument, IoIosPeople } from "react-icons/io";
import axios from "axios";

export const data = [
  {
    id: 1,
    caseNo: null,
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
    caseNo: null,
    icon: <MdEmojiPeople />,
    plusIcon: <AiOutlinePlusCircle />,
    title: "Clients",
    info: "View Clients ",
    pathAdd: "/dashboard/clientform",
    pathView: "/dashboard/clientformdata",
    details: "Click to add a Client",
  },
  {
    id: 3,
    caseNo: null,
    icon: <IoMdDocument />,
    plusIcon: <AiOutlinePlusCircle />,
    title: "Documents",
    info: "View Documents ",
    pathAdd: "/documentform",
    pathView: "/documentformdata",
    details: "Click to generate a Document or to see Ready Document Templates",
  },
  {
    id: 4,
    caseNo: null,
    icon: <IoIosPeople />,
    plusIcon: <AiOutlinePlusCircle />,
    title: "Team Members",
    info: "View Team Members ",
    pathAdd: "/dashboard/teammemberform",
    pathView: "/dashboard/teammemberdata",
    details: "Click to add a Member in your Team",
  },
  {
    id: 5,
    caseNo: null,
    icon: <BsFillBellFill />,
    plusIcon: <AiOutlinePlusCircle />,
    title: "Tasks to do",
    info: "View Alerts ",
    pathAdd: "/dashboard/alertsform",
    pathView: "/dashboard/alertsformdata",
    details: "Click to add a Task",
  },
  {
    id: 6,
    caseNo: null,
    icon: <FaFileInvoiceDollar />,
    plusIcon: <AiOutlinePlusCircle />,
    title: "Finances",
    info: "View Finances ",
    pathAdd: "/dashboard/finances",
    pathView: "/dashboard/financesview",
    details: "Click to add a Bill or an Invoice",
  },
];

export async function fetchAndUpdateCounts() {
  try {
    const caseCount = await fetchCaseCount();
    const clientCount = await fetchClientCount();
    const teamMemberCount = await fetchTeamMemberCount();
    const financeCount = await fetchFinanceCount(); // Fetch finance count
    const taskCount = await fetchTaskCount(); // Fetch task count

    data.forEach((item) => {
      if (item.title === "case") {
        item.caseNo = caseCount;
      } else if (item.title === "Clients") {
        item.caseNo = clientCount;
      } else if (item.title === "Team Members") {
        item.caseNo = teamMemberCount;
      } else if (item.title === "Finances") {
        item.caseNo = financeCount; // Update finance count
      } else if (item.title === "Tasks to do") {
        item.caseNo = taskCount; // Update task count
      }
      // Add similar logic for other items if needed
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
  }
}

async function fetchFinanceCount() {
  try {
    const response = await axios.get("http://localhost:8052/invoicebillcount", {
      headers: {
        "x-auth-token": localStorage.getItem("token"),
      },
    });
    return response.data.totalCount;
  } catch (error) {
    console.error("Error fetching finance count:", error);
    return null;
  }
}

async function fetchTaskCount() {
  try {
    const response = await axios.get("http://localhost:8052/alertcount", {
      headers: {
        "x-auth-token": localStorage.getItem("token"),
      },
    });
    return response.data.count;
  } catch (error) {
    console.error("Error fetching task count:", error);
    return null;
  }
}
async function fetchCaseCount() {
  try {
    const response = await axios.get("http://localhost:8052/casecount", {
      headers: {
        "x-auth-token": localStorage.getItem("token"),
      },
    });
    return response.data.count;
  } catch (error) {
    console.error("Error fetching case count:", error);
    return null;
  }
}

async function fetchClientCount() {
  try {
    const response = await axios.get("http://localhost:8052/clientcount", {
      headers: {
        "x-auth-token": localStorage.getItem("token"),
      },
    });
    return response.data.count;
  } catch (error) {
    console.error("Error fetching client count:", error);
    return null;
  }
}

async function fetchTeamMemberCount() {
  try {
    const response = await axios.get("http://localhost:8052/teammembercount", {
      headers: {
        "x-auth-token": localStorage.getItem("token"),
      },
    });
    return response.data.count;
  } catch (error) {
    console.error("Error fetching team member count:", error);
    return null;
  }
}

// Call the fetchAndUpdateCounts function to update the counts when needed
fetchAndUpdateCounts();
