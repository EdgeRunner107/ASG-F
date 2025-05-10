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

        const nameSet = new Set(result.map(item => item[2]));
        setNames(Array.from(nameSet));
      })
      .catch(error => console.error('API 호출 오류:', error));
  }, []);

  const handleNameChange = (e) => {
    const name = e.target.value;
    setSelectedName(name);

    if (name === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => item[2] === name);
      setFilteredData(filtered);
    }
  };

  const totalScore = filteredData.reduce((sum, item) => sum + (Number(item[1]) || 0), 0);

  return (
    <Page>
      <Layout>
      <h1 style={{ textAlign: 'center' }}>ASG Score Board</h1>


        <label>
          Select Name :{' '}
          <select value={selectedName} onChange={handleNameChange}>
            <option value="">No name</option>
            {names.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <h2>Result</h2>
{selectedName !== '' && (
  <p><strong>Total :</strong> {totalScore}</p>
)}

<Table>
  <thead>
    <tr>
      <th>Time</th>
      <th>Score</th>
      <th>Name</th>
      <th>Donator</th>
    </tr>
  </thead>
  <tbody>
    {filteredData.map((row, index) => (
      <tr key={index}>
        <td>{row[0]}</td>
        <td>{row[1]}</td>
        <td>{row[2]}</td>
        <td>{row[3]}</td>
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
  max-width: 440px;
  height: 100%;
  max-height: 920px;
  background-color: #ffffff;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
`;
