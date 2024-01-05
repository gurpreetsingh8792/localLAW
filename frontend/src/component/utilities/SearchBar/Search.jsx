import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import style from "./search.module.css";
import Card from "../card/Card";

ChartJS.register(ArcElement, Tooltip, Legend);

const Search = () => {
  const [stateSearchTerm, setSearchTerm] = useState("");
  const [stateCategory, setCategory] = useState("");
  const [results, setResults] = useState([]);
  const [originalResults, setOriginalResults] = useState([]);
  const [chartData, setChartData] = useState({});
  const [displayName, setDisplayName] = useState("");
  const [searchMade, setSearchMade] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef(null);

  const categoryOptions = ["Advocate", "Judge", "case_no"];

  const handleSearch = async (event, searchTerm = stateSearchTerm, category = stateCategory) => {
    if (event) event.preventDefault();

    const queryParams = new URLSearchParams({ searchTerm, category });

    setSearchMade(true);
    try {
      const response = await fetch(`http://34.105.95.235:8052/search?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setResults(data);
        setOriginalResults(data);

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
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
              ],
              borderWidth: 1,
            },
          ],
        });
      } else {
        console.error("Received data is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const handlePieChartClick = (event, elements) => {
    if (elements[0]) {
      const selectedIndex = elements[0].index;
      const selectedLabel = chartData.labels[selectedIndex];
      const filteredData = originalResults.filter((item) => item.classifier === selectedLabel);
      setResults(filteredData);
    } else {
      setResults(originalResults);
    }
  };

  const fetchSuggestions = async (searchTerm, category) => {
    try {
      const response = await fetch(`http://34.105.95.235:8052/suggestions?searchTerm=${searchTerm}&category=${category}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions: ", error);
    }
  };

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (stateSearchTerm && stateCategory) {
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(stateSearchTerm, stateCategory);
        setShowSuggestions(true);
      },600); // 300 ms debounce time
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [stateSearchTerm, stateCategory]);

  const handleSuggestionClick = async (suggestion) => {
    setDisplayName(suggestion);
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    handleSearch(null, suggestion, stateCategory);
  };

  return (
    
    <div className={`${style.container} ${style.SearchContainer}`}>
    <h1 className={style.tagLine}><sapn className={style.law}></sapn>Enter Advocate's Name | Judge's Name | or Case Number | and retrieve the case details.</h1>
      <form onSubmit={handleSearch} className={style.searchContainer}>
        <div className={style.autocomplete}>
          <input
            className={style.SearchName}
            type="text"
            placeholder="Quickly search cases by name or number"
            value={stateSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {showSuggestions && (
            <div className={style.suggestionContainer}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={style.suggestion}
                  onClick={() => handleSuggestionClick(suggestion.name)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <select
          className={style.SearchName}
          value={stateCategory}
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
        <button className={style.btn} type="submit">Search</button>
      </form>

      {searchMade && (
        <div className={style.resultContainer}>
          {results.length === 0 ? (
            <div className={style.noResults}>
  <span className={style.noResultsIcon}>🔍</span><p>No Results Found </p>
</div>
          ) : (
            <>
              <h2 className={style.resultTitle}>{displayName}</h2>
              <div className={style.tableContainer}>
                <div className={style.tableHeader}>
                  <div className={style.tableColumn}>Case Number</div>
                  <div className={style.tableColumn}>Classifier</div>
                </div>
                <div className={style.table}>
                  {results.map((item, index) => (
                    <div className={style.tableRow} key={index}>
                      <Card className={style.card}>
                        <NavLink to={`/case/${item.case_no}`} className={style.tableDataLink}>
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
                      className={style.pieChart}
                      data={chartData}
                      options={{
                        onClick: handlePieChartClick,
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
};

export default Search;
