import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import style from "./search.module.css";
import Card from "../card/Card";

ChartJS.register(ArcElement, Tooltip, Legend);

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState([]);
  const [originalResults, setOriginalResults] = useState([]); // Store original data
  const [chartData, setChartData] = useState({});
  const [displayName, setDisplayName] = useState("");
  const [filterClassified, setFilterClassified] = useState(null);
  const [searchClicked, setSearchClicked] = useState(false);

  const categoryOptions = ["Advocate", "Judge", "case_no"];

  const handleSearch = async (event) => {
    event.preventDefault();
    const queryParams = new URLSearchParams({ searchTerm, category });
    
    setDisplayName(searchTerm);
    
    setSearchClicked(true);

    fetch(`http://localhost:4000/search?${queryParams.toString()}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setResults(data);
          setOriginalResults(data); // Store the original data

          const classifierCounts = data.reduce((acc, item) => {
            acc[item.classifier] = (acc[item.classifier] || 0) + 1;
            return acc;
          }, {});

          setChartData({
            labels: Object.keys(classifierCounts),
            datasets: [
              {
                label: "Number of Cases",
                data: Object.values(classifierCounts),
                backgroundColor: [
                  "rgba(255, 99, 132, 0.1)",
                  "rgba(54, 162, 235, 0.4)",
                  "rgba(255, 206, 86, 0.6)",
                  "rgba(255, 206, 86, 0.7)",
                  "rgba(255, 206, 86, 0.8)",
                ],
                borderColor: [
                  "rgba(255, 99, 232, 1)",
                  "rgba(54, 162, 285, 5)",
                  "rgba(255, 206, 86, 4)",
                  "rgba(255, 206, 86, 3)",
                  "rgba(255, 206, 86, 2)",
                ],
                borderWidth: 1,
              },
            ],
          });
        } else {
          console.error("Received data is not an array:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  };

  const handlePieChartClick = (event, elements) => {
    if (elements[0]) {
      const selectedIndex = elements[0].index;
      const selectedLabel = chartData.labels[selectedIndex];
      const filteredData = originalResults.filter((item) => item.classifier === selectedLabel);
      setResults(filteredData);
      setFilterClassified(selectedLabel);
    } else {
      // Reset the results to the original data when clicking outside the pie chart
      setResults(originalResults);
      setFilterClassified(null);
    }
  };

  return (
    <>
      <div className={`${style.container} ${style.SearchContainer}`}>
        <form onSubmit={handleSearch} className={style.searchContainer}>
          <input
            className={style.SearchName}
            type="text"
            placeholder="Search Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={style.SearchName}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button className={style.btn}>Search</button>
        </form>

        <div className={style.resultContainer}>
          <h2 className={style.resultTitle}>{displayName}</h2>

              {searchClicked &&(
          <div className={style.tableHeader}>
            <div className={style.tableColumn}>Case Number</div>
            <div className={style.tableColumn}>Classifier</div>
          </div>
          )}
          <div className={style.tableContainer}>
            <div className={style.table}>
              {results.map((item, index) => (
                <div className={style.tableRow} key={index}>
                  <Card className={style.card}>
                    <NavLink
                      to={`/case/${item.case_no}`}
                      className={style.tableDataLink}
                    >
                      <div className={style.tableData}>{item.case_no}</div>
                    </NavLink>
                    <div className={style.classifier}>{item.classifier}</div>
                  </Card>
                </div>
              ))}
            </div>
            {chartData.labels && chartData.labels.length > 0 && (
              <div className={style.chartContainer}>
                <Pie
                  style={{ width: "80%", height: "80%" }}
                  data={chartData}
                  options={{
                    onClick: handlePieChartClick,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;
