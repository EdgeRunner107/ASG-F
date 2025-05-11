import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [names, setNames] = useState([]);
  const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;

  th, td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: center;
  }

  th {
    background-color: #f5f5f5;
  }
`;

useEffect(() => {
  axios.get(`${process.env.REACT_APP_API_URL}/a`)
    .then(response => {
      const result = response.data;
      setData(result);
      setFilteredData(result);

      // 공백 및 특수공백 제거 후 중복 제거
      const cleanedNames = result
        .map(item => (item[4] || '')
          .replace(/[\u200B-\u200D\uFEFF]/g, '') // 특수 공백 제거
          .trim()
        )
        .filter(name => name !== ''); // 완전히 비어있는 값 제거

      const uniqueNames = Array.from(new Set(cleanedNames));
      setNames(uniqueNames);
    })
    .catch(error => console.error('API 호출 오류:', error));
}, []);

const handleNameChange = (e) => {
  const name = e.target.value;
  setSelectedName(name);

  if (name === '') {
    setFilteredData(data);
  } else {
    const filtered = data.filter(item => {
      const donor = (item[4] || '')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim();
      return donor === name;
    });
    setFilteredData(filtered);
  }
};

  const totalScore = filteredData.reduce((sum, item) => sum + (Number(item[6]) || 0), 0);
  const parseDateFromString = (dateStr) => {
    if (typeof dateStr !== 'string') return ''; // null, undefined, number, object 등 방지
  
    const match = dateStr.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
    if (!match) return dateStr; // 형식에 맞지 않으면 원본 반환
  
    const [_, year, month, day, hour, min, sec] = match.map(Number);
    const date = new Date(year, month, day, hour, min, sec);
  
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };
  

  return (
    <Page>
      <Layout>
      <h1 style={{ textAlign: 'center' }}>ASG Score Board</h1>
    

      <StyledSelect value={selectedName} onChange={handleNameChange}>
      <option value="">전체</option>
        {names.map((name, index) => (
          <option key={index} value={name}>
            {name}
          </option>
        ))}
      </StyledSelect>

        <h2>Result</h2>
{selectedName !== '' && (
  <p><strong>Total :</strong> {totalScore}</p>
)}

<Table>
  <thead>
    <tr>
      <th>Time</th>
      <th>Donator</th>
      <th>Score</th>
      <th>text</th>
      <th>Name</th>
    </tr>
  </thead>
  <tbody>
    {filteredData.map((row, index) => (
      <tr key={index}>
        <td>{parseDateFromString(row[0])}</td>
        <td>{row[1]}</td>
        <td>{row[2]}</td>
        <td>{row[3]?.length > 10 ? `${row[3].slice(0, 10)}...` : row[3]}</td>
        <td>{row[4]}</td>
      </tr>
    ))}
  </tbody>
</Table>
      </Layout>
    </Page>
  );
}

export default App;

const Page = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #e9e9e9;
`;

const Layout = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  width: 100%;
   max-width: 640px; 
  height: 100%;
  max-height: 920px;
  background-color: #ffffff;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
`;
const StyledSelect = styled.select`
  font-size: 1.0rem;
  padding: 8px 12px;
  margin-top: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;