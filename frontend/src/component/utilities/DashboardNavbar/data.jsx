import { FaBell } from "react-icons/fa";


export const links = [
  {
    name: "Case",
    submenu:[
      {
          name:'Add Case',
          path:'/dashboard/Importcase'
      },
      {
          name:'Show Case',
          path:'/dashboard/caseformdata'
      }
    ]
  },
  // {
  //   name: "Client",
  //   submenu:[
  //     {
  //         name:'Add Client',
  //         path:'/dashboard/clientform'
  //     },
  //     {
  //         name:'Show Client',
  //         path:'/dashboard/clientformdata'
  //     }
  //   ]
  // },
  {
    name: "People",
    submenu:[
      {
          name:'Add People',
          path:'/dashboard/peopleform'
      },
      {
          name:'Show People',
          path:'/dashboard/clientformdata'
      }
    ]
  },
  {
    name: "Calendar",
    path: "/dashboard/calendarform"
  },
  {
    name: "Document",
    submenu: [ 
      {
        name: "Genrate Doc's",
        path: "/genrationdocs"
      },
      {
        name: "Show Documents",
        path: "/services/graphic-design"
      },
      {
        name: "Review Doc",
        path: "/dashboard/reviewdocform"
      },
      {
        name: "Review Doc",
        path: "/dashboard/convertdocument"
      }
    ]
  },
  {
    name: "Invoices",
    submenu:[
      {
          name:'Add Invoices',
          path:'/dashboard/invoicesform'
      },
      {
          name:'Show Invoces',
          path:'/dashboard/invoicesformdata'
      }
    ]
  },
  {
    name: "Bills",
    submenu:[
      {
          name:'Add Bills',
          path:'/dashboard/billform'
      },
      {
          name:'Show Bills',
          path:'/dashboard/billformdata'
      }
    ]
  },
  {
    name: "Teams",
    submenu:[
      {
          name:'Add Teams',
          path:'/dashboard/teammemberform'
      },
      {
          name:'Show Team',
          path:'/dashboard/teammemberdata'
      }
    ]
  },
  {
    name: "Tasks",
    submenu:[
      {
          name:'Add Tasks',
          path:'/dashboard/alertsform'
      },
      {
          name:'Show Tasks',
          path:'/dashboard/alertsformdata'
      }
    ]
  },

  {
    name: "Proxy",
    submenu:[
      {
          name:'Add Proxy',
          path:'/dashboard/proxy'
      },
      {
          name:'Show Proxy',
          path:'/dashboard/proxydata'
      }
    ]
  },

  {
    bell: <FaBell />,
    path: "/dashboard/notifications"
},
];
