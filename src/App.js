//Imports
import './App.css';
import React, { Component } from 'react'; // Import React
import { BsSearch } from "react-icons/bs"; // Import icon
import CovidChart from './chart'; // Import chart.js
import _ from 'lodash'; // Import library to work with filter


class CovidTable extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      startDate: '', // Start date for date input
      endDate: '', // End date for date input

      allCollectedData: [], // First collected data from json
      rows: [ // Rows for filtering
        'Страна', 
        'Количество случаев', 
        'Количество смертей', 
        'Количество случаев всего', 
        'Количество смертей всего', 
        'Количество случаев на 1000 жителей', 
        'Количество смертей на 1000 жителей'
      ],

      searchQuery: '', // Search value for search input
      
      FirstStartDate: '', // Static first date to return it
      FirstEndDate: '', // Static end date to return it
      
      currentPage: 1,     // Current page number for pagination
      itemsPerPage: 4,    // Number of items to display per page

      sortDirection: 'asc', // Sorting direction ('asc' or 'desc')
      sortBy: 'country',   // Default column to sort by (initially 'country')
      
      selectedCountry: 'all', // Selected country for chart view

      filterColumn: 'Фильтровать по полю...', // Column to filter data by
      filterValueFrom: '', // Filter value for lower range
      filterValueTo: '',   // Filter value for upper range
    };
  }

  // Handler for changing the start date
  handleStartDateChange = (event) => {
    // Validate start date not being later than the end date
    if (event.target.value > this.state.endDate) {
      alert("Начальная дата не может быть позже конечной");
    } else {
      this.setState({ startDate: event.target.value });
    }
  };

  // Handler for changing the end date
  handleEndDateChange = (event) => {
    // Validate end date not being earlier than the start date
    if (event.target.value < this.state.startDate) {
      alert("Конечная дата не может быть раньше начальной");
    } else {
      this.setState({ endDate: event.target.value });
    }
  };

  // Handler for changing the search query
  handleSearchChange = (event) => {
    this.setState({ searchQuery: event.target.value });
  };

  // Reset start and end dates to their initial values
  handleResetDates = () => {
    this.setState({
      startDate: this.state.FirstStartDate,
      endDate: this.state.FirstEndDate,
    });
  }

  // Reset all filters and search
  handleResetFilters = () => {
    this.setState({
      searchQuery: '',
      filterColumn: 'Фильтровать по полю...', 
      filterValueFrom: '',
      filterValueTo: '',
    });
  
    // Clear input values and selection
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.value = '';
    }
    const filterDropdown = document.querySelector('.filter')
    if (filterDropdown) {
      filterDropdown.value = 'hidden';
    }
    const filterValues = document.querySelectorAll('.filter-values');
    if (filterValues) {
      filterValues.forEach((filterValue) => {
        filterValue.value = '';
      })
    }
  }
 
  // Handler for changing the current page
  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

  // Switch to chart view
  handleChangeTable = () => {
    document.querySelector('.chart-container').style.opacity = 1;
    document.querySelector('.chart-container').style.display = 'block';
    document.querySelector('.main-table').style.opacity = 0;
    document.querySelector('.main-table').style.display = 'none';
  }

  // Switch to table view
  handleChangeChart = () => {
    document.querySelector('.main-table').style.opacity = 1;
    document.querySelector('.main-table').style.display = 'block';
    document.querySelector('.chart-container').style.opacity = 0;
    document.querySelector('.chart-container').style.display = 'none';
  }

  // Handler for input change in filter values
  handleFilterInputChange = (event) => {
    const input = event.target;
    const value = input.value;
    const stateKey = input.getAttribute('data-filter-key');
    
    // Regular expression for allowing only numbers
    const regex = /[^0-9]/;
  
    if (regex.test(value)) {
      input.classList.add('invalid');
    } else {
      input.classList.remove('invalid');
      this.setState({ [stateKey]: value });
    }
  };
  
  // Handler for changing the filter column
  handleFilterColumnChange = (event) => {
    let trVal = '';
    switch (event.target.value) {
      case 'Количество случаев':
        trVal = 'cases'
        break;
      case 'Количество смертей':
        trVal = 'deaths'
        break;
      case 'Количество случаев всего':
        trVal = 'allCases'
        break;
      case 'Количество смертей всего':
        trVal = 'allDeaths'
        break;
      default:
        break;
    }
    this.setState({ filterColumn: trVal });
  };

  // Handler for changing the number of items per page
  handleItemsPerPageChange = (newItemsPerPage) => {
    this.setState({ itemsPerPage: newItemsPerPage });
  };

  // Handler for sorting the table by column
  handleSortColumn = (column) => {
    const { sortBy, sortDirection } = this.state;

    if (sortBy === column) {
      this.setState({ sortDirection: sortDirection === 'asc' ? 'desc' : 'asc' });
    } else {
      this.setState({ sortBy: column, sortDirection: 'asc' });
    }
  };

  async componentDidMount() {
    // Add event listeners to filter value inputs
    const filterValueInputs = document.querySelectorAll('.filter-values');
    filterValueInputs.forEach((input) => {
      input.addEventListener('input', this.handleFilterInputChange);
    });

    try {
      // Fetch COVID-19 data from a data source
      const response = await fetch(
        'https://opendata.ecdc.europa.eu/covid19/casedistribution/json/'
      );
      const data = await response.json();

      // Initialize start and end dates for date range filtering
      let startDatee = null;
      let endDatee = null;
      var allCollectedData = [];

      // Process the fetched data
      data.records.forEach((record) => {
        const day = parseInt(record.day, 10);
        const month = parseInt(record.month, 10) - 1; 
        const year = parseInt(record.year, 10);
      
        const date = new Date(year, month, day);
      
        if (date) {
          if (!startDatee || date < startDatee) {
            startDatee = new Date(date);
          }
      
          if (!endDatee || date > endDatee) {
            endDatee = new Date(date);
            endDatee.setDate(endDatee.getDate() + 1);
          }
      
          allCollectedData.push({
            date: date,
            country: record.countriesAndTerritories ? record.countriesAndTerritories : '',
            cases: record.cases ? record.cases : 0,
            deaths: record.deaths ? record.deaths : 0,
          });
        }
      });
      
      // Set date input attributes for filtering
      document.getElementById('startDate').setAttribute('min', startDatee.toISOString().split('T')[0]);
      document.getElementById('startDate').setAttribute('max', endDatee.toISOString().split('T')[0]);
      document.getElementById('endDate').setAttribute('min', startDatee.toISOString().split('T')[0]);
      document.getElementById('endDate').setAttribute('max', endDatee.toISOString().split('T')[0]);

      // Set initial state with fetched data
      this.setState({
        startDate: startDatee ? startDatee.toISOString().split('T')[0] : '',
        endDate: endDatee ? endDatee.toISOString().split('T')[0] : '',
        FirstStartDate: startDatee ? startDatee.toISOString().split('T')[0] : '',
        FirstEndDate: endDatee ? endDatee.toISOString().split('T')[0] : '',
        allCollectedData: allCollectedData,
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  dataToSortedByCol = (value) => {
    // Function to process and filter data based on filter criteria
    const { filterColumn, filterValueFrom, filterValueTo } = this.state;
    const aggregatedData = this.aggregateData();
    const countryTotals = this.calculateCountryTotals();
    const averagesandmax = this.calculateCountryAveragesAndMax();
    const finalData = [];

    // Loop through aggregated data and apply filtering
    Object.keys(aggregatedData).forEach((country) => {
      finalData.push({
        country: aggregatedData[country].country || '', 
        cases: aggregatedData[country].cases || 0,
        deaths: aggregatedData[country].deaths || 0,
        allCases: countryTotals[country].allCases || 0,
        allDeaths: countryTotals[country].allDeaths || 0,
        avgCases: parseFloat((averagesandmax[country]?.avgCases || 0).toFixed(2)),
        avgDeaths: parseFloat((averagesandmax[country]?.avgDeaths || 0).toFixed(2)), 
        maxCases: averagesandmax[country]?.maxCases || 0, 
        maxDeaths: averagesandmax[country]?.maxDeaths || 0,
      });
    });

    // Filter the data based on filter column and value range
    const filteredData = {};
    Object.keys(finalData).forEach((country) => {
      const fieldValue = parseFloat(finalData[country][filterColumn]);
      const isValueInRange =
        (!filterValueFrom || fieldValue >= parseFloat(filterValueFrom)) &&
        (!filterValueTo || fieldValue <= parseFloat(filterValueTo));

      if (isValueInRange) {
        filteredData[country] = finalData[country];
      }
    });

    return _.sortBy(filteredData, value); // Sort the filtered data
  }

  calculateCountryAveragesAndMax = () => {
    // Calculate averages and maximum values for each country
    const countryData = {};
    const filteredData = this.filterData();

    filteredData.forEach((data) => {
      const { country, cases, deaths } = data;

      if (!countryData[country]) {
        countryData[country] = {
          totalCases: 0,
          totalDeaths: 0,
          dayCount: 0,
          maxCases: -1,
          maxDeaths: -1,
        };
      }

      countryData[country].totalCases += cases;
      countryData[country].totalDeaths += deaths;
      countryData[country].dayCount++;

      if (cases > countryData[country].maxCases) {
        countryData[country].maxCases = cases;
      }

      if (deaths > countryData[country].maxDeaths) {
        countryData[country].maxDeaths = deaths;
      }
    });

    // Calculate average cases and deaths per day for each country
    Object.keys(countryData).forEach((country) => {
      const { totalCases, totalDeaths, dayCount } = countryData[country];
      countryData[country].avgCases = totalCases / dayCount;
      countryData[country].avgDeaths = totalDeaths / dayCount;
    });

    return countryData;
  };

  calculateCountryTotals = () => {
    // Calculate total cases and deaths for each country
    const { allCollectedData } = this.state;
    const countryTotals = {};

    allCollectedData.forEach((data) => {
      const { country, cases, deaths } = data;

      if (!countryTotals[country]) {
        countryTotals[country] = {
          allCases: 0,
          allDeaths: 0,
        };
      }

      countryTotals[country].allCases += cases;
      countryTotals[country].allDeaths += deaths;
    });

    return countryTotals;
  };

  calculateTotalCasesAndDeathsChart = () => {
    // Calculate total cases and deaths for charting
    const { selectedCountry } = this.state;
    const filteredData = this.filterData();
    const totalValues = {};

    filteredData
      .filter((data) => selectedCountry === 'all' || data.country === selectedCountry)
      .forEach((data) => {
        const { date, cases, deaths } = data;
        const dateStr = date.toISOString().split('T')[0];

        if (!totalValues[dateStr]) {
          totalValues[dateStr] = {
            date: new Date(date),
            totalCases: 0,
            totalDeaths: 0,
          };
        }

        totalValues[dateStr].date = new Date(date);
        totalValues[dateStr].totalCases += cases;
        totalValues[dateStr].totalDeaths += deaths;
      });

    return totalValues;
  };

  filterData = () => {
    // Filter data based on selected date range
    const { startDate, endDate, allCollectedData } = this.state;

    const filteredData = allCollectedData.filter((data) => {
      const date = new Date(data.date);

      const isDateInRange =
        date >= new Date(startDate) && date <= new Date(endDate);

      return isDateInRange;
    });

    return filteredData;
  };

  aggregateData = () => {
    // Aggregate data for each country
    const filteredData = this.filterData();
    const aggregatedData = {};

    filteredData.forEach((data) => {
      const country = data.country;

      if (!aggregatedData[country]) {
        aggregatedData[country] = {
          cases: 0,
          deaths: 0,
        };
      }

      aggregatedData[country].country = country;
      aggregatedData[country].cases += data.cases;
      aggregatedData[country].deaths += data.deaths;
    });

    return aggregatedData;
  };  

  render() {
    // Render method for the component

    const { currentPage, itemsPerPage, searchQuery, sortBy, allCollectedData } = this.state;
    const finalData = this.dataToSortedByCol(sortBy);

    // Extract unique countries from the collected data
    const uniqueCountries = [...new Set(allCollectedData.map(data => data.country))];

    // Filter and format the data for display
    const filteredData = Object.keys(finalData)
    .filter((country) =>
      finalData[country].country.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .reduce((obj, key) => {
      obj[key] = finalData[key];
      return obj;
    }, {});

    // Convert the filtered data to an array
    const dataArray = Object.keys(filteredData).map((key) => filteredData[key]);

    // Sort the data based on selected sorting criteria
    dataArray.sort((a, b) => {
      const valA = a[this.state.sortBy];
      const valB = b[this.state.sortBy];

      if (this.state.sortBy === 'country') {
        if (this.state.sortDirection === 'asc') {
          return valA.localeCompare(valB);
        } else {
          return valB.localeCompare(valA);
        }
      } else {
        if (this.state.sortDirection === 'asc') {
          return valA - valB;
        } else {
          return valB - valA;
        }
      }
    });

    // Create an object to store sorted data
    const sortedData = {};
    dataArray.forEach((item) => {
      sortedData[item.country] = item;
    });

    // Extract sorted country names
    const sortedCountries = Object.keys(sortedData);

    // Calculate the total number of pages for pagination
    const totalPageCount = Math.ceil(sortedCountries.length / itemsPerPage);

    // Determine the start and end index for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + parseInt(itemsPerPage);

    // Extract countries for the current page
    const currentCountries = sortedCountries.slice(startIndex, endIndex);

    // Generate page numbers for pagination
    const pageNumbers = [];
    if (totalPageCount <= 4) {
      for (let i = 1; i <= totalPageCount; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pageNumbers.push(1, 2, 3, totalPageCount);
      } else if (currentPage >= totalPageCount - 1) {
        pageNumbers.push(1, totalPageCount - 2, totalPageCount - 1, totalPageCount);
      } else {
        pageNumbers.push(1, currentPage - 1, currentPage, currentPage + 1, totalPageCount);
      }
    }

    // Prepare data for charting
    const chartData = {
      labels: [], 
      casesData: [], 
      deathsData: [], 
    };

    const totalValues = this.calculateTotalCasesAndDeathsChart();

    // Convert total values to an array for charting
    const totalDataArray = Object.keys(totalValues).map((date) => ({
      date: totalValues[date].date,
      cases: totalValues[date].totalCases,
      deaths: totalValues[date].totalDeaths,
    }));

    // Extract data for chart labels and values
    totalDataArray.forEach((dataPoint) => {
      chartData.labels.push(dataPoint.date); 
      chartData.casesData.push(dataPoint.cases); 
      chartData.deathsData.push(dataPoint.deaths); 
    });

    // Validate filter value inputs for numeric input
    const filterValueInputs = document.querySelectorAll('.filter-values');
    const regex = /[^0-9]/;

    filterValueInputs.forEach((input) => {
      const value = input.value;

      if (regex.test(value)) {
        input.classList.add('invalid');
      } else {
        input.classList.remove('invalid');
      }
    });

    return (
      <div className="table">
        <div className="date-container">
          <label htmlFor="startDate">Период от </label>
          <input
            type="date"
            id="startDate"
            value={this.state.startDate}
            onChange={this.handleStartDateChange}
          />
          <label htmlFor="endDate"> до </label>
          <input
            type="date"
            id="endDate"
            value={this.state.endDate}
            onChange={this.handleEndDateChange}
          />
          {this.state.endDate !== this.state.FirstEndDate || this.state.startDate !== this.state.FirstStartDate ? (
            <button className='date-delete' onClick={this.handleResetDates}>Отобразить все данные</button>
          ) : null}

        </div>
        <div className='showChoice'>
          <button type='button' className='choice-button' onClick={this.handleChangeChart}>Таблица</button>
          <button type='button' className='choice-button' onClick={this.handleChangeTable}>График</button>
        </div>
        <div className="chart-container">
          <select
            className="chart-countries"
            onChange={(e) => this.setState({ selectedCountry: e.target.value })}
          >
            <option value="all">Все страны</option>
            {uniqueCountries.map((country, index) => (
              <option key={index} value={country}>
                {country}
              </option>
            ))}
          </select>
          <CovidChart data={chartData} />
        </div>
        <div className='main-table'>
          <div className='search'>
            <input
              type='text'
              placeholder='Поиск страны...'
              className='search-input'
              value={searchQuery}
              onChange={this.handleSearchChange}
            />
            <button type='button' className='search-button'>
              <BsSearch /> 
            </button>

            <select 
              className="filter"
              onChange={this.handleFilterColumnChange}
            > 
                <option value="hidden" disabled selected hidden>Фильтровать по полю...</option>
                {this.state.rows.map((header, index) => (
                  index !== 0 ? (
                    <option key={index} value={header}>{header}</option>
                  ) : null
                ))}
            </select>
            <input
              type='text'
              placeholder='значение от'
              className='filter-values'
              data-filter-key="filterValueFrom"
              onChange={this.handleFilterInputChange}
            />
            <input
              type='text'
              placeholder='значение до'
              className='filter-values'
              data-filter-key="filterValueTo"
              onChange={this.handleFilterInputChange}
            />

            <div className="items-per-page">
              <label>Элементов на странице:</label>
              <select onChange={(e) => this.handleItemsPerPageChange(e.target.value)}>
                {Array.from({ length: 17 }, (_, i) => i + 4).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <button type='button' className='reloadfilters-button' onClick={this.handleResetFilters}>
              Сбросить фильтры
            </button>

            <table className='covidtable'>
              <thead>
                <tr>
                  <th onClick={() => this.handleSortColumn('country')}>
                    Страна
                    {this.state.sortBy === 'country' && (
                      <span>{this.state.sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}</th>
                  <th onClick={() => this.handleSortColumn('cases')}>
                    Количество случаев
                    {this.state.sortBy === 'cases' && (
                      <span>{this.state.sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}</th>
                  <th onClick={() => this.handleSortColumn('deaths')}>
                    Количество смертей
                    {this.state.sortBy === 'deaths' && (
                      <span>{this.state.sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}</th>
                  <th onClick={() => this.handleSortColumn('allCases')}>
                    Количество случаев всего
                    {this.state.sortBy === 'allCases' && (
                      <span>{this.state.sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}</th>
                  <th onClick={() => this.handleSortColumn('allDeaths')}>
                    Количество смертей всего
                    {this.state.sortBy === 'allDeaths' && (
                      <span>{this.state.sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}</th>
                  <th onClick={() => this.handleSortColumn('avgCases')}>
                    Среднее количество случаев в день
                    {this.state.sortBy === 'avgCases' && (
                      <span>{this.state.sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}</th>
                  <th onClick={() => this.handleSortColumn('avgDeaths')}>
                    Среднее количество смертей в день
                    {this.state.sortBy === 'avgDeaths' && (
                      <span>{this.state.sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}</th>
                  <th onClick={() => this.handleSortColumn('maxCases')}>
                    Максимальное количество случаев в день
                    {this.state.sortBy === 'maxCases' && (
                      <span>{this.state.sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}</th>
                  <th onClick={() => this.handleSortColumn('maxDeaths')}>
                    Максимальное количество смертей в день
                    {this.state.sortBy === 'maxDeaths' && (
                      <span>{this.state.sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}</th>
                  <th>Количество случаев на 1000 жителей</th>
                  <th>Количество смертей на 1000 жителей</th>
                </tr>
              </thead>
              <tbody>
              {currentCountries.length > 0 ? (
                currentCountries
                  .filter((country) => sortedData[country])
                  .map((country, index) => (
                    <tr key={index}>
                      <td>{sortedData[country].country}</td>
                      <td>{sortedData[country].cases}</td>
                      <td>{sortedData[country].deaths}</td>
                      <td>{sortedData[country].allCases}</td>
                      <td>{sortedData[country].allDeaths}</td>
                      <td>{sortedData[country].avgCases.toFixed(2)}</td>
                      <td>{sortedData[country].avgDeaths.toFixed(2)}</td>
                      <td>{sortedData[country].maxCases}</td>
                      <td>{sortedData[country].maxDeaths}</td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={11} rowSpan="4" className='nodata'>Ничего не найдено</td>
                </tr>
              )}
              </tbody>
            </table>
          </div>

          <div className='pageButtons'>
            {pageNumbers.map((pageNumber, index) => (
              <button
                key={index}
                className={currentPage === pageNumber ? 'active' : 'numbers'}
                onClick={() => this.handlePageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

function App() {
  return (
    <div className="App">
      <CovidTable />
    </div>
  );
}

export default App;
