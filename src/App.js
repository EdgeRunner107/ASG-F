import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [names, setNames] = useState([]);

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
        <h1>ASG 점수리스트</h1>

        <label>
          이름 :{' '}
          <select value={selectedName} onChange={handleNameChange}>
            <option value="">전체</option>
            {names.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <h2>결과</h2>
        {selectedName !== '' && (
          <p><strong>총 점수 합계:</strong> {totalScore}</p>
        )}

        <ul>
          {filteredData.map((row, index) => (
            <li key={index}>{JSON.stringify(row)}</li>
          ))}
        </ul>
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
