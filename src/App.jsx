import React, { useState, useRef, useEffect } from 'react';
    import Papa from 'papaparse';

    function App() {
      const [data, setData] = useState([]);
      const [filteredData, setFilteredData] = useState([]);
      const [search, setSearch] = useState('');
      const [filters, setFilters] = useState({});
      const tableRef = useRef(null);
      const [rowCount, setRowCount] = useState(0);

      const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          Papa.parse(file, {
            header: true,
            complete: (results) => {
              setData(results.data);
              setFilteredData(results.data);
            },
          });
        }
      };

      const handleSearchChange = (event) => {
        const value = event.target.value.toLowerCase();
        setSearch(value);
        applyFiltersAndSearch(value, filters);
      };

      const handleFilterChange = (column, value) => {
        const newFilters = { ...filters, [column]: value.toLowerCase() };
        setFilters(newFilters);
        applyFiltersAndSearch(search, newFilters);
      };

      const applyFiltersAndSearch = (searchValue, currentFilters) => {
        let filtered = [...data];

        if (searchValue) {
          filtered = filtered.filter((row) =>
            Object.values(row).some((value) =>
              String(value).toLowerCase().includes(searchValue)
            )
          );
        }

        for (const column in currentFilters) {
          if (currentFilters[column]) {
            filtered = filtered.filter((row) =>
              String(row[column]).toLowerCase().includes(currentFilters[column])
            );
          }
        }

        setFilteredData(filtered);
        setRowCount(filtered.length);
      };

      const copyFirstColumnValues = () => {
        if (filteredData.length === 0) return;
        const firstColumnHeader = Object.keys(filteredData[0])[0];
        const values = filteredData.map((row) => row[firstColumnHeader]).join('\n');

        const textArea = document.createElement('textarea');
        textArea.value = values;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Unable to copy', err);
        }
        document.body.removeChild(textArea);
      };

      const copyFirstResult = () => {
        if (filteredData.length === 0) return;
        const firstColumnHeader = Object.keys(filteredData[0])[0];
        const firstValue = filteredData[0][firstColumnHeader];

        const textArea = document.createElement('textarea');
        textArea.value = firstValue;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Unable to copy', err);
        }
        document.body.removeChild(textArea);
      };

      const clearData = () => {
        setData([]);
        setFilteredData([]);
        setSearch('');
        setFilters({});
        setRowCount(0);
      };

      useEffect(() => {
        if (tableRef.current) {
          const ths = tableRef.current.querySelectorAll('th');
          const tds = tableRef.current.querySelectorAll('td');

          ths.forEach((th) => {
            th.style.width = 'auto';
          });

          tds.forEach((td) => {
            td.style.width = 'auto';
          });

          // Adjust column widths based on content
          if (ths.length > 0 && tds.length > 0) {
            const columnWidths = Array(ths.length).fill(0);

            ths.forEach((th, index) => {
              columnWidths[index] = Math.max(columnWidths[index], th.offsetWidth);
            });

            tds.forEach((td, index) => {
              const columnIndex = index % ths.length;
              columnWidths[columnIndex] = Math.max(columnWidths[columnIndex], td.offsetWidth);
            });

            ths.forEach((th, index) => {
              th.style.width = `${columnWidths[index]}px`;
            });

            tds.forEach((td, index) => {
              const columnIndex = index % ths.length;
              td.style.width = `${columnWidths[columnIndex]}px`;
            });
          }
        }
      }, [filteredData]);

      if (data.length === 0) {
        return (
          <div>
            <input type="file" accept=".csv" onChange={handleFileChange} />
          </div>
        );
      }

      const headers = Object.keys(data[0]);

      return (
        <div>
          <input type="file" accept=".csv" onChange={handleFileChange} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={handleSearchChange}
          />
          <button onClick={copyFirstColumnValues}>Copy First Column</button>
          <button onClick={copyFirstResult}>Copy First Result</button>
          <button onClick={clearData}>Clear</button>
          <div>
            <span>Rows: {rowCount}</span>
          </div>
          <table ref={tableRef}>
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>
                    <div>
                      {header}
                      <input
                        type="text"
                        placeholder="Filter..."
                        onChange={(e) => handleFilterChange(header, e.target.value)}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index}>
                  {headers.map((header) => (
                    <td key={header}>{row[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    export default App;
