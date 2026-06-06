import React, { useState, useEffect } from 'react';
import{
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts'
import './App.css';

export default function App () {
  // 1. State Manaagement
  // Tempat simpan data dan input user
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const[isLoading, setIsLoading] = useState(true);

  // 2. Fetching data
  useEffect(() => {
    const fetchData = async () => {
      try{
        const response = await fetch('https://api.worldbank.org/v2/country/US/indicator/SP.POP.TOTL?date=2012:2016&format=json');
        const json = await response.json();
        console.log("Cek Data API Asli:", json);


      // Data dari word bank 
      const rawData = json[1];

      // Format data
      const formattedData = rawData
        .map(item => ({
          date: item.date,
          value: item.value
        }))
        .sort((a, b) => parseInt(a.date) - parseInt(b.date));

      setData(formattedData);
      setFilteredData(formattedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Gagal ambil data:", error);
      setIsLoading(false);
    }
  };
    fetchData();
  }, []);

  // 3. Filter DATE RANGE
  const handleFilter = () => {
    const result = data.filter(item => {
      const year = parseInt(item.date);
      const min = startYear ? parseInt(startYear) : parseInt(data[0].date); 
      const max = endYear ? parseInt(endYear) : parseInt(data[data.length - 1].date);
      return year >= min && year <= max;
    });
    setFilteredData(result);
  };


// Warna pie chart
  const COLORS = ['#E5E5E5', '#A3A3A3', '#737373', '#404040', '#171717']; 
  const sortedValues = [...filteredData].map(d => d.value).sort((a, b) => a - b);
  const getMonochromeColor = (value) => {
    const rankIndex = sortedValues.indexOf(value);
    if (rankIndex === -1) return '#000000'; 
    if (sortedValues.length <= 1) return COLORS[2]; 
    const targetIndex = Math.round(
      (rankIndex / (sortedValues.length - 1)) * (COLORS.length - 1)
    );

    return COLORS[targetIndex];
  };

if(isLoading) return <h2 style={{ padding: '20px'}}>Loading Data...</h2>;

// 4. Tampilan / RENDER
return (
    <div style={{ padding: '30px', fontFamily: 'roboto', maxWidth: '1200px', margin: '0 auto' }}>

      <h1 style={{ borderBottom: '4px solid #000', paddingBottom: '10px', marginBottom: '10px', textAlign: 'center' }}>
        POPULATION DASHBOARD
      </h1>
      <p style={{ textAlign: 'center', marginBottom: '40px', fontWeight: '500', color: '#333', fontSize: '16px' }}>
        Visualisasi interaktif data pertumbuhan populasi Amerika Serikat (2012-2016). <br />
        Sumber Data: <strong>World Bank API</strong>
      </p>

      {/* Bagian Filter */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '40px',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center' // Tambahan biar filternya di tengah
      }}>
        <input
          type="number"
          placeholder="Start Year"
          value={startYear}
          onChange={(e) => setStartYear(e.target.value)}
          style={inputStyle}
        />
        <span style={{ fontWeight: 'bold' }}>TO</span>
        <input
          type="number"
          placeholder="End Year"
          value={endYear}
          onChange={(e) => setEndYear(e.target.value)}
          style={inputStyle}
        />
        <button onClick={handleFilter} style={buttonStyle}>
          APPLY FILTER
        </button>
      </div>

      {/* Bagian Chart */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '30px'
      }}>

        {/* Line Chart */}
        <div style={chartBoxStyle}>
          <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '10px', textAlign: 'center' }}>LINE CHART</h2>
          
          <div style={{ width: '100%', height: '350px', marginTop: '20px' }}>
            {/* Logika Empty State yang Benar */}
            {filteredData.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: '150px', fontWeight: 'bold', color: '#666' }}>
                Data untuk tahun tersebut tidak tersedia.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="date" stroke="#000" />
                  <YAxis
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                    domain={['dataMin - 1000000', 'dataMax + 1000000']}
                    stroke="#000"
                  />
                  <Tooltip
                    formatter={(value) => [value.toLocaleString(), 'Populasi']}
                    contentStyle={{ border: '2px solid #000', borderRadius: 0, fontWeight: 'bold', backgroundColor: '#fff' }}
                    itemStyle={{ color: '#000000' }}
                    labelStyle={{ color: '#000000' }}
                  />
                  <Line type="linear" dataKey="value" stroke="#000" strokeWidth={3} dot={{ r: 6, fill: '#000' }} activeDot={{ r: 8, fill: '#000' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div style={chartBoxStyle}>
          <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '10px', textAlign: 'center' }}> PIE CHART</h2>

          <div style={{ width: '100%', height: '350px', marginTop: '20px' }}>
            {/* Logika Empty State untuk Pie Chart sekalian */}
            {filteredData.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: '150px', fontWeight: 'bold', color: '#666' }}>
                Data untuk tahun tersebut tidak tersedia.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredData}
                    dataKey="value"
                    nameKey="date"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={(props) => (
                      <text
                        x={props.x}
                        y={props.y}
                        fill="#000000"
                        textAnchor={props.textAnchor}
                        dominantBaseline={props.dominantBaseline}
                        fontWeight="bold"
                      >
                        {props.date}
                      </text>
                    )}
                    stroke="#000"
                    strokeWidth={3}
                  >
                    {filteredData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getMonochromeColor(entry.value)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value.toLocaleString(), 'Populasi']}
                    contentStyle={{
                      border: '2px solid #000',
                      borderRadius: 0,
                      fontWeight: 'bold',
                      backgroundColor: '#fff'
                    }}
                    itemStyle={{ color: '#000000' }}
                    labelStyle={{ color: '#000000' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

{/* Footer */}
      <div style={{ 
        marginTop: '60px', 
        borderTop: '4px solid #000', 
        paddingTop: '30px', 
        textAlign: 'center', 
        fontSize: '14px'
      }}>
        <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
          © 2026 Alfa Dhani
        </p>
      </div>

    </div>
  );
}

// 5. STYLING OBJEK
const inputStyle = {
  padding: '10px 15px',
  border: '3px solid #000',
  fontSize: '16px',
  fontFamily: 'roboto',
  outline: 'none',
  width: '150px'
};

const buttonStyle = {
  padding: '12px 20px',
  backgroundColor: '#000',
  color: '#fff',
  border: '3px solid #000',
  fontSize: '16px',
  fontWeight: 'bold',
  fontFamily: 'roboto',
  cursor: 'pointer',
  boxShadow: '4px 4px 0px #ccc',
  transition: 'all 0.1s ease'
};

const chartBoxStyle = {
  flex: '1 1 400px',
  border: '4px solid #000',
  padding: '20px',
  backgroundColor: '#fff',
  boxShadow: '8px 8px 0px #000'
};
